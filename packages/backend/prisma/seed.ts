import type { Prisma } from '@prisma/client';

import prisma from '../src/database';

(async function main() {
  const systemSettingsList = [
    {
      where: { id: 1 },
      data: {
        name: 'allow_other_users_to_create_companies',
        description: 'Autorizar criação de Instituições por outros usuários',
        value: '',
        enabled: false,
      },
    },
  ] as { data: Prisma.SystemSettingsCreateInput; where: Prisma.SystemSettingsWhereUniqueInput }[];

  for (const { data, where } of systemSettingsList) {
    await prisma.systemSettings.upsert({ where, create: data, update: data });
  }

  const companyData = {
    name: 'Prova Livre - Matriz',
    slug: 'prova-livre-matriz',
  } as Prisma.CompanyCreateInput;

  await prisma.company.upsert({
    where: { id: 1 },
    create: companyData,
    update: companyData,
  });

  const suData = {
    name: 'Super Admin',
    email: 'su@provalivre.xyz',
    password: '$argon2id$v=19$m=65536,t=3,p=4$Xqlb8a3rGjxeJOV+eP/d2g$nW+iYkb9LEjIihleCQgZ3SMvASGxT13V60bvJw1VBaM',
  } as Prisma.UserCreateInput;

  await prisma.user.upsert({
    where: { id: 1 },
    create: suData,
    update: suData,
  });

  const ownerData = {
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
  } as Prisma.UserCreateInput;

  await prisma.user.upsert({
    where: { id: 2 },
    create: ownerData,
    update: ownerData,
  });

  const adminData = {
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
  } as Prisma.UserCreateInput;

  await prisma.user.upsert({
    where: { id: 3 },
    create: adminData,
    update: adminData,
  });
})();
