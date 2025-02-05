import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import {
  jwtSign,
  jwtSignResetPassword,
  jwtVerifyResetPassword,
} from '@prova-livre/backend/modules/student/auth/auth.repository';
import { renderTemplateEmail, sendMail } from '@prova-livre/backend/services/Mail';
import {
  AuthCompanySignSchema,
  AuthLoginSchema,
  AuthMeSchema,
  AuthRequestPasswordRecoverySchema,
  AuthResetPasswordSchema,
  AuthVerifyTokenResetPasswordSchema,
} from '@prova-livre/shared/dtos/student/auth/auth.dto';
import { random } from '@prova-livre/shared/helpers/string.helper';
import argon2 from 'argon2';

export default async function AuthController(fastify: FastifyInstance) {
  fastify.post<SchemaRoute<typeof AuthLoginSchema>>('/', { schema: AuthLoginSchema }, async (request, reply) => {
    const { email, password } = request.body;

    const student = await prisma.student.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!student || !(await argon2.verify(student?.password as string, password))) {
      throw new HttpException('E-mail ou senha incorretos', 403);
    }

    const company = await prisma.company.findFirst({
      where: {
        studentsCompany: { some: { studentId: student.id } },
      },
      select: {
        id: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!company) {
      throw new HttpException('Estudante não possui vinculo em uma instituição', 403);
    }

    const token = await jwtSign(reply, student.id, company?.id);

    await prisma.student.update({
      where: { id: student.id },
      data: { accessedAt: new Date() },
    });

    return reply.send({ token });
  });

  fastify.post<SchemaRoute<typeof AuthVerifyTokenResetPasswordSchema>>(
    '/verify-token-reset-password',
    { schema: AuthVerifyTokenResetPasswordSchema },
    async (request, reply) => {
      const { securityCode } = request.body;

      const student = await jwtVerifyResetPassword(securityCode);

      return reply.status(200).send(student);
    },
  );

  fastify.post<SchemaRoute<typeof AuthResetPasswordSchema>>(
    '/reset-password',
    { schema: AuthResetPasswordSchema },
    async (request, reply) => {
      const { securityCode, password, passwordConfirm } = request.body;

      const student = await jwtVerifyResetPassword(securityCode);

      if (password !== passwordConfirm) {
        throw new HttpException('As senhas não conferem!');
      }

      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: await argon2.hash(password),
          temporaryPassword: null,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.post<SchemaRoute<typeof AuthRequestPasswordRecoverySchema>>(
    '/request-password-recovery',
    { schema: AuthRequestPasswordRecoverySchema },
    async (request, reply) => {
      const { email } = request.body;

      const student = await prisma.student.findFirst({
        where: {
          email,
          studentCompanies: { some: {} },
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!student) {
        throw new HttpException('Não identificamos um usuário válido com os dados informados.');
      }

      const hashedPass = random(10);
      const securityCode = jwtSignResetPassword(student.id, hashedPass);

      sendMail({
        to: [student.email],
        subject: 'Redefinição de Senha',
        html: renderTemplateEmail('auth:reset-password', {
          MODULE_TITLE: 'Área do Estudante',
          URL_RESET_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/reset-password?securityCode=${securityCode}`,
        }),
      });

      await prisma.student.update({
        where: { id: student.id },
        data: {
          temporaryPassword: await argon2.hash(hashedPass),
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof AuthMeSchema>>('/me', { schema: AuthMeSchema }, async (request, reply) => {
    const { id: studentId, companyId } = request.user;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const company = await prisma.company.findFirst({
      where: {
        studentsCompany: { some: { studentId, companyId } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    await prisma.student.update({
      where: { id: studentId },
      data: { accessedAt: new Date() },
    });

    return reply.send({ ...student, role: 'student', company });
  });

  fastify.post<SchemaRoute<typeof AuthCompanySignSchema>>(
    '/company',
    { schema: AuthCompanySignSchema },
    async (request, reply) => {
      const { id: studentId, companyId: authCompanyId } = request.user;
      const { companyId } = request.body;

      // check auth company
      await prisma.studentCompany.findFirstOrThrow({
        where: { studentId, companyId: authCompanyId },
      });

      // check company
      await prisma.studentCompany.findFirstOrThrow({
        where: { studentId, companyId },
      });

      const token = await jwtSign(reply, studentId, companyId);

      return reply.send({ token });
    },
  );
}
