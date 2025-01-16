import { Prisma, PrismaClient } from '@prisma/client';
import { date } from '@prova-livre/shared/helpers/date.helper';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

const client = new PrismaClient();
const models = Prisma.dmmf.datamodel.models;

// convert dates
client.$use(async (params, next) => {
  if (['create', 'createMany', 'update', 'updateMany'].includes(params.action) && params.args.data) {
    for (const attr in params.args.data) {
      if (!attr.endsWith('At')) continue;
      if (!params.args.data[attr]) continue;
      params.args.data[attr] = date(params.args.data[attr]);
    }
  }

  return next(params);
});

const softDeleteModels = models
  .filter((model) => model.fields.some((field) => field.name === 'deletedAt'))
  .map(({ name }) => [
    name,
    {
      field: 'deletedAt',
      createValue: (deleted: boolean) => (deleted ? new Date() : null),
    },
  ]);

const prisma = client.$extends(
  createSoftDeleteExtension({
    models: Object.fromEntries(softDeleteModels),
  }),
);

export default prisma;
