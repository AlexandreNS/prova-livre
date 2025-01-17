import type { FastifyInstance } from 'fastify';

import AuthController from '@prova-livre/backend/modules/admin/auth/auth.controller';
import CategoryController from '@prova-livre/backend/modules/admin/category/category.controller';
import CompanyController from '@prova-livre/backend/modules/admin/company/company.controller';
import MeController from '@prova-livre/backend/modules/admin/me/me.controller';
import QuestionController from '@prova-livre/backend/modules/admin/question/question.controller';
import UserController from '@prova-livre/backend/modules/admin/user/user.controller';

export default async function AdminRoutes(fastify: FastifyInstance) {
  fastify.register(AuthController, { prefix: '/auth' });
  fastify.register(CategoryController, { prefix: '/categories' });
  fastify.register(CompanyController, { prefix: '/companies' });
  fastify.register(MeController, { prefix: '/me' });
  fastify.register(QuestionController, { prefix: '/questions' });
  fastify.register(UserController, { prefix: '/users' }); // TODO TEMP
}
