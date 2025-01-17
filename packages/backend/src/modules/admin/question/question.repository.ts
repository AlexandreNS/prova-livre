import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';

export async function questionAddCategory(questionId: number, categoryId: number) {
  const parentCategory = await prisma.category.findFirstOrThrow({
    where: {
      subcategories: {
        some: { id: categoryId },
      },
    },
  });

  const subcategories = await prisma.category.findMany({
    where: { parentId: parentCategory.id },
    select: { id: true },
  });

  const count = await prisma.questionCategory.count({
    where: {
      questionId,
      categoryId: { in: subcategories.map(({ id }) => id) },
    },
  });

  if (!parentCategory.allowMultipleSelection && count) {
    throw new HttpException(`A categoria "${parentCategory.name}" não permite selecionar múltiplas subcategorias.`);
  }

  await prisma.questionCategory.create({
    data: {
      questionId,
      categoryId,
    },
  });
}
