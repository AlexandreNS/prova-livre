export const SystemSettings = {
  ALLOW_OTHER_USERS_TO_CREATE_COMPANIES: 'allow_other_users_to_create_companies',
} as const;

export const SystemSettingsId = {
  [SystemSettings.ALLOW_OTHER_USERS_TO_CREATE_COMPANIES]: 1,
} as const;
