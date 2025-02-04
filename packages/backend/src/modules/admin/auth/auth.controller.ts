import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import { UserRoleEnum } from '@prisma/client';
import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import {
  getRole,
  isSuperUser,
  jwtSign,
  jwtSignResetPassword,
  jwtVerifyResetPassword,
  setCookie,
} from '@prova-livre/backend/modules/admin/auth/auth.repository';
import { getRolesAllowCreateCompanies } from '@prova-livre/backend/modules/admin/system-settings/system-settings.repository';
import { renderTemplateEmail, sendMail } from '@prova-livre/backend/services/Mail';
import {
  AuthCompanySignSchema,
  AuthCookieSchema,
  AuthLoginSchema,
  AuthMeSchema,
  AuthRequestPasswordRecoverySchema,
  AuthResetPasswordSchema,
  AuthVerifyTokenResetPasswordSchema,
} from '@prova-livre/shared/dtos/admin/auth/auth.dto';
import { add } from '@prova-livre/shared/helpers/date.helper';
import { random } from '@prova-livre/shared/helpers/string.helper';
import argon2 from 'argon2';

export default async function AuthController(fastify: FastifyInstance) {
  fastify.post<SchemaRoute<typeof AuthLoginSchema>>('/', { schema: AuthLoginSchema }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !(await argon2.verify(user?.password as string, password))) {
      throw new HttpException('E-mail ou senha incorretos', 403);
    }

    const company = await prisma.company.findFirst({
      where: {
        userCompanyRoles: isSuperUser(user.id) ? undefined : { some: { userId: user.id } },
      },
      select: {
        id: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!company) {
      throw new HttpException('Usuário não possui vinculo em uma instituição', 403);
    }

    const token = await jwtSign(reply, user.id, company.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { accessedAt: new Date() },
    });

    return reply.send({ token });
  });

  fastify.post<SchemaRoute<typeof AuthVerifyTokenResetPasswordSchema>>(
    '/verify-token-reset-password',
    { schema: AuthVerifyTokenResetPasswordSchema },
    async (request, reply) => {
      const { securityCode } = request.body;

      const user = await jwtVerifyResetPassword(securityCode);

      return reply.status(200).send(user);
    },
  );

  fastify.post<SchemaRoute<typeof AuthResetPasswordSchema>>(
    '/reset-password',
    { schema: AuthResetPasswordSchema },
    async (request, reply) => {
      const { securityCode, password, passwordConfirm } = request.body;

      const user = await jwtVerifyResetPassword(securityCode);

      if (password !== passwordConfirm) {
        throw new HttpException('As senhas não conferem!');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: await argon2.hash(password),
          temporaryPassword: null,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.post<SchemaRoute<typeof AuthRequestPasswordRecoverySchema>>(
    '/request-password-recovery',
    { schema: AuthRequestPasswordRecoverySchema },
    async (request, reply) => {
      const { email } = request.body;

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        throw new HttpException('Não identificamos um usuário válido com os dados informados.');
      }

      const hashedPass = random(10);
      const securityCode = jwtSignResetPassword(user.id, hashedPass);

      sendMail({
        to: [user.email],
        subject: 'Redefinição de Senha',
        html: renderTemplateEmail('auth:reset-password', {
          MODULE_TITLE: 'Área Administrativa',
          URL_RESET_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/admin/reset-password?securityCode=${securityCode}`,
        }),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          temporaryPassword: await argon2.hash(hashedPass),
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof AuthCookieSchema>>('/cookie', { schema: AuthCookieSchema }, async (request, reply) => {
    const { token, redirect } = request.query;

    setCookie(reply, token, add(new Date(), { hours: 24 }));

    if (redirect) {
      return reply.redirect(redirect);
    }

    return reply.send({ token });
  });

  fastify.get<SchemaRoute<typeof AuthMeSchema>>('/me', { schema: AuthMeSchema }, async (request, reply) => {
    const { id: userId, companyId } = request.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userCompanyRoles: isSuperUser(userId) ? undefined : { some: { userId } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const role = await getRole(userId, companyId);

    const hasCreateCompanyPermission =
      role === 'su' ||
      (await prisma.userCompanyRole.count({
        where: {
          userId,
          role: {
            in: (await getRolesAllowCreateCompanies()).filter((value) => {
              return Object.values(UserRoleEnum).includes(value as keyof typeof UserRoleEnum);
            }) as (keyof typeof UserRoleEnum)[],
          },
        },
      }));

    await prisma.user.update({
      where: { id: userId },
      data: { accessedAt: new Date() },
    });

    return reply.send({
      ...user,
      role,
      company,
      permissions: {
        createCompany: Boolean(hasCreateCompanyPermission),
      },
    });
  });

  fastify.post<SchemaRoute<typeof AuthCompanySignSchema>>(
    '/company',
    { schema: AuthCompanySignSchema },
    async (request, reply) => {
      const { id: userId, companyId: authCompanyId } = request.user;
      const { companyId } = request.body;

      // check auth company
      if (!isSuperUser(userId)) {
        await prisma.userCompanyRole.findFirstOrThrow({
          where: { userId, companyId: authCompanyId },
        });
      }

      const token = await jwtSign(reply, userId, companyId);

      return reply.send({ token });
    },
  );
}
