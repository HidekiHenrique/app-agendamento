import { api } from './client';
import type { Agendamento, Cliente, Servico } from './types';

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, senha }),
};

export const clientesApi = {
  listar: (busca?: string) =>
    api.get<Cliente[]>(`/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
  criar: (dados: { nome: string; telefone?: string }) =>
    api.post<Cliente>('/clientes', dados),
};

export const servicosApi = {
  listar: () => api.get<Servico[]>('/servicos'),
  criar: (dados: { nome: string; duracaoMin: number; preco: number }) =>
    api.post<Servico>('/servicos', dados),
};

export const agendamentosApi = {
  listarPorDia: (data: string) => api.get<Agendamento[]>(`/agendamentos?data=${data}`),
  criar: (dados: {
    clienteId: number;
    servicoId: number;
    dataHora: string;
    observacoes?: string;
  }) => api.post<Agendamento>('/agendamentos', dados),
  atualizarStatus: (id: number, status: string) =>
    api.patch<Agendamento>(`/agendamentos/${id}/status`, { status }),
};
