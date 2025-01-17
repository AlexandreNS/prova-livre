export const QuestionType = {
  DISCURSIVE: 'discursive',
  OPTIONS: 'options',
} as const;

export const QuestionTypeString = {
  [QuestionType.DISCURSIVE]: 'Discursiva',
  [QuestionType.OPTIONS]: 'Múltipla escolha',
} as const;
