import type { FastifyInstance } from 'fastify';

import ApplicationController from '@prova-livre/backend/modules/admin/application/application.controller';
import AuthController from '@prova-livre/backend/modules/admin/auth/auth.controller';
import CategoryController from '@prova-livre/backend/modules/admin/category/category.controller';
import ClassController from '@prova-livre/backend/modules/admin/class/class.controller';
import CompanyController from '@prova-livre/backend/modules/admin/company/company.controller';
import CorrectionController from '@prova-livre/backend/modules/admin/correction/correction.controller';
import ExamController from '@prova-livre/backend/modules/admin/exam/exam.controller';
import LoggerController from '@prova-livre/backend/modules/admin/logger/logger.controller';
import MeController from '@prova-livre/backend/modules/admin/me/me.controller';
import QuestionController from '@prova-livre/backend/modules/admin/question/question.controller';
import StudentController from '@prova-livre/backend/modules/admin/student/student.controller';
import SystemSettingsController from '@prova-livre/backend/modules/admin/system-settings/system-settings.controller';
import UserController from '@prova-livre/backend/modules/admin/user/user.controller';

export default async function AdminRoutes(fastify: FastifyInstance) {
  fastify.register(ApplicationController, { prefix: '/applications' });
  fastify.register(AuthController, { prefix: '/auth' });
  fastify.register(CategoryController, { prefix: '/categories' });
  fastify.register(ClassController, { prefix: '/classes' });
  fastify.register(CompanyController, { prefix: '/companies' });
  fastify.register(CorrectionController, { prefix: '/corrections' });
  fastify.register(ExamController, { prefix: '/exams' });
  fastify.register(LoggerController, { prefix: '/logger' });
  fastify.register(MeController, { prefix: '/me' });
  fastify.register(QuestionController, { prefix: '/questions' });
  fastify.register(StudentController, { prefix: '/students' });
  fastify.register(SystemSettingsController, { prefix: '/system-settings' });
  fastify.register(UserController, { prefix: '/users' });
}
