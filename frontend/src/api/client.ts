const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Wrapper simples em cima do fetch. Adiciona automaticamente o header
 * Authorization com o token JWT salvo, e trata erros de forma consistente.
 *
 * Paralelo com o que você faz no jQuery Ajax: em vez de repetir headers e
 * tratamento de erro em cada chamada, centraliza aqui uma vez só.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expirou ou é inválido - desloga e manda de volta pro login.
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sessão expirada.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || 'Erro inesperado.';
    throw new Error(mensagem);
  }

  return data as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
