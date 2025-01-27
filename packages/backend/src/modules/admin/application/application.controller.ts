import type { Application, Prisma, Student } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { listStudentApplications } from '@prova-livre/backend/modules/admin/application/application.repository';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  ApplicationClassesCreateSchema,
  ApplicationClassesDeleteSchema,
  ApplicationCreateSchema,
  ApplicationDeleteSchema,
  ApplicationGetSchema,
  ApplicationListSchema,
  ApplicationStudentsCreateSchema,
  ApplicationStudentsListSchema,
  ApplicationUpdateSchema,
} from '@prova-livre/shared/dtos/admin/application/application.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function ApplicationController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof ApplicationListSchema>>(
    '/',
    { schema: ApplicationListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { search, ...rest } = request.query;

      if (!hasPermission(role, 'Application-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const applications = await paginate<Application, Prisma.ApplicationFindManyArgs>(prisma.application, rest, {
        where: {
          companyId, // check company
          OR: cast<Prisma.ApplicationWhereInput[]>(search, () => [
            {
              exam: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
            {
              applicationClasses: {
                some: {
                  class: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            },
          ]),
        },
        include: {
          applicationClasses: true,
          exam: true,
        },
        orderBy: { id: 'desc' },
      });

      return reply.send(applications);
    },
  );

  fastify.get<SchemaRoute<typeof ApplicationGetSchema>>(
    '/:applicationId',
    { schema: ApplicationGetSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;

      if (!hasPermission(role, 'Application-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const application = await prisma.application.findFirst({
        where: {
          companyId, // check company
          id: applicationId,
        },
        include: {
          applicationClasses: true,
          exam: true,
        },
      });

      return reply.send(application);
    },
  );

  fastify.post<SchemaRoute<typeof ApplicationCreateSchema>>(
    '/',
    { schema: ApplicationCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const payload = request.body;

      if (!hasPermission(role, 'Application-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const application = await prisma.application.create({
        data: { ...payload, companyId },
      });

      return reply.send(application);
    },
  );

  fastify.put<SchemaRoute<typeof ApplicationUpdateSchema>>(
    '/:applicationId',
    { schema: ApplicationUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Application-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const application = await prisma.application.update({
        where: { companyId, id: applicationId },
        data: { ...payload, companyId },
      });

      return reply.send(application);
    },
  );

  fastify.delete<SchemaRoute<typeof ApplicationDeleteSchema>>(
    '/:applicationId',
    { schema: ApplicationDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;

      const studentApplication = await prisma.studentApplication.count({
        where: {
          applicationId,
        },
      });

      if (!hasPermission(role, 'Application-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      if (studentApplication) {
        throw new HttpException('Não é possível excluir esta aplicação porque existem alunos vinculados a ela.', 400);
      }

      await prisma.application.deleteMany({
        where: {
          companyId,
          id: applicationId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof ApplicationStudentsListSchema>>(
    '/:applicationId/students',
    { schema: ApplicationStudentsListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;
      const { search, ...rest } = request.query;

      if (!hasPermission(role, 'Application-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const students = await paginate<Student, Prisma.StudentFindManyArgs>(prisma.student, rest, {
        where: {
          studentCompanies: { some: { companyId } }, // check company
          name: cast(search, () => ({
            contains: search,
            mode: 'insensitive',
          })),
          OR: [
            {
              studentApplications: {
                some: { applicationId },
              },
            },
            {
              classesStudent: {
                some: {
                  class: {
                    is: {
                      applicationsClass: { some: { applicationId } },
                    },
                  },
                },
              },
            },
          ],
        },
        orderBy: { id: 'desc' },
      });

      for (const student of students.rows) {
        // @ts-expect-error
        student.studentApplicationResult = await listStudentApplications(companyId, student.id, applicationId);
      }

      return reply.send(students);
    },
  );

  fastify.post<SchemaRoute<typeof ApplicationStudentsCreateSchema>>(
    '/:applicationId/students',
    { schema: ApplicationStudentsCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;
      const { studentId } = request.body;

      if (!hasPermission(role, 'Application-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.application.findFirstOrThrow({
        where: { companyId, id: applicationId }, // check company
      });

      const studentApplication = await prisma.studentApplication.findFirst({
        where: { studentId, applicationId },
        select: { id: true },
      });

      if (studentApplication) {
        throw new HttpException('Estudante já foi inscrito nesta aplicação de prova.');
      }

      await prisma.studentApplication.create({
        data: { studentId, applicationId },
      });

      return reply.status(204).send();
    },
  );

  fastify.post<SchemaRoute<typeof ApplicationClassesCreateSchema>>(
    '/:applicationId/classes',
    { schema: ApplicationClassesCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId } = request.params;
      const { classId } = request.body;

      if (!hasPermission(role, 'Application-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.application.findFirstOrThrow({
        where: { companyId, id: applicationId }, // check company
      });

      const applicationClass = await prisma.applicationClass.findFirst({
        where: { classId, applicationId },
        select: { id: true },
      });

      if (applicationClass) {
        throw new HttpException('Esta turma já foi adicionada na aplicação de prova.');
      }

      await prisma.applicationClass.create({
        data: { classId, applicationId },
      });

      return reply.status(204).send();
    },
  );

  fastify.delete<SchemaRoute<typeof ApplicationClassesDeleteSchema>>(
    '/:applicationId/classes/:classId',
    { schema: ApplicationClassesDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { applicationId, classId } = request.params;

      if (!hasPermission(role, 'Application-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.application.findFirstOrThrow({
        where: { companyId, id: applicationId }, // check company
      });

      await prisma.applicationClass.deleteMany({
        where: {
          classId,
          applicationId,
        },
      });

      return reply.status(204).send();
    },
  );
}
