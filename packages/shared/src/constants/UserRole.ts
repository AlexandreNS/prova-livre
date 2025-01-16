export const UserRole = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  TUTOR: 'tutor',
  ADMIN: 'admin',
  OWNER: 'owner',
  SUPER_USER: 'su',
} as const;

export const UserRoleString = {
  [UserRole.VIEWER]: 'Leitor',
  [UserRole.EDITOR]: 'Editor',
  [UserRole.TUTOR]: 'Tutor',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.OWNER]: 'Titular',
  [UserRole.SUPER_USER]: 'Super User',
} as const;
