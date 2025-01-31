import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { MeGetSchema, MePasswordUpdateSchema, MeUpdateSchema } from '@prova-livre/shared/dtos/student/me/me.dto';
import argon2 from 'argon2';

export default async function MeController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof MeGetSchema>>('/', { schema: MeGetSchema }, async (request, reply) => {
    const { id: studentId, companyId } = request.user;

    const user = await prisma.student.findUniqueOrThrow({
      where: {
        studentCompanies: { some: { companyId } }, // check company
        id: studentId,
      },
    });

    return reply.send(user);
  });

  fastify.put<SchemaRoute<typeof MeUpdateSchema>>('/', { schema: MeUpdateSchema }, async (request, reply) => {
    const { id: studentId, companyId } = request.user;
    const payload = request.body;

    const user = await prisma.student.update({
      where: {
        studentCompanies: { some: { companyId } }, // check company
        id: studentId,
      },
      data: {
        ...payload,
      },
    });

    return reply.send(user);
  });

  fastify.put<SchemaRoute<typeof MePasswordUpdateSchema>>(
    '/password',
    { schema: MePasswordUpdateSchema },
    async (request, reply) => {
      const { id: studentId, companyId } = request.user;
      const { currentPassword, password, passwordConfirm } = request.body;

      const check = await prisma.student.findFirstOrThrow({
        where: {
          studentCompanies: { some: { companyId } }, // check company
          id: studentId,
        },
      });

      if (password !== passwordConfirm) {
        throw new HttpException('As senhas não conferem!');
      }

      if (!(await argon2.verify(check.password as string, currentPassword))) {
        throw new HttpException('A senha atual está incorreta!');
      }

      await prisma.student.update({
        where: { id: studentId },
        data: { password: await argon2.hash(password) },
      });

      return reply.status(204).send();
    },
  );
}
