import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/resources';

interface AuthContextType {
  logado: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Paralelo com PHP: isso substitui a checagem de $_SESSION['usuario_id']
 * que você faria em cada página. Aqui, qualquer componente pode chamar
 * useAuth() pra saber se está logado, em vez de checar sessão manualmente.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [logado, setLogado] = useState(() => !!localStorage.getItem('token'));

  async function login(email: string, senha: string) {
    const { access_token } = await authApi.login(email, senha);
    localStorage.setItem('token', access_token);
    setLogado(true);
  }

  function logout() {
    localStorage.removeItem('token');
    setLogado(false);
  }

  return (
    <AuthContext.Provider value={{ logado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>');
  }
  return context;
}
