import { Prisma } from '@prisma/client';

import prisma from '../../src/database';
import categories from './categories.json';
import questions from './questions.json';

export const generateCategories = () => {
  let categoryId = 1;
  const companyId = 1;

  return categories.map(({ name, allowMultipleSelection, subcategories }) => ({
    id: categoryId++,
    companyId,
    name,
    allowMultipleSelection,
    subcategories: {
      connectOrCreate: subcategories.map((nameSubCategory) => ({
        where: { id: categoryId },
        create: { id: categoryId++, companyId, name: nameSubCategory },
      })),
    },
  })) as Prisma.CategoryUncheckedCreateInput[];
};

export const generateQuestions = async () => {
  let questionId = 1;
  let questionOptionId = 1;
  let questionCategoryId = 1;
  const companyId = 1;

  const categories = ['Aritmética', 'Álgebra', 'Geometria', 'Trigonometria', 'Probabilidade e Estatística'] as const;

  const questionCategories: Record<(typeof categories)[number], number[]> = {} as any;
  for (const category of categories) {
    questionCategories[category] = [
      ...(
        await prisma.category.findMany({
          where: { name: { in: ['Básico', 'Matemática', category] } },
        })
      ).map((category) => category.id),
    ];
  }

  return questions.map(({ description, type, maxLength, category, options }) => ({
    id: questionId++,
    companyId,
    description,
    type,
    maxLength,
    enabled: true,
    questionOptions: options
      ? {
          connectOrCreate: options.map(({ description, isCorrect }) => ({
            where: { id: questionOptionId },
            create: { id: questionOptionId++, description, isCorrect },
          })),
        }
      : undefined,
    questionCategories: category
      ? {
          connectOrCreate: questionCategories[category as (typeof categories)[number]].map((categoryId) => ({
            where: { id: questionCategoryId },
            create: {
              id: questionCategoryId++,
              categoryId: categoryId,
            },
          })),
        }
      : undefined,
  })) as Prisma.QuestionUncheckedCreateInput[];
};
