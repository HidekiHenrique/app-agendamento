import { api } from './client';
import type { Agendamento, BloqueioAgenda, Cliente, HorariosDisponiveis, Servico, Usuario } from './types';

export const authApi = {
  loginMaster: (email: string, senha: string) =>
    api.post<{ access_token: string; user: Usuario }>('/auth/login', { email, senha }),

  loginCliente: (email: string, senha: string) =>
    api.post<{ access_token: string; user: Usuario }>('/auth/cliente/login', { email, senha }),

  cadastrarCliente: (dados: { nome: string; email: string; senha: string; telefone?: string }) =>
    api.post<{ access_token: string; user: Usuario }>('/auth/cliente/cadastro', dados),
};

export const clientesApi = {
  listar: (busca?: string) =>
    api.get<Cliente[]>(`/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),

  criar: (dados: { nome: string; telefone?: string; email?: string; observacoes?: string }) =>
    api.post<Cliente>('/clientes', dados),

  definirCredenciais: (id: number, dados: { email: string; senha: string }) =>
    api.patch<{ message: string; email: string }>(`/clientes/${id}/credenciais`, dados),
};

export const servicosApi = {
  listar: () => api.get<Servico[]>('/servicos'),

  criar: (dados: { nome: string; duracaoMin: number; preco: number }) =>
    api.post<Servico>('/servicos', dados),

  atualizar: (id: number, dados: Partial<{ nome: string; duracaoMin: number; preco: number }>) =>
    api.patch<Servico>(`/servicos/${id}`, dados),

  desativar: (id: number) =>
    api.delete<Servico>(`/servicos/${id}`),
};

export const bloqueiosApi = {
  listar: (data?: string) =>
    api.get<BloqueioAgenda[]>(`/bloqueios${data ? `?data=${data}` : ''}`),

  criar: (dados: { inicio: string; fim: string; motivo?: string }) =>
    api.post<BloqueioAgenda>('/bloqueios', dados),

  remover: (id: number) =>
    api.delete<BloqueioAgenda>(`/bloqueios/${id}`),
};

export const agendamentosApi = {
  // Rotas da Master
  listarPorDia: (data: string) =>
    api.get<Agendamento[]>(`/agendamentos?data=${data}`),

  criar: (dados: {
    clienteId: number;
    servicoId: number;
    dataHora: string;
    observacoes?: string;
  }) => api.post<Agendamento>('/agendamentos', dados),

  atualizarStatus: (id: number, status: string) =>
    api.patch<Agendamento>(`/agendamentos/${id}/status`, { status }),

  // Rotas do Cliente
  listarMeus: () =>
    api.get<Agendamento[]>('/agendamentos/meus'),

  criarCliente: (dados: {
    servicoId: number;
    dataHora: string;
    observacoes?: string;
  }) => api.post<Agendamento>('/agendamentos/cliente', dados),

  cancelarCliente: (id: number) =>
    api.patch<Agendamento>(`/agendamentos/${id}/cancelar-cliente`, {}),

  // Consulta de disponibilidade
  obterHorariosDisponiveis: (servicoId: number, data: string) =>
    api.get<HorariosDisponiveis>(`/agendamentos/horarios-disponiveis?servicoId=${servicoId}&data=${data}`),
};
