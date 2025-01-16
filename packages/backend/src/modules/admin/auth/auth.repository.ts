import type { FastifyReply } from 'fastify';

import prisma from '@prova-livre/backend/database';

export function isSuperUser(userId: number) {
  return userId === 1;
}

export async function getRole(userId: number, companyId?: number) {
  if (isSuperUser(userId)) {
    return 'su';
  }

  let role = null;

  if (companyId) {
    const userCompanyRole = await prisma.userCompanyRole.findFirstOrThrow({
      where: { userId, companyId },
      select: { role: true },
    });

    role = userCompanyRole?.role;
  }

  return role;
}

export async function jwtSign(reply: FastifyReply, userId: number, companyId: null | number = null) {
  const role = companyId ? await getRole(userId, companyId) : null;

  const token = await reply.jwtSign({
    id: userId,
    companyId,
    role,
  });

  setCookie(reply, token);

  return token;
}

export function setCookie(reply: FastifyReply, token: string) {
  reply.setCookie('token', token, {
    path: '/',
    secure: false,
    httpOnly: true,
    sameSite: false,
    signed: true,
  });
}
