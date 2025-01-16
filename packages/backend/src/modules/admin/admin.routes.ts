import type { FastifyInstance } from 'fastify';

import AuthController from '@prova-livre/backend/modules/admin/auth/auth.controller';
import CompanyController from '@prova-livre/backend/modules/admin/company/company.controller';
import MeController from '@prova-livre/backend/modules/admin/me/me.controller';
import UserController from '@prova-livre/backend/modules/admin/user/user.controller';

export default async function AdminRoutes(fastify: FastifyInstance) {
  fastify.register(AuthController, { prefix: '/auth' });
  fastify.register(UserController, { prefix: '/users' }); // TODO TEMP
  fastify.register(CompanyController, { prefix: '/companies' });
  fastify.register(MeController, { prefix: '/me' });
}
