import type { UserRoleEnum } from '@prisma/client';

import cookiePlugin from '@fastify/cookie';
import cors from '@fastify/cors';
import formbodyPlugin from '@fastify/formbody';
import jwtPlugin from '@fastify/jwt';
import multipartPlugin from '@fastify/multipart';
import swaggerPlugin from '@fastify/swagger';
import swaggerUiPlugin from '@fastify/swagger-ui';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import AdminRoutes from '@prova-livre/backend/modules/admin/admin.routes';
import { getRole } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import StudentRoutes from '@prova-livre/backend/modules/student/student.routes';
import Logger from '@prova-livre/backend/services/Logger';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import Fastify, { type FastifyRequest } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      companyId: number;
      id: number;
      role: 'student' | 'su' | UserRoleEnum;
    };
  }
}

const { NODE_ENV, PORT, HOST } = process.env;

const isProduction = NODE_ENV === 'production';

const fastify = Fastify({
  logger: !isProduction,
});

fastify.setErrorHandler((error: any, request, reply) => {
  Logger.error(error);

  if (!isProduction) {
    return reply.status(error?.statusCode ?? 400).send(error);
  }

  let status = 400;
  let message = 'Houve um erro inesperado';

  if (error instanceof HttpException) {
    status = error.statusCode;
    message = error.message;
  }

  return reply.status(status).send({ message });
});

fastify.register(formbodyPlugin);

fastify.register(multipartPlugin, { attachFieldsToBody: 'keyValues' });

fastify.register(cors, {
  credentials: true,
});

fastify.register(cookiePlugin, {
  secret: process.env.COOKIE_SECRET_KEY as string,
});

const messages = {
  noAuthorizationInHeaderMessage: 'No Authorization was found in request',
  noAuthorizationInCookieMessage: 'No Authorization was found in request',
};

fastify.register(jwtPlugin, {
  secret: async function (request: FastifyRequest) {
    if (request.url.startsWith('/student')) {
      return process.env.AUTH_STUDENT_SECRET_KEY as string;
    }

    return process.env.AUTH_ADMIN_SECRET_KEY as string;
  },
  messages: messages,
  cookie: {
    cookieName: 'token',
    signed: true,
  },
});

fastify.addHook('onRequest', async (request, reply) => {
  const secret = request.routeOptions?.schema?.security;
  if (Boolean(secret?.length) || secret === undefined) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }
});

fastify.register(swaggerPlugin, {
  swagger: {
    info: {
      title: 'Documentação do Prova Livre',
      description: '',
      version: '0.1.0',
    },
    securityDefinitions: {
      AdminBearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Autenticação utilizando Authorization: Bearer',
      },
      AdminCookie: {
        type: 'apiKey',
        name: 'cookie',

        in: 'header',
        description: 'Autenticação utilizando cookie:token=',
      },
      StudentBearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Autenticação utilizando Authorization: Bearer',
      },
    },
  },
});

fastify.register(swaggerUiPlugin, {
  routePrefix: '/docs',
  uiHooks: {
    onRequest: async function (request) {
      const { id: userId, companyId } = request.user;
      const role = await getRole(userId, companyId);

      if (!hasPermission(role, 'Api-Docs')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }
    },
  },
});

fastify.get('/', { schema: { security: [] } }, async (request, reply) => {
  const date = new Date();

  return reply.send({
    date: date,
    timeStamp: date.getTime(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneOffset: date.getTimezoneOffset(),
  });
});

fastify.register(AdminRoutes, { prefix: '/admin' });
fastify.register(StudentRoutes, { prefix: '/student' });

(async function main() {
  try {
    await fastify.listen({
      host: HOST || 'localhost',
      port: number(PORT) || 3333,
    });

    await fastify.ready();
    fastify.swagger();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
