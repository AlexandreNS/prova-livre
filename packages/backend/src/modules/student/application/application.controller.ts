import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import {
  answerStudentApplication,
  applicationIsAvailableOrThrow,
  generateStudentApplication,
  listStudentApplications,
} from '@prova-livre/backend/modules/student/application/application.repository';
import {
  ApplicationCreateSchema,
  ApplicationFeedbackCreateSchema,
  ApplicationFeedbackGetSchema,
  ApplicationGetSchema,
  ApplicationListSchema,
  ApplicationUpdateSchema,
} from '@prova-livre/shared/dtos/student/application/application.dto';

export default async function ApplicationController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof ApplicationListSchema>>(
    '/',
    { schema: ApplicationListSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;

      const applications = await listStudentApplications(companyId, studentId);

      return reply.send(applications);
    },
  );

  fastify.get<SchemaRoute<typeof ApplicationGetSchema>>(
    '/:applicationId',
    { schema: ApplicationGetSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { applicationId } = request.params;

      const applications = await listStudentApplications(companyId, studentId, applicationId);

      return reply.send(applications?.[0]);
    },
  );

  fastify.post<SchemaRoute<typeof ApplicationCreateSchema>>(
    '/:applicationId',
    { schema: ApplicationCreateSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { applicationId } = request.params;

      await applicationIsAvailableOrThrow(companyId, applicationId);
      await generateStudentApplication(companyId, studentId, applicationId);

      return reply.status(204).send();
    },
  );

  fastify.put<SchemaRoute<typeof ApplicationUpdateSchema>>(
    '/:applicationId',
    { schema: ApplicationUpdateSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { applicationId } = request.params;
      const { answers, temp } = request.body;

      await applicationIsAvailableOrThrow(companyId, applicationId);
      await answerStudentApplication({ companyId, studentId, applicationId, answers, isSubmitting: !temp });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof ApplicationFeedbackGetSchema>>(
    '/:studentApplicationId/feedback',
    { schema: ApplicationFeedbackGetSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { studentApplicationId } = request.params;

      const studentApplication = await prisma.studentApplication.findFirst({
        where: {
          id: studentApplicationId,
          studentId,
          application: { companyId },
        },
        select: {
          feedback: true,
          descriptionFeedback: true,
        },
      });

      return reply.send({ sent: Boolean(studentApplication?.feedback) });
    },
  );

  fastify.post<SchemaRoute<typeof ApplicationFeedbackCreateSchema>>(
    '/:studentApplicationId/feedback',
    { schema: ApplicationFeedbackCreateSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { studentApplicationId } = request.params;
      const payload = request.body;

      const application = await prisma.application.findFirstOrThrow({
        where: {
          studentApplications: {
            some: { id: studentApplicationId },
          },
        },
      });

      if (!application.allowFeedback) {
        throw new HttpException('Esta avaliação não está recebendo feedbacks.');
      }

      const studentApplication = await prisma.studentApplication.findFirstOrThrow({
        where: {
          id: studentApplicationId,
          studentId,
          application: { companyId },
        },
        select: {
          feedback: true,
          descriptionFeedback: true,
        },
      });

      if (studentApplication?.feedback) {
        throw new HttpException('O feedback já foi enviado anteriormente.');
      }

      await prisma.studentApplication.update({
        where: { id: studentApplicationId },
        data: { ...payload },
      });

      return reply.status(204).send();
    },
  );
}
