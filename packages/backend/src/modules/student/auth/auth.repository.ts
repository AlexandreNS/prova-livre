import type { FastifyReply } from 'fastify';

import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

export function jwtSignResetPassword(studentId: number, hashedPass: string) {
  return jwt.sign(
    {
      studentId,
      hashedPass,
    },
    process.env.AUTH_STUDENT_RESET_PASSWORD_SECRET_KEY as string,
    { expiresIn: '15m' },
  );
}

export async function jwtVerifyResetPassword(token: string) {
  try {
    const payload = jwt.verify(token, process.env.AUTH_STUDENT_RESET_PASSWORD_SECRET_KEY as string);

    if (typeof payload !== 'object' || !payload.hashedPass || !payload.studentId) {
      throw new Error();
    }

    const student = await prisma.student.findFirstOrThrow({
      where: {
        id: payload.studentId,
        studentCompanies: { some: {} },
      },
      select: {
        id: true,
        email: true,
        password: true,
        temporaryPassword: true,
      },
    });

    if (!(await argon2.verify(student?.temporaryPassword as string, payload.hashedPass))) {
      throw new Error();
    }

    return student;
  } catch (e) {
    throw new HttpException('Link de redefinição de senha expirado ou incorreto.');
  }
}

export async function jwtSign(reply: FastifyReply, studentId: number, companyId: null | number = null) {
  const token = await reply.jwtSign({
    id: studentId,
    companyId,
    role: 'student',
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
