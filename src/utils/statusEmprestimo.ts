// Labels e cores para o status de empréstimos/reservas, incluindo o valor
// 'expirado' (reserva não confirmada em 2 dias, expirada automaticamente pelo backend).

export type StatusEmprestimo =
  | 'pendente'
  | 'reservado'
  | 'emprestado'
  | 'renovado'
  | 'devolvido'
  | 'atrasado'
  | 'expirado';

export const STATUS_LABELS: Record<StatusEmprestimo, string> = {
  pendente: 'Pendente',
  reservado: 'Reservado',
  emprestado: 'Emprestado',
  renovado: 'Renovado',
  devolvido: 'Devolvido',
  atrasado: 'Atrasado',
  expirado: 'Reserva expirada',
};

export function getStatusLabel(status?: string): string {
  if (!status) return STATUS_LABELS.pendente;
  return STATUS_LABELS[status as StatusEmprestimo] || status;
}

export function getStatusColorVars(status?: string): { bg: string; text: string } {
  switch (status) {
    case 'pendente':
    case 'renovado':
    case 'emprestado':
      return { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' };
    case 'devolvido':
      return { bg: 'var(--status-success-bg)', text: 'var(--status-success-text)' };
    case 'atrasado':
      return { bg: 'var(--status-danger-bg)', text: 'var(--status-danger-text)' };
    case 'expirado':
      return { bg: 'var(--status-neutral-bg)', text: 'var(--status-neutral-text)' };
    case 'reservado':
    default:
      return { bg: 'var(--status-active-bg)', text: 'var(--status-active-text)' };
  }
}
