import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import { CompanyListSchema } from '@prova-livre/shared/dtos/admin/company/company.dto';

export default async function CompanyController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof CompanyListSchema>>('/', { schema: CompanyListSchema }, async (request, reply) => {
    const { id: userId, role } = request.user;

    const companies = await prisma.company.findMany({
      where: {
        userCompanyRoles: role === 'su' ? undefined : { some: { userId } },
      },
      orderBy: { id: 'desc' },
    });

    return reply.send(companies);
  });
}
