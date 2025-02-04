import prisma from '@prova-livre/backend/database';
import { SystemSettings, SystemSettingsId } from '@prova-livre/shared/constants/SystemSettings';

export async function getRolesAllowCreateCompanies() {
  const systemSettings = await prisma.systemSettings.findFirst({
    where: { id: SystemSettingsId[SystemSettings.ALLOW_OTHER_USERS_TO_CREATE_COMPANIES], enabled: true },
  });

  if (!systemSettings || !systemSettings.value) {
    return [];
  }

  return systemSettings.value.split(',');
}
