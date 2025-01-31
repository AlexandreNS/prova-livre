import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import { CompanyListSchema } from '@prova-livre/shared/dtos/student/company/company.dto';

export default async function CompanyController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof CompanyListSchema>>('/', { schema: CompanyListSchema }, async (request, reply) => {
    const { id: studentId } = request.user;

    const companies = await prisma.company.findMany({
      where: {
        studentsCompany: { some: { studentId } },
      },
      orderBy: { id: 'desc' },
    });

    return reply.send(companies);
  });
}
