import { nodemailer } from '@prova-livre/backend/libs/nodemailer';
import { replaceFlags } from '@prova-livre/shared/helpers/string.helper';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type EmailData = {
  html: string;
  subject: string;
  to: string[];
};

export const templatesList = {
  'auth:reset-password': ['auth', 'reset-password.html'],
  'auth:add-company': ['auth', 'add-company.html'],
  'auth:new-user': ['auth', 'new-user.html'],
} as const;

export function renderTemplateEmail(template: keyof typeof templatesList, data?: Record<string, string>) {
  const path = join('src', 'templates', 'emails', ...templatesList[template]);

  if (!existsSync(path)) {
    throw new Error('Malformed template directory');
  }

  const htmlTemplate = String(readFileSync(path, 'utf8'));
  return data ? replaceFlags(htmlTemplate, data) : htmlTemplate;
}

export function sendMail({ html, subject, to }: EmailData) {
  return nodemailer.sendMail({
    from: `"Prova Livre" <${process.env.MAIL_SMTP_EMAIL_FROM}>`,
    to: to.join(','),
    subject,
    html,
  });
}
