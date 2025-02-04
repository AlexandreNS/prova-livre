import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import { UserRoleEnum } from '@prisma/client';
import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { getRole } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import { getRolesAllowCreateCompanies } from '@prova-livre/backend/modules/admin/system-settings/system-settings.repository';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  SystemSettingsHasCreateCompanyPermissionSchema,
  SystemSettingsListSchema,
  SystemSettingsUpdateSchema,
} from '@prova-livre/shared/dtos/admin/system-settings/system-settings.dto';

export default async function SystemSettingsController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof SystemSettingsListSchema>>(
    '/',
    { schema: SystemSettingsListSchema },
    async (request, reply) => {
      const { id: userId, companyId } = request.user;

      if ((await getRole(userId, companyId)) !== 'su') {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const systemSettings = await prisma.systemSettings.findMany();

      reply.send(systemSettings);
    },
  );

  fastify.put<SchemaRoute<typeof SystemSettingsUpdateSchema>>(
    '/:systemSettingsId',
    { schema: SystemSettingsUpdateSchema },
    async (request, reply) => {
      const { id: userId, companyId } = request.user;
      const { systemSettingsId } = request.params;
      const payload = request.body;

      if ((await getRole(userId, companyId)) !== 'su') {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      if (!payload.enabled) {
        payload.value = null;
      }

      await prisma.systemSettings.update({
        where: { id: systemSettingsId },
        data: { ...payload },
      });

      reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof SystemSettingsHasCreateCompanyPermissionSchema>>(
    '/has-create-company-permission',
    { schema: SystemSettingsHasCreateCompanyPermissionSchema },
    async (request, reply) => {
      const { id: userId, role } = request.user;

      const hasPermission =
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

      reply.send({ allowed: !!hasPermission });
    },
  );
}
