import type { Exam, Prisma } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import {
  examRuleCountQuestions,
  examRuleListCategories,
  getExamRule,
  listExamRule,
  prepareExamRule,
} from '@prova-livre/backend/modules/admin/exam/exam.repository';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  ExamCreateSchema,
  ExamDeleteSchema,
  ExamGetSchema,
  ExamListSchema,
  ExamRuleCategoriesActionSchema,
  ExamRuleCategoriesListSchema,
  ExamRulesCountSchema,
  ExamRulesCreateSchema,
  ExamRulesDeleteSchema,
  ExamRulesListSchema,
  ExamRulesUpdateSchema,
  ExamUpdateSchema,
} from '@prova-livre/shared/dtos/admin/exam/exam.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function ExamController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof ExamListSchema>>('/', { schema: ExamListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { search, ...rest } = request.query;

    if (!hasPermission(role, 'Exam-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const exams = await paginate<Exam, Prisma.ExamFindManyArgs>(prisma.exam, rest, {
      where: {
        companyId,
        name: cast(search, () => ({
          contains: search,
          mode: 'insensitive',
        })),
      },
      orderBy: { id: 'desc' },
    });

    return reply.send(exams);
  });

  fastify.get<SchemaRoute<typeof ExamGetSchema>>('/:examId', { schema: ExamGetSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { examId } = request.params;

    if (!hasPermission(role, 'Exam-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const exam = await prisma.exam.findFirst({
      where: { companyId, id: examId },
    });

    return reply.send(exam);
  });

  fastify.post<SchemaRoute<typeof ExamCreateSchema>>('/', { schema: ExamCreateSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const payload = request.body;

    if (!hasPermission(role, 'Exam-Write')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const exam = await prisma.exam.create({
      data: { ...payload, companyId },
    });

    return reply.send(exam);
  });

  fastify.put<SchemaRoute<typeof ExamUpdateSchema>>(
    '/:examId',
    { schema: ExamUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const exam = await prisma.exam.update({
        where: { companyId, id: examId },
        data: { ...payload, companyId },
      });

      return reply.send(exam);
    },
  );

  fastify.delete<SchemaRoute<typeof ExamDeleteSchema>>(
    '/:examId',
    { schema: ExamDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId } = request.params;

      if (!hasPermission(role, 'Exam-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.examRuleCategory.deleteMany({
        where: {
          examRule: {
            examId: examId,
            exam: {
              companyId: companyId,
            },
          },
        },
      });

      await prisma.examRule.deleteMany({
        where: {
          examId: examId,
          exam: {
            companyId: companyId,
          },
        },
      });

      await prisma.exam.deleteMany({
        where: {
          companyId,
          id: examId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof ExamRulesListSchema>>(
    '/:examId/questions',
    { schema: ExamRulesListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId } = request.params;

      if (!hasPermission(role, 'Exam-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      return reply.send(await listExamRule(companyId, examId));
    },
  );

  fastify.post<SchemaRoute<typeof ExamRulesCreateSchema>>(
    '/:examId/questions',
    { schema: ExamRulesCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId } = request.params;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const payload = prepareExamRule(request.body);

      // Check company
      await prisma.exam.findFirstOrThrow({
        where: { companyId, id: examId },
      });

      const examRule = await prisma.examRule.create({
        data: { ...payload, examId },
      });

      return reply.send(await getExamRule(companyId, examRule.id));
    },
  );

  fastify.put<SchemaRoute<typeof ExamRulesUpdateSchema>>(
    '/:examId/questions/:examRuleId',
    { schema: ExamRulesUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId, examRuleId } = request.params;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const payload = prepareExamRule(request.body);

      // nao pode ter categorias para geracao dinamica
      // quando for uma questao selecionada
      if (payload.questionId) {
        await prisma.examRuleCategory.deleteMany({
          where: {
            examRule: { examId, exam: { companyId } }, // check company
            examRuleId,
          },
        });
      }

      await prisma.examRule.updateMany({
        where: {
          exam: { companyId }, // check company
          examId,
          id: examRuleId,
        },
        data: {
          ...payload,
          examId,
        },
      });

      return reply.send(await getExamRule(companyId, examRuleId));
    },
  );

  fastify.delete<SchemaRoute<typeof ExamRulesDeleteSchema>>(
    '/:examId/questions/:examRuleId',
    { schema: ExamRulesDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId, examRuleId } = request.params;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.examRule.deleteMany({
        where: {
          exam: { companyId },
          examId,
          id: examRuleId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof ExamRulesCountSchema>>(
    '/:examId/questions/:examRuleId/count',
    { schema: ExamRulesCountSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId, examRuleId } = request.params;

      if (!hasPermission(role, 'Exam-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const total = await examRuleCountQuestions(companyId, examId, examRuleId);

      return reply.send({ total });
    },
  );

  fastify.get<SchemaRoute<typeof ExamRuleCategoriesListSchema>>(
    '/:examId/questions/:examRuleId/categories',
    { schema: ExamRuleCategoriesListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examRuleId } = request.params;

      if (!hasPermission(role, 'Exam-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      return reply.send(await examRuleListCategories(companyId, examRuleId));
    },
  );

  fastify.put<SchemaRoute<typeof ExamRuleCategoriesActionSchema>>(
    '/:examId/questions/:examRuleId/categories/:categoryId',
    { schema: ExamRuleCategoriesActionSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId, examRuleId, categoryId } = request.params;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      // Check company
      await prisma.exam.findFirstOrThrow({
        where: { companyId, id: examId },
      });

      await prisma.examRuleCategory.create({
        data: {
          categoryId,
          examRuleId,
        },
      });

      return reply.send(await examRuleListCategories(companyId, examRuleId));
    },
  );

  fastify.delete<SchemaRoute<typeof ExamRuleCategoriesActionSchema>>(
    '/:examId/questions/:examRuleId/categories/:categoryId',
    { schema: ExamRuleCategoriesActionSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { examId, examRuleId, categoryId } = request.params;

      if (!hasPermission(role, 'Exam-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      // Check company
      await prisma.exam.findFirstOrThrow({
        where: { companyId, id: examId },
      });

      await prisma.examRuleCategory.deleteMany({
        where: {
          examRule: { examId },
          examRuleId,
          categoryId,
        },
      });

      return reply.status(204).send();
    },
  );
}
