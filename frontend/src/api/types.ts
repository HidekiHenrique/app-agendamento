export type UserRole = 'master' | 'cliente';

export interface Usuario {
  id?: number;
  nome?: string;
  email: string;
  role: UserRole;
}

export interface Cliente {
  id: number;
  nome: string;
  email?: string | null;
  telefone: string | null;
  observacoes: string | null;
  possuiLogin?: boolean;
}

export interface Servico {
  id: number;
  nome: string;
  duracaoMin: number;
  preco: number;
  ativo: boolean;
}

export type StatusAgendamento = 'agendado' | 'concluido' | 'cancelado';

export interface Agendamento {
  id: number;
  clienteId: number;
  servicoId: number;
  dataHora: string; // ISO string em UTC, como vem do backend
  precoCobrado: number; // preço no momento em que foi agendado
  duracaoMin: number; // duração no momento em que foi agendado
  status: StatusAgendamento;
  observacoes: string | null;
  cliente?: Cliente;
  servico: Servico;
}

export interface BloqueioAgenda {
  id: number;
  inicio: string;
  fim: string;
  motivo: string | null;
  criadoEm: string;
}

export interface HorariosDisponiveis {
  data: string;
  servicoId: number;
  duracaoMin: number;
  horariosDisponiveis: string[];
}
