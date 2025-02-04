import type { Prisma, User } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { getRole } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import { getRolesAllowCreateCompanies } from '@prova-livre/backend/modules/admin/system-settings/system-settings.repository';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  CompanyCreateSchema,
  CompanyGetSchema,
  CompanyListSchema,
  CompanyUpdateSchema,
  CompanyUserListSchema,
} from '@prova-livre/shared/dtos/admin/company/company.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function CompanyController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof CompanyListSchema>>('/', { schema: CompanyListSchema }, async (request, reply) => {
    const { id: userId, role } = request.user;

    const companies = await prisma.company.findMany({
      where: {
        userCompanyRoles: role === 'su' ? undefined : { some: { userId } },
      },
      orderBy: { id: 'asc' },
      include: {
        userCompanyRoles: {
          where: { userId },
        },
      },
    });

    for (const company of companies) {
      // @ts-ignore
      company.role = role === 'su' ? role : company.userCompanyRoles.at(-1)?.role;
    }

    return reply.send(companies);
  });

  fastify.get<SchemaRoute<typeof CompanyGetSchema>>(
    '/:companyId',
    { schema: CompanyGetSchema },
    async (request, reply) => {
      const { id: userId, role } = request.user;
      const { companyId } = request.params;

      const company = await prisma.company.findFirst({
        where: {
          id: companyId,
          userCompanyRoles: role === 'su' ? undefined : { some: { userId } },
        },
        include: {
          userCompanyRoles: {
            where: { userId },
          },
        },
      });

      if (company) {
        // @ts-ignore
        company.role = role === 'su' ? role : company.userCompanyRoles.at(-1)?.role;
      }

      return reply.send(company);
    },
  );

  fastify.post<SchemaRoute<typeof CompanyCreateSchema>>(
    '/',
    { schema: CompanyCreateSchema },
    async (request, reply) => {
      const { id: userId, companyId } = request.user;
      const { name } = request.body;
      const role = await getRole(userId, companyId);

      if (role !== 'su' && !(await getRolesAllowCreateCompanies()).includes(role as string)) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const company = await prisma.company.create({
        data: {
          name,
          userCompanyRoles:
            role !== 'su'
              ? {
                  create: {
                    role: 'owner',
                    userId,
                  },
                }
              : undefined,
        },
      });

      return reply.send(company);
    },
  );

  fastify.put<SchemaRoute<typeof CompanyUpdateSchema>>(
    '/:companyId',
    { schema: CompanyUpdateSchema },
    async (request, reply) => {
      const { id: userId, role } = request.user;
      const { companyId } = request.params;
      const payload = request.body;

      const userCompanyRole = await prisma.userCompanyRole.findFirst({
        where: { userId, companyId },
      });

      if (!hasPermission(role === 'su' ? role : userCompanyRole?.role, 'Company-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const company = await prisma.company.update({
        where: { id: companyId },
        data: payload,
      });

      return reply.send(company);
    },
  );

  fastify.get<SchemaRoute<typeof CompanyUserListSchema>>(
    '/:companyId/users',
    { schema: CompanyUserListSchema },
    async (request, reply) => {
      const { id: userId, role } = request.user;
      const { companyId } = request.params;
      const { search, ...rest } = request.query;

      const userCompanyRole = await prisma.userCompanyRole.findFirst({
        where: { userId, companyId },
      });

      if (!hasPermission(role === 'su' ? role : userCompanyRole?.role, 'Company-Write')) {
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
        select: {
          id: true,
          name: true,
          email: true,
          userCompanyRoles: {
            where: { companyId },
          },
        },
        orderBy: { id: 'desc' },
      });

      for (const user of users.rows) {
        // @ts-ignore
        user.role = user.userCompanyRoles.at(-1)?.role;
      }

      return reply.send(users);
    },
  );
}
