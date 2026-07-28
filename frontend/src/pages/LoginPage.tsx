import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
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

        <label style={estilos.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            style={estilos.input}
          />
        </label>

        {erro && <p style={estilos.erro}>{erro}</p>}

        <button type="submit" disabled={carregando} style={estilos.botao}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
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
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    width: '320px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  titulo: { margin: 0, marginBottom: '0.5rem', textAlign: 'center' as const },
  label: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem', fontSize: '0.9rem' },
  input: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  botao: {
    padding: '0.7rem',
    borderRadius: '6px',
    border: 'none',
    background: '#8a6d5c',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  erro: { color: '#c0392b', fontSize: '0.85rem', margin: 0 },
};
