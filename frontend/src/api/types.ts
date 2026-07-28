export interface Cliente {
  id: number;
  nome: string;
  telefone: string | null;
  observacoes: string | null;
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
  status: StatusAgendamento;
  observacoes: string | null;
  cliente: Cliente;
  servico: Servico;
}
