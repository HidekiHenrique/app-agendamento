import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../api/types';

export function LoginPage({ onIrParaCadastro }: { onIrParaCadastro: () => void }) {
  const { loginMaster, loginCliente } = useAuth();
  const [tipoLogin, setTipoLogin] = useState<UserRole>('cliente');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (tipoLogin === 'master') {
        await loginMaster(email, senha);
      } else {
        await loginCliente(email, senha);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={estilos.container}>
      <form onSubmit={handleSubmit} style={estilos.card}>
        <h1 style={estilos.titulo}>Agenda</h1>

        <div style={estilos.seletorPerfil}>
          <button
            type="button"
            onClick={() => {
              setTipoLogin('cliente');
              setErro('');
            }}
            style={estilos.abaPerfil(tipoLogin === 'cliente')}
          >
            Sou Cliente
          </button>
          <button
            type="button"
            onClick={() => {
              setTipoLogin('master');
              setErro('');
            }}
            style={estilos.abaPerfil(tipoLogin === 'master')}
          >
            Administradora
          </button>
        </div>

        <label style={estilos.label}>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            style={estilos.input}
          />
        </label>

        <label style={estilos.label}>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Sua senha"
            style={estilos.input}
          />
        </label>

        {erro && <p style={estilos.erro}>{erro}</p>}

        <button type="submit" disabled={carregando} style={estilos.botao}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        {tipoLogin === 'cliente' && (
          <div style={estilos.rodape}>
            <span>Não tem conta?</span>{' '}
            <button type="button" onClick={onIrParaCadastro} style={estilos.linkBotao}>
              Cadastre-se para agendar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

const estilos = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f3f0',
    fontFamily: 'system-ui, sans-serif',
    padding: '1.5rem',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  titulo: { margin: 0, textAlign: 'center' as const, color: '#333' },
  seletorPerfil: {
    display: 'flex',
    background: '#f0edea',
    borderRadius: '8px',
    padding: '3px',
    marginBottom: '0.2rem',
  },
  abaPerfil: (ativa: boolean) => ({
    flex: 1,
    padding: '0.5rem',
    border: 'none',
    borderRadius: '6px',
    background: ativa ? '#8a6d5c' : 'transparent',
    color: ativa ? '#fff' : '#666',
    fontWeight: ativa ? ('bold' as const) : ('normal' as const),
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  label: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem', fontSize: '0.9rem', color: '#444' },
  input: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  botao: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#8a6d5c',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginTop: '0.2rem',
  },
  erro: { color: '#c0392b', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 },
  rodape: { textAlign: 'center' as const, fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' },
  linkBotao: {
    background: 'none',
    border: 'none',
    color: '#8a6d5c',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
};
