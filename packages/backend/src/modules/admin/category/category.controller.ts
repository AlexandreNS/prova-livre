import type { Category, Prisma } from '@prisma/client';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { FastifyInstance } from 'fastify';

import prisma from '@prova-livre/backend/database';
import paginate from '@prova-livre/backend/database/paginate';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import {
  CategoryCreateSchema,
  CategoryDeleteSchema,
  CategoryGetSchema,
  CategoryListSchema,
  CategoryUpdateSchema,
} from '@prova-livre/shared/dtos/admin/category/category.dto';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { cast } from '@prova-livre/shared/helpers/util.helper';

export default async function CategoryController(fastify: FastifyInstance) {
  fastify.get<SchemaRoute<typeof CategoryListSchema>>('/', { schema: CategoryListSchema }, async (request, reply) => {
    const { role, companyId } = request.user;
    const { parentId, search, ...rest } = request.query;

    if (!hasPermission(role, 'Category-Read')) {
      throw new HttpException(ErrorCodeString.NO_PERMISSION);
    }

    const categories = await paginate<Category, Prisma.CategoryFindManyArgs>(prisma.category, rest, {
      where: {
        companyId,
        parentId: parentId === '*' ? { not: null } : parentId ? number(parentId) : null,

        OR: cast(search, () => [
          {
            name: { contains: search, mode: 'insensitive' },
          },
          {
            parent: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ]),
      },
      include: {
        parent: true,
      },
      orderBy: { id: 'desc' },
    });

    return reply.send(categories);
  });

  fastify.get<SchemaRoute<typeof CategoryGetSchema>>(
    '/:categoryId',
    { schema: CategoryGetSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { categoryId } = request.params;

      if (!hasPermission(role, 'Category-Read')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const category = await prisma.category.findFirst({
        where: {
          companyId,
          id: categoryId,
        },
        include: {
          parent: true,
        },
      });

      return reply.send(category);
    },
  );

  fastify.post<SchemaRoute<typeof CategoryCreateSchema>>(
    '/',
    { schema: CategoryCreateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const payload = request.body;

      if (!hasPermission(role, 'Category-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const category = await prisma.category.create({
        data: { ...payload, companyId },
        include: {
          parent: true,
        },
      });

      return reply.send(category);
    },
  );

  fastify.put<SchemaRoute<typeof CategoryUpdateSchema>>(
    '/:categoryId',
    { schema: CategoryUpdateSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { categoryId } = request.params;
      const payload = request.body;

      if (!hasPermission(role, 'Category-Write')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      const category = await prisma.category.update({
        where: { companyId, id: categoryId },
        data: { ...payload, companyId },
        include: {
          parent: true,
        },
      });

      return reply.send(category);
    },
  );

  fastify.delete<SchemaRoute<typeof CategoryDeleteSchema>>(
    '/:categoryId',
    { schema: CategoryDeleteSchema },
    async (request, reply) => {
      const { role, companyId } = request.user;
      const { categoryId } = request.params;

      if (!hasPermission(role, 'Category-Delete')) {
        throw new HttpException(ErrorCodeString.NO_PERMISSION);
      }

      await prisma.category.deleteMany({
        where: {
          companyId,
          OR: [{ id: categoryId }, { parentId: categoryId }],
        },
      });

      return reply.status(204).send();
    },
  );
}
