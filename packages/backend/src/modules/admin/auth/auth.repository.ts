import type { FastifyReply } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

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

export function jwtSignResetPassword(userId: number, hashedPass: string) {
  return jwt.sign(
    {
      userId,
      hashedPass,
    },
    process.env.AUTH_ADMIN_RESET_PASSWORD_SECRET_KEY as string,
    { expiresIn: '15m' },
  );
}

export async function jwtVerifyResetPassword(token: string) {
  try {
    const payload = jwt.verify(token, process.env.AUTH_ADMIN_RESET_PASSWORD_SECRET_KEY as string);

    if (typeof payload !== 'object' || !payload.hashedPass || !payload.userId) {
      throw new Error();
    }

    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: payload.userId,
        userCompanyRoles: { some: {} },
      },
      select: {
        id: true,
        email: true,
        password: true,
        temporaryPassword: true,
      },
    });

    if (!(await argon2.verify(user?.temporaryPassword as string, payload.hashedPass))) {
      throw new Error();
    }

    return user;
  } catch (e) {
    throw new HttpException('Link de redefinição de senha expirado ou incorreto.');
  }
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
