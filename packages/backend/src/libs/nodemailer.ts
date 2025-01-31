import { number } from '@prova-livre/shared/helpers/number.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { createTransport } from 'nodemailer';

import 'dotenv-auto';

const { MAIL_SMTP_HOST, MAIL_SMTP_PORT, MAIL_SMTP_USERNAME, MAIL_SMTP_PASSWORD } = process.env;

export const nodemailer = createTransport({
  host: string(MAIL_SMTP_HOST),
  port: number(MAIL_SMTP_PORT),
  secure: number(MAIL_SMTP_PORT) === 465,
  auth: {
    user: string(MAIL_SMTP_USERNAME),
    pass: string(MAIL_SMTP_PASSWORD),
  },
});
