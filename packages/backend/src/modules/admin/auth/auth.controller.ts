import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { getRole, isSuperUser, jwtSign } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import { AuthCompanySignSchema, AuthLoginSchema, AuthMeSchema } from '@prova-livre/shared/dtos/admin/auth/auth.dto';
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
    });

    const token = await jwtSign(reply, user.id, company?.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { accessedAt: new Date() },
    });

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

    await prisma.user.update({
      where: { id: userId },
      data: { accessedAt: new Date() },
    });

    return reply.send({ ...user, role, company });
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
