import type { Class, Prisma } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  ClassCreateSchema,
  ClassDeleteSchema,
  ClassGetSchema,
  ClassListSchema,
  ClassStudentsCreateSchema,
  ClassStudentsDeleteSchema,
  ClassUpdateSchema,
} from '@prova-livre/shared/dtos/admin/class/class.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function ClassController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof ClassListSchema>>('/', { schema: ClassListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { search, applicationId, ...rest } = request.query;

    if (!hasPermission(role, 'Class-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const classes = await paginate<Class, Prisma.ClassFindManyArgs>(prisma.class, rest, {
      where: {
        companyId,
        applicationsClass: cast(applicationId, () => ({ some: { applicationId } })),
        OR: cast(search, () => [
          {
            name: { contains: search, mode: 'insensitive' },
          },
          {
            description: { contains: search, mode: 'insensitive' },
          },
        ]),
      },
      orderBy: { id: 'desc' },
    });

    return reply.send(classes);
  });

  fastify.get<SchemaRoute<typeof ClassGetSchema>>('/:classId', { schema: ClassGetSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { classId } = request.params;

    if (!hasPermission(role, 'Class-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const classData = await prisma.class.findFirst({
      where: {
        companyId,
        id: classId,
      },
    });

    return reply.send(classData);
  });

  fastify.post<SchemaRoute<typeof ClassCreateSchema>>('/', { schema: ClassCreateSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const payload = request.body;

    if (!hasPermission(role, 'Class-Write')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const classData = await prisma.class.create({
      data: { ...payload, companyId },
    });

    return reply.send(classData);
  });

  fastify.put<SchemaRoute<typeof ClassUpdateSchema>>(
    '/:classId',
    { schema: ClassUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { classId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Class-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const classData = await prisma.class.update({
        where: { companyId, id: classId },
        data: { ...payload, companyId },
      });

      return reply.send(classData);
    },
  );

  fastify.delete<SchemaRoute<typeof ClassDeleteSchema>>(
    '/:classId',
    { schema: ClassDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { classId } = request.params;

      if (!hasPermission(role, 'Class-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.class.deleteMany({
        where: {
          companyId,
          id: classId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.post<SchemaRoute<typeof ClassStudentsCreateSchema>>(
    '/:classId/students',
    { schema: ClassStudentsCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { classId } = request.params;
      const { studentId } = request.body;

      if (!hasPermission(role, 'Class-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      // Check company
      await prisma.class.findFirstOrThrow({
        where: { companyId, id: classId },
      });

      // Check classStudent
      const classStudentExist = await prisma.classStudent.findFirst({
        where: {
          studentId,
          classId,
        },
        select: { student: { select: { id: true } } },
      });

      if (classStudentExist) {
        const { student } = classStudentExist;
        throw new HttpException(`O estudante #${student.id} já foi adicionado na Turma.`);
      }

      const classStudent = await prisma.classStudent.create({
        data: { studentId, classId },
      });

      return reply.send(classStudent);
    },
  );

  fastify.delete<SchemaRoute<typeof ClassStudentsDeleteSchema>>(
    '/:classId/students/:studentId',
    { schema: ClassStudentsDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { classId, studentId } = request.params;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.classStudent.deleteMany({
        where: {
          class: { companyId },
          classId,
          studentId,
        },
      });

      return reply.status(204).send();
    },
  );
}
