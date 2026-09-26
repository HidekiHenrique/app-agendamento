import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/resources';
import type { UserRole, Usuario } from '../api/types';

interface AuthContextType {
  logado: boolean;
  usuario: Usuario | null;
  role: UserRole | null;
  loginMaster: (email: string, senha: string) => Promise<void>;
  loginCliente: (email: string, senha: string) => Promise<void>;
  cadastrarCliente: (dados: { nome: string; email: string; senha: string; telefone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function carregarUsuarioSalvo(): Usuario | null {
  const salvo = localStorage.getItem('usuario');
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState<Usuario | null>(() => carregarUsuarioSalvo());

  function salvarSessao(novoToken: string, novoUsuario: Usuario) {
    localStorage.setItem('token', novoToken);
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    setToken(novoToken);
    setUsuario(novoUsuario);
  }

  async function loginMaster(email: string, senha: string) {
    const res = await authApi.loginMaster(email, senha);
    salvarSessao(res.access_token, res.user);
  }

  async function loginCliente(email: string, senha: string) {
    const res = await authApi.loginCliente(email, senha);
    salvarSessao(res.access_token, res.user);
  }

  async function cadastrarCliente(dados: { nome: string; email: string; senha: string; telefone?: string }) {
    const res = await authApi.cadastrarCliente(dados);
    salvarSessao(res.access_token, res.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }

  const logado = Boolean(token && usuario);
  const role = usuario?.role || null;

  return (
    <AuthContext.Provider
      value={{
        logado,
        usuario,
        role,
        loginMaster,
        loginCliente,
        cadastrarCliente,
        logout,
      }}
    >
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
