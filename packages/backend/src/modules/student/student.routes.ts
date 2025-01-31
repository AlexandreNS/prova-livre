import type { FastifyInstance } from 'fastify';

import HttpException from '@prova-livre/backend/exceptions/http.exception';
import ApplicationController from '@prova-livre/backend/modules/student/application/application.controller';
import AuthController from '@prova-livre/backend/modules/student/auth/auth.controller';
import CompanyController from '@prova-livre/backend/modules/student/company/company.controller';
import MeController from '@prova-livre/backend/modules/student/me/me.controller';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';

export default async function StudentRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request) => {
    const secret = request.routeOptions?.schema?.security;
    const { role = null } = request.user || {};

    if ((Boolean(secret?.length) || secret === undefined) && role !== 'student') {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }
  });

  fastify.register(ApplicationController, { prefix: '/applications' });
  fastify.register(AuthController, { prefix: '/auth' });
  fastify.register(CompanyController, { prefix: '/companies' });
  fastify.register(MeController, { prefix: '/me' });
}
