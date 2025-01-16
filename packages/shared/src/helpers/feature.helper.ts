import type { ArrayValues } from '@prova-livre/shared/types/util.type';

export const ROLES = ['su', 'owner', 'admin', 'editor', 'tutor', 'viewer'] as const;

export const PERMISSIONS = {
  'Api-Docs': ['owner', 'admin'],
  'Api-Board': [],

  'App-Read': ['owner', 'admin'],
  'App-Write': ['owner', 'admin'],
  'App-Delete': ['owner', 'admin'],

  'Application-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Application-Write': ['owner', 'admin', 'editor'],
  'Application-Delete': ['owner', 'admin'],

  'Category-Read': ['owner', 'admin', 'editor', 'tutor'],
  'Category-Write': ['owner', 'admin', 'editor'],
  'Category-Delete': ['owner', 'admin'],

  'Class-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Class-Write': ['owner', 'admin', 'editor'],
  'Class-Delete': ['owner', 'admin'],

  'Correction-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Correction-Write': ['owner', 'admin', 'editor', 'tutor'],
  'Correction-Delete': ['owner', 'admin'],

  'Exam-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Exam-Write': ['owner', 'admin', 'editor'],
  'Exam-Delete': ['owner', 'admin'],

  'ExamType-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'ExamType-Write': ['owner', 'admin', 'editor'],
  'ExamType-Delete': ['owner', 'admin'],

  'Question-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Question-Write': ['owner', 'admin', 'editor', 'tutor'],
  'Question-Delete': ['owner', 'admin', 'editor'],

  'Student-Read': ['owner', 'admin', 'editor', 'tutor', 'viewer'],
  'Student-Write': ['owner', 'admin', 'editor'],
  'Student-Delete': ['owner', 'admin'],

  'User-Read': ['owner', 'admin'],
  'User-Write': ['owner', 'admin'],
  'User-Delete': ['owner', 'admin'],
} as const;

export function hasPermission(
  role: ArrayValues<typeof ROLES> | null | undefined,
  slug: keyof typeof PERMISSIONS | null | undefined,
) {
  if (!role || !slug) {
    return false;
  }

  if (role === 'su') {
    return true;
  }

  // @ts-expect-error
  return PERMISSIONS[slug].includes(role);
}

export function hasPermissionList(
  role: ArrayValues<typeof ROLES> | null | undefined,
  ...slugs: (keyof typeof PERMISSIONS | null | undefined)[]
) {
  return slugs?.map((slug) => {
    if (!role || !slug) {
      return false;
    }

    if (role === 'su') {
      return true;
    }

    // @ts-expect-error
    return PERMISSIONS[slug].includes(role);
  });
}
