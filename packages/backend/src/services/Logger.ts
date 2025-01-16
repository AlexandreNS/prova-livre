import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export default class Logger {
  static DIR = 'logs';
  static FILE = join(Logger.DIR, 'logs.log');

  static error(error: Error) {
    const message = error?.message ?? error?.toString() ?? null;
    Logger.log({ ...error, message }, 'error', message);
  }

  static log(context: any, type: 'error' | 'log' | 'warn' = 'log', summary: null | string = null) {
    const timestamp = Date.now();

    const data = {
      type,
      timestamp,
      summary,
      context,
    };

    if (!existsSync(Logger.DIR)) {
      mkdirSync(Logger.DIR);
    }

    appendFileSync(Logger.FILE, JSON.stringify(data) + '\n', 'utf8');
  }

  static warn(context: any) {
    Logger.log(context, 'warn');
  }
}
