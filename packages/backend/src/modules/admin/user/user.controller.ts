import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import { UserCreateSchema } from '@prova-livre/shared/dtos/admin/user/user.dto';
import argon2 from 'argon2';
// TODO TEMP
export default async function UserController(fastify: FastifyInstance) {
  fastify.post<SchemaRoute<typeof UserCreateSchema>>('/', { schema: UserCreateSchema }, async (request, reply) => {
    const { password, ...userData } = request.body;

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      create: {
        ...userData,
        password: await argon2.hash(password),
      },
      update: { name: userData.name },
      select: { id: true },
    });

    reply.send(user);
  });
}
