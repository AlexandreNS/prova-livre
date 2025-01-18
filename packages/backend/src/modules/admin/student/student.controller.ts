import type { Prisma, Student } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { AnyObject } from '@prova-livre/shared/types/util.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import Logger from '@prova-livre/backend/services/Logger';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  StudentCreateSchema,
  StudentDeleteSchema,
  StudentGetSchema,
  StudentListSchema,
  StudentUpdateSchema,
} from '@prova-livre/shared/dtos/admin/student/student.dto';
import { add } from '@prova-livre/shared/helpers/date.helper';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { random } from '@prova-livre/shared/helpers/string.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';
import argon2 from 'argon2';

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
        include: { studentCompanies: { include: { company: true } } },
      });

      if (studentExists) {
        throw new HttpException(
          `Estudante já está vinculado na instituição: ${studentExists.studentCompanies.at(0)?.company.name}`,
        );
      }

      const emailData: AnyObject = { type: 'add-company' };

      // criação do estudante caso não exista
      let student = await prisma.student.upsert({
        where: { email: payload.email },
        create: { ...payload },
        update: {},
      });

      if (!student.temporaryPassword) {
        emailData.type = 'new-user';

        const temporaryPassword = random();
        student = await prisma.student.update({
          where: { id: student.id },
          data: {
            temporaryPassword: await argon2.hash(temporaryPassword),
            tempPassExpiredAt: add(new Date(), { minutes: 5 }),
          },
        });

        emailData.temporaryPassword = temporaryPassword;
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

      emailData.company = studentCompany.company.name;

      // TODO: send email
      Logger.log({ emailData }, 'log');

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
