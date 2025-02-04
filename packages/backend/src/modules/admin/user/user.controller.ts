import type { Prisma, User } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { sendEmailRegistration } from '@prova-livre/backend/modules/admin/user/user.repository';
import { templatesList } from '@prova-livre/backend/services/Mail';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  UserCreateSchema,
  UserDeleteSchema,
  UserGetSchema,
  UserListSchema,
  UserUpdateSchema,
} from '@prova-livre/shared/dtos/admin/user/user.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function UserController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof UserListSchema>>('/', { schema: UserListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { search, ...rest } = request.query;

    if (!hasPermission(role, 'User-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const users = await paginate<User, Prisma.UserFindManyArgs>(prisma.user, rest, {
      where: {
        userCompanyRoles: { some: { companyId } },
        OR: cast(search, () => [
          {
            name: { contains: search, mode: 'insensitive' },
          },
          {
            email: { contains: search, mode: 'insensitive' },
          },
        ]),
      },
      include: { userCompanyRoles: { where: { companyId } } },
      orderBy: { name: 'asc' },
    });

    for (const user of users.rows) {
      // @ts-ignore
      user.role = user.userCompanyRoles.at(-1)?.role;
    }

    return reply.send(users);
  });

  fastify.get<SchemaRoute<typeof UserGetSchema>>('/:userId', { schema: UserGetSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { userId } = request.params;

    if (!hasPermission(role, 'User-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const user = await prisma.user.findFirst({
      where: { userCompanyRoles: { some: { companyId } }, id: userId },
      include: {
        userCompanyRoles: { where: { companyId } },
      },
    });

    // @ts-ignore
    user.role = user.userCompanyRoles.at(-1)?.role;

    return reply.send(user);
  });

  fastify.post<SchemaRoute<typeof UserCreateSchema>>('/', { schema: UserCreateSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { role: roleNewUser, ...payload } = request.body;

    if (!hasPermission(role, 'User-Write')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const userExists = await prisma.user.findFirst({
      where: {
        email: payload.email,
        userCompanyRoles: { some: { companyId } },
      },
      include: {
        userCompanyRoles: {
          where: { companyId },
          include: { company: true },
        },
      },
    });

    if (userExists) {
      throw new HttpException(
        `Usuário já está vinculado na instituição: ${userExists.userCompanyRoles.at(0)?.company.name}`,
      );
    }

    let emailTemplate: keyof typeof templatesList = 'auth:add-company';

    let user = await prisma.user.findFirst({
      where: { email: payload.email },
    });

    // criação do usuário caso não exista
    if (!user) {
      emailTemplate = 'auth:new-user';

      user = await prisma.user.create({
        data: { ...payload },
      });
    }

    // vinculação do usuário na instituição
    let userCompanyRole = await prisma.userCompanyRole.findFirst({
      where: {
        companyId,
        userId: user.id,
      },
      include: { company: true },
    });

    if (!userCompanyRole) {
      userCompanyRole = await prisma.userCompanyRole.create({
        data: { companyId, userId: user.id, role: roleNewUser },
        include: { company: true },
      });
    }

    sendEmailRegistration({
      template: emailTemplate,
      user,
      companyName: userCompanyRole?.company.name,
    });

    return reply.send({ ...user, role: roleNewUser });
  });

  fastify.put<SchemaRoute<typeof UserUpdateSchema>>(
    '/:userId',
    { schema: UserUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { userId } = request.params;
      const { role: newRoleUser, ...payload } = request.body;

      if (!hasPermission(role, 'User-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      let user = await prisma.user.findFirst({
        where: { NOT: { id: userId }, email: payload.email },
      });

      if (user) {
        throw new HttpException(`O e-mail ${user.email} já existe em outro cadastro`);
      }

      await prisma.userCompanyRole.updateMany({
        where: { userId, companyId },
        data: { role: newRoleUser },
      });

      user = await prisma.user.update({
        where: { id: userId, userCompanyRoles: { some: { companyId } } },
        data: { ...payload },
        include: { userCompanyRoles: { where: { companyId } } },
      });

      // @ts-ignore
      user.role = user.userCompanyRoles.at(-1)?.role;

      return reply.send(user);
    },
  );

  fastify.delete<SchemaRoute<typeof UserDeleteSchema>>(
    '/:userId',
    { schema: UserDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { userId } = request.params;

      if (!hasPermission(role, 'User-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.userCompanyRole.deleteMany({ where: { companyId, userId } });

      return reply.status(204).send();
    },
  );
}
