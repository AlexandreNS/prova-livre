import type { Prisma, Student } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { sendEmailRegistration } from '@prova-livre/backend/modules/admin/student/student.repository';
import { type templatesList } from '@prova-livre/backend/services/Mail';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  StudentCreateSchema,
  StudentDeleteSchema,
  StudentGetSchema,
  StudentListSchema,
  StudentUpdateSchema,
} from '@prova-livre/shared/dtos/admin/student/student.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function StudentController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof StudentListSchema>>('/', { schema: StudentListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { search, classId, ...rest } = request.query;

    if (!hasPermission(role, 'Student-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const students = await paginate<Student, Prisma.StudentFindManyArgs>(prisma.student, rest, {
      where: {
        studentCompanies: { some: { companyId } },
        classesStudent: cast(classId, () => ({ some: { classId } })),
        OR: cast(search, () => [
          {
            name: { contains: search, mode: 'insensitive' },
          },
          {
            email: { contains: search, mode: 'insensitive' },
          },
        ]),
      },
      orderBy: { name: 'asc' },
    });

    return reply.send(students);
  });

  fastify.get<SchemaRoute<typeof StudentGetSchema>>(
    '/:studentId',
    { schema: StudentGetSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { studentId } = request.params;

      if (!hasPermission(role, 'Student-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const student = await prisma.student.findFirst({
        where: { studentCompanies: { some: { companyId } }, id: studentId },
      });

      return reply.send(student);
    },
  );

  fastify.post<SchemaRoute<typeof StudentCreateSchema>>(
    '/',
    { schema: StudentCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const payload = request.body;

      if (!hasPermission(role, 'Student-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const studentExists = await prisma.student.findFirst({
        where: {
          email: payload.email,
          studentCompanies: { some: { companyId } },
        },
        include: {
          studentCompanies: {
            where: { companyId },
            include: { company: true },
          },
        },
      });

      if (studentExists) {
        throw new HttpException(
          `Estudante já está vinculado na instituição: ${studentExists.studentCompanies.at(0)?.company.name}`,
        );
      }

      let emailTemplate: keyof typeof templatesList = 'auth:add-company';

      let student = await prisma.student.findFirst({
        where: { email: payload.email },
      });

      // criação do estudante caso não exista
      if (!student) {
        emailTemplate = 'auth:new-user';

        student = await prisma.student.create({
          data: { ...payload },
        });
      }

      // vinculação do estudante na instituição
      let studentCompany = await prisma.studentCompany.findFirst({
        where: {
          companyId,
          studentId: student.id,
        },
        include: { company: true },
      });

      if (!studentCompany) {
        studentCompany = await prisma.studentCompany.create({
          data: { companyId, studentId: student.id },
          include: { company: true },
        });
      }

      sendEmailRegistration({
        template: emailTemplate,
        student,
        companyName: studentCompany.company.name,
      });

      return reply.send(student);
    },
  );

  fastify.put<SchemaRoute<typeof StudentUpdateSchema>>(
    '/:studentId',
    { schema: StudentUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { studentId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Student-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      let student = await prisma.student.findFirst({
        where: { NOT: { id: studentId }, email: payload.email },
      });

      if (student) {
        throw new HttpException(`O e-mail ${student.email} já existe em outro cadastro`);
      }

      student = await prisma.student.update({
        where: { id: studentId, studentCompanies: { some: { companyId } } },
        data: { ...payload },
      });

      return reply.send(student);
    },
  );

  fastify.delete<SchemaRoute<typeof StudentDeleteSchema>>(
    '/:studentId',
    { schema: StudentDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { studentId } = request.params;

      if (!hasPermission(role, 'Student-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.studentCompany.deleteMany({ where: { companyId, studentId } });

      return reply.status(204).send();
    },
  );
}
