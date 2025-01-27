export const StudentApplicationStatus = {
  ENDED: 'ended',
  EXPIRED: 'expired',
  INITIALIZED: 'initialized',
  STARTED: 'started',
  SUBMITTED: 'submitted',
  WAITING: 'waiting',
  AWAITING_CORRECTION: 'awaiting_correction',
} as const;

export const StudentApplicationStatusString = {
  [StudentApplicationStatus.ENDED]: 'Prazo Encerrado',
  [StudentApplicationStatus.EXPIRED]: 'Tempo Excedido',
  [StudentApplicationStatus.INITIALIZED]: 'Em Progresso',
  [StudentApplicationStatus.STARTED]: 'Liberada',
  [StudentApplicationStatus.SUBMITTED]: 'Concluída',
  [StudentApplicationStatus.WAITING]: 'Agendada',
  [StudentApplicationStatus.AWAITING_CORRECTION]: 'Aguardando Correção',
} as const;
