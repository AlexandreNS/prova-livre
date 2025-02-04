import type { Student } from '@prisma/client';

import prisma from '@prova-livre/backend/database';
import { jwtSignResetPassword } from '@prova-livre/backend/modules/student/auth/auth.repository';
import { renderTemplateEmail, sendMail, type templatesList } from '@prova-livre/backend/services/Mail';
import { random } from '@prova-livre/shared/helpers/string.helper';
import argon2 from 'argon2';

type EmailRegistrationParams = {
  companyName: string;
  student: Student;
  template: keyof typeof templatesList;
};

export async function sendEmailRegistration({ template, student, companyName }: EmailRegistrationParams) {
  if (template === 'auth:add-company') {
    return sendMail({
      to: [student.email],
      subject: 'Registro em nova instituição',
      html: renderTemplateEmail(template, {
        MODULE_TITLE: 'Área do Estudante',
        COMPANY_NAME: companyName,
        URL_LOGIN: `${process.env.PROVA_LIVRE_WEB_URL}/login`,
      }),
    });
  }

  if (template === 'auth:new-user') {
    const hashedPass = random(10);
    const securityCode = jwtSignResetPassword(student.id, hashedPass);

    sendMail({
      to: [student.email],
      subject: 'Confirmação de Cadastro',
      html: renderTemplateEmail(template, {
        MODULE_TITLE: 'Área do Estudante',
        COMPANY_NAME: companyName,
        URL_RESET_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/reset-password?securityCode=${securityCode}`,
        URL_FORGOT_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/forgot-password`,
      }),
    });

    await prisma.student.update({
      where: { id: student.id },
      data: {
        temporaryPassword: await argon2.hash(hashedPass),
      },
    });
  }
}
