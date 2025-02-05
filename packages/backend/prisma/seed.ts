import { Prisma } from '@prisma/client';

import prisma from '../src/database';
import { generateCategories, generateQuestions } from './data-seed';

(async function main() {
  const systemSettingsList = [
    {
      where: { id: 1 },
      data: {
        id: 1,
        name: 'allow_other_users_to_create_companies',
        description: 'Autorizar criação de Instituições por outros usuários',
        value: '',
        enabled: false,
      },
    },
  ] as { data: Prisma.SystemSettingsUncheckedCreateInput; where: Prisma.SystemSettingsWhereUniqueInput }[];

  for (const { data, where } of systemSettingsList) {
    await prisma.systemSettings.upsert({ where, create: data, update: data });
  }

  const companyData = {
    id: 1,
    name: 'Matriz',
    slug: 'prova-livre-matriz',
  } as Prisma.CompanyUncheckedCreateInput;

  await prisma.company.upsert({
    where: { id: 1 },
    create: companyData,
    update: {},
  });

  const suData = {
    id: 1,
    name: 'Super Admin',
    email: 'su@provalivre.xyz',
    password: '$argon2id$v=19$m=65536,t=3,p=4$Xqlb8a3rGjxeJOV+eP/d2g$nW+iYkb9LEjIihleCQgZ3SMvASGxT13V60bvJw1VBaM',
  } as Prisma.UserUncheckedCreateInput;

  await prisma.user.upsert({
    where: { id: 1 },
    create: suData,
    update: {},
  });

  const ownerData = {
    id: 2,
    name: 'Test Owner',
    email: 'owner@provalivre.xyz',
    password: '$argon2id$v=19$m=65536,t=3,p=4$Xqlb8a3rGjxeJOV+eP/d2g$nW+iYkb9LEjIihleCQgZ3SMvASGxT13V60bvJw1VBaM',
    userCompanyRoles: {
      connectOrCreate: {
        where: { id: 2 },
        create: {
          id: 2,
          companyId: 1,
          role: 'owner',
        },
      },
    },
  } as Prisma.UserUncheckedCreateInput;

  await prisma.user.upsert({
    where: { id: 2 },
    create: ownerData,
    update: {},
  });

  const adminData = {
    id: 3,
    name: 'Test Admin',
    email: 'admin@provalivre.xyz',
    password: '$argon2id$v=19$m=65536,t=3,p=4$Xqlb8a3rGjxeJOV+eP/d2g$nW+iYkb9LEjIihleCQgZ3SMvASGxT13V60bvJw1VBaM',
    userCompanyRoles: {
      connectOrCreate: {
        where: { id: 3 },
        create: {
          id: 3,
          companyId: 1,
          role: 'admin',
        },
      },
    },
  } as Prisma.UserUncheckedCreateInput;

  await prisma.user.upsert({
    where: { id: 3 },
    create: adminData,
    update: {},
  });

  for (const data of generateCategories()) {
    await prisma.category.upsert({ where: { id: data.id }, create: data, update: {} });
  }

  for (const data of await generateQuestions()) {
    await prisma.question.upsert({ where: { id: data.id }, create: data, update: {} });
  }

  // TODO buscar uma correção melhor para o Postgres
  // fix autoincrement primary_key
  for (const model of Prisma.dmmf.datamodel.models) {
    const table_name = model.dbName || model.name;
    try {
      // Recupera o nome da sequência associada à tabela
      const queryRaw = `SELECT pg_get_serial_sequence('"${table_name}"', 'id') AS sequence_name;`;
      const sequenceName = await prisma.$queryRawUnsafe<{ sequence_name: string }[]>(queryRaw);

      if (sequenceName.length > 0) {
        const queryRaw = `SELECT setval(pg_get_serial_sequence('"${table_name}"', 'id'), coalesce(max(id) + 1, 1), false) FROM "${table_name}"`;

        // Ajusta a sequência com base no valor máximo de 'id' da tabela
        await prisma.$queryRawUnsafe(queryRaw);
      }
    } catch (err) {
      console.warn(`fix table sequence failed: ${table_name}`);
    }
  }
})();
