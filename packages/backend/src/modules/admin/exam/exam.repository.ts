import type { SchemaBody } from '@prova-livre/shared/types/schema.type';

import prisma from '@prova-livre/backend/database';
import { ExamRulesCreateSchema, ExamRulesUpdateSchema } from '@prova-livre/shared/dtos/admin/exam/exam.dto';

export function prepareExamRule(payload: SchemaBody<typeof ExamRulesCreateSchema | typeof ExamRulesUpdateSchema>) {
  const data = { ...payload };

  if (data.questionId) {
    data.questionsCount = 1;
  }

  if ('questionType' in data && !data.questionType) {
    data.questionType = null;
  }

  return data;
}

export async function listExamRule(companyId: number, examId: number) {
  return prisma.examRule.findMany({
    where: {
      exam: { companyId }, // check company
      examId,
    },
    include: {
      examRuleCategories: {
        include: {
          category: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });
}

export async function getExamRule(companyId: number, examRuleId: number) {
  return prisma.examRule.findFirst({
    where: {
      exam: { companyId }, // check company
      id: examRuleId,
    },
    include: {
      examRuleCategories: {
        include: {
          category: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: { id: 'desc' },
  });
}

export async function examRuleCountQuestions(companyId: number, examId: number, examRuleId: number) {
  const examRule = await prisma.examRule.findFirstOrThrow({
    where: {
      exam: { companyId }, // check company
      id: examRuleId,
      examId,
    },
  });

  if (examRule.questionId) {
    return 1;
  }

  const examRuleCategories = await prisma.examRuleCategory.findMany({
    where: {
      category: { companyId }, // check company
      examRule: { exam: { companyId } }, // check company
      examRuleId,
    },
    select: {
      categoryId: true,
    },
  });

  return prisma.question.count({
    where: {
      companyId,
      type: examRule.questionType ?? undefined,
      AND: examRuleCategories.map(({ categoryId }) => ({
        questionCategories: { some: { categoryId } },
      })),
    },
  });
}

export async function examRuleListCategories(companyId: number, examRuleId: number) {
  return prisma.examRuleCategory.findMany({
    where: {
      examRuleId,
      examRule: {
        exam: { companyId }, // check company
      },
    },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });
}
