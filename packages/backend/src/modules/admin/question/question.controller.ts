import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import { Prisma, type Question } from '@prisma/client';
import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { questionAddCategory } from '@prova-livre/backend/modules/admin/question/question.repository';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  QuestionCategoriesCreateSchema,
  QuestionCategoriesDeleteSchema,
  QuestionCategoriesListSchema,
  QuestionCreateSchema,
  QuestionDeleteSchema,
  QuestionGetSchema,
  QuestionListSchema,
  QuestionOptionsCreateSchema,
  QuestionOptionsDeleteSchema,
  QuestionOptionsListSchema,
  QuestionOptionsUpdateSchema,
  QuestionUpdateSchema,
} from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function QuestionController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof QuestionListSchema>>('/', { schema: QuestionListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { search, enabled } = request.query;

    if (!hasPermission(role, 'Question-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const where: Prisma.QuestionWhereInput = {
      companyId,
      description: cast(search, () => ({
        contains: search,
        mode: 'insensitive',
      })),
    };

    if (enabled !== undefined) {
      where.enabled = true;
    }

    const questions = await paginate<Question, Prisma.QuestionFindManyArgs>(prisma.question, request.query, {
      where: where,
      orderBy: { id: 'desc' },
    });

    return reply.send(questions);
  });

  fastify.get<SchemaRoute<typeof QuestionGetSchema>>(
    '/:questionId',
    { schema: QuestionGetSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;

      if (!hasPermission(role, 'Question-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const question = await prisma.question.findFirst({
        where: {
          companyId,
          id: questionId,
        },
      });

      return reply.send(question);
    },
  );

  fastify.post<SchemaRoute<typeof QuestionCreateSchema>>(
    '/',
    { schema: QuestionCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const payload = request.body;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const question = await prisma.question.create({
        data: { ...payload, companyId },
      });

      return reply.send(question);
    },
  );

  fastify.put<SchemaRoute<typeof QuestionUpdateSchema>>(
    '/:questionId',
    { schema: QuestionUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const question = await prisma.question.update({
        where: { id: questionId },
        data: { ...payload, companyId },
      });

      return reply.send(question);
    },
  );

  fastify.delete<SchemaRoute<typeof QuestionDeleteSchema>>(
    '/:questionId',
    { schema: QuestionDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;

      if (!hasPermission(role, 'Question-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.questionCategory.deleteMany({
        where: {
          questionId: questionId,
          category: {
            companyId: companyId,
          },
        },
      });

      await prisma.questionOption.deleteMany({
        where: {
          questionId: questionId,
          question: {
            companyId: companyId,
          },
        },
      });

      await prisma.question.deleteMany({
        where: {
          companyId,
          id: questionId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof QuestionOptionsListSchema>>(
    '/:questionId/options',
    { schema: QuestionOptionsListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;

      if (!hasPermission(role, 'Question-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const options = await prisma.questionOption.findMany({
        where: {
          question: { companyId },
          questionId,
        },
        orderBy: { id: 'asc' },
      });

      return reply.send(options);
    },
  );

  fastify.post<SchemaRoute<typeof QuestionOptionsCreateSchema>>(
    '/:questionId/options',
    { schema: QuestionOptionsCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      // Check user's company
      await prisma.question.findFirstOrThrow({
        where: { companyId, id: questionId },
      });

      const questionOption = await prisma.questionOption.create({
        data: { ...payload, questionId },
      });

      return reply.send(questionOption);
    },
  );

  fastify.put<SchemaRoute<typeof QuestionOptionsUpdateSchema>>(
    '/:questionId/options/:optionId',
    { schema: QuestionOptionsUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId, optionId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.questionOption.updateMany({
        where: {
          question: { companyId },
          questionId,
          id: optionId,
        },
        data: {
          ...payload,
          questionId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.delete<SchemaRoute<typeof QuestionOptionsDeleteSchema>>(
    '/:questionId/options/:optionId',
    { schema: QuestionOptionsDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId, optionId } = request.params;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.questionOption.deleteMany({
        where: {
          question: { companyId },
          questionId,
          id: optionId,
        },
      });

      return reply.status(204).send();
    },
  );

  fastify.get<SchemaRoute<typeof QuestionCategoriesListSchema>>(
    '/:questionId/categories',
    { schema: QuestionCategoriesListSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;

      if (!hasPermission(role, 'Question-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const categories = await prisma.category.findMany({
        where: {
          companyId,
          questionCategories: {
            some: { questionId },
          },
        },
        include: {
          parent: true,
        },
        orderBy: { id: 'desc' },
      });

      return reply.send(categories);
    },
  );

  fastify.post<SchemaRoute<typeof QuestionCategoriesCreateSchema>>(
    '/:questionId/categories',
    { schema: QuestionCategoriesCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId } = request.params;
      const { categoryId } = request.body;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      // check company
      await prisma.question.findFirstOrThrow({
        where: { companyId, id: questionId },
      });

      await questionAddCategory(questionId, categoryId);

      return reply.status(204).send();
    },
  );

  fastify.delete<SchemaRoute<typeof QuestionCategoriesDeleteSchema>>(
    '/:questionId/categories/:categoryId',
    { schema: QuestionCategoriesDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { questionId, categoryId } = request.params;

      if (!hasPermission(role, 'Question-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.questionCategory.deleteMany({
        where: {
          category: { companyId },
          questionId,
          categoryId,
        },
      });

      return reply.status(204).send();
    },
  );
}
