import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { getRole } from '@prova-livre/backend/modules/admin/auth/auth.repository';
import Logger from '@prova-livre/backend/services/Logger';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import { LoggerListSchema } from '@prova-livre/shared/dtos/admin/logger/logger.dto';
import { existsSync } from 'node:fs';
import readLastLines from 'read-last-lines';

export default async function LoggerController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof LoggerListSchema>>('/', { schema: LoggerListSchema }, async (request, reply) => {
    const { id: userId } = request.user;

    if ((await getRole(userId)) !== 'su') {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    let lines = [];

    if (existsSync(Logger.FILE)) {
      lines = (await readLastLines.read(Logger.FILE, 50))
        .split('\n')
        .filter(Boolean)
        .reverse()
        .map((line) => JSON.parse(line));
    }

    return reply.send(lines);
  });
}
