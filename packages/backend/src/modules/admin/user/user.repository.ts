import type { User } from '@prisma/client';

import prisma from '@prova-livre/backend/database';
import { jwtSignResetPassword } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import { renderTemplateEmail, sendMail, type templatesList } from '@prova-livre/backend/services/Mail';
import { random } from '@prova-livre/shared/helpers/string.helper';
import argon2 from 'argon2';

type EmailRegistrationParams = {
  companyName: string;
  template: keyof typeof templatesList;
  user: User;
};

export async function sendEmailRegistration({ template, user, companyName }: EmailRegistrationParams) {
  if (template === 'auth:add-company') {
    return sendMail({
      to: [user.email],
      subject: 'Registro em nova instituição',
      html: renderTemplateEmail(template, {
        MODULE_TITLE: 'Área Administrativa',
        COMPANY_NAME: companyName,
        URL_LOGIN: `${process.env.PROVA_LIVRE_WEB_URL}/admin/login`,
      }),
    });
  }

  if (template === 'auth:new-user') {
    const hashedPass = random(10);
    const securityCode = jwtSignResetPassword(user.id, hashedPass);

    sendMail({
      to: [user.email],
      subject: 'Confirmação de Cadastro',
      html: renderTemplateEmail(template, {
        MODULE_TITLE: 'Área Administrativa',
        COMPANY_NAME: companyName,
        URL_RESET_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/admin/reset-password?securityCode=${securityCode}`,
        URL_FORGOT_PASSWORD: `${process.env.PROVA_LIVRE_WEB_URL}/admin/forgot-password`,
      }),
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        temporaryPassword: await argon2.hash(hashedPass),
      },
    });
  }
}
