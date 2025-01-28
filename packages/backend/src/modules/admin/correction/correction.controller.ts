import type { Prisma, StudentApplication } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  CorrectionGetSchema,
  CorrectionListSchema,
  CorrectionUpdateSchema,
} from '@prova-livre/shared/dtos/admin/correction/correction.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function CorrectionController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof CorrectionListSchema>>(
    '/',
    { schema: CorrectionListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { search, isCorrected, ...rest } = request.query;

      if (!hasPermission(role, 'Correction-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const corrections = await paginate<StudentApplication, Prisma.StudentApplicationFindManyArgs>(
        prisma.studentApplication,
        rest,
        {
          where: {
            student: {
              studentCompanies: { some: { companyId } }, // check company
            },
            application: { companyId }, // check company
            submittedAt: { not: null },

            studentApplicationQuestions: cast(isCorrected, () => ({
              some: {
                studentScore: isCorrected ? { not: null } : null,
              },
            })),
            OR: cast(search, () => [
              {
                student: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  email: { contains: search, mode: 'insensitive' },
                },
              },
            ]),
          },
          include: {
            student: true,
            application: true,
            studentApplicationQuestions: true,
          },
          orderBy: [
            {
              application: { endedAt: 'asc' },
            },
            {
              application: { startedAt: 'asc' },
            },
            { id: 'desc' },
          ],
        },
      );

      for (const correction of corrections.rows) {
        // @ts-expect-error
        correction.isCorrected = correction.studentApplicationQuestions.every(
          // @ts-expect-error
          ({ studentScore }) => typeof studentScore === 'number',
        );
      }

      return reply.send(corrections);
    },
  );

  fastify.get<SchemaRoute<typeof CorrectionGetSchema>>(
    '/:studentApplicationId',
    { schema: CorrectionGetSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { studentApplicationId } = request.params;

      if (!hasPermission(role, 'Correction-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const studentApplication = await prisma.studentApplication.findFirstOrThrow({
        where: {
          id: studentApplicationId,
          student: {
            studentCompanies: { some: { companyId } }, // check company
          },
          application: { companyId }, // check company
          submittedAt: { not: null },
        },
        include: {
          student: true,
          application: true,
          studentApplicationQuestions: {
            include: {
              question: {
                include: { questionOptions: true },
              },
            },
          },
        },
      });

      return reply.send(studentApplication);
    },
  );

  fastify.put<SchemaRoute<typeof CorrectionUpdateSchema>>(
    '/:studentApplicationId',
    { schema: CorrectionUpdateSchema },
    async (request, reply) => {
      const { id: userId, role, companyId } = request.user;
      const { studentApplicationId } = request.params;
      const { studentApplicationQuestionId, ...payload } = request.body;

      if (!hasPermission(role, 'Correction-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.studentApplicationQuestion.update({
        where: {
          studentApplication: {
            student: {
              studentCompanies: { some: { companyId } }, // check company
            },
            application: { companyId }, // check company
          },
          studentApplicationId,
          id: studentApplicationQuestionId,
        },
        data: {
          ...payload,
          corretorUserId: userId,
        },
      });

      return reply.status(204).send(null);
    },
  );

  // fastify.delete<SchemaRoute<typeof AppDeleteSchema>>(
  //   '/:appId',
  //   { schema: AppDeleteSchema },
  //   async (request, reply) => {
  //     const { role, companyId } = request.user;
  //     const { appId } = request.params;
  //
  //     if (!hasPermission(role, 'App-Delete')) {
  //       throw new HttpException(ErrorCodeString.NO_PERMISSION);
  //     }
  //
  //     await prisma.app.deleteMany({
  //       where: {
  //         companyId,
  //         id: appId,
  //       },
  //     });
  //
  //     return reply.status(204).send();
  //   },
  // );
}
