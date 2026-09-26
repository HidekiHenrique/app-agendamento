import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function CadastroClientePage({ onIrParaLogin }: { onIrParaLogin: () => void }) {
  const { cadastrarCliente } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await cadastrarCliente({
        nome,
        email,
        telefone: telefone || undefined,
        senha,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={estilos.container}>
      <form onSubmit={handleSubmit} style={estilos.card}>
        <h1 style={estilos.titulo}>Criar Conta</h1>
        <p style={estilos.subtitulo}>Cadastre-se para agendar seus horários online</p>

        <label style={estilos.label}>
          Nome completo
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome"
            style={estilos.input}
          />
        </label>

        <label style={estilos.label}>
          WhatsApp / Telefone
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
            style={estilos.input}
          />
        </label>

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
            placeholder="Mínimo 6 caracteres"
            style={estilos.input}
          />
        </label>

        <label style={estilos.label}>
          Confirmar Senha
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            placeholder="Repita sua senha"
            style={estilos.input}
          />
        </label>

        {erro && <p style={estilos.erro}>{erro}</p>}

        <button type="submit" disabled={carregando} style={estilos.botao}>
          {carregando ? 'Cadastrando...' : 'Cadastrar e Entrar'}
        </button>

        <div style={estilos.rodape}>
          <span>Já possui conta?</span>{' '}
          <button type="button" onClick={onIrParaLogin} style={estilos.linkBotao}>
            Faça login
          </button>
        </div>
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
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.9rem',
  },
  titulo: { margin: 0, textAlign: 'center' as const, color: '#333', fontSize: '1.5rem' },
  subtitulo: { margin: '-0.3rem 0 0.5rem', textAlign: 'center' as const, color: '#777', fontSize: '0.85rem' },
  label: { display: 'flex', flexDirection: 'column' as const, gap: '0.2rem', fontSize: '0.85rem', color: '#444' },
  input: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' },
  botao: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#8a6d5c',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  erro: { color: '#c0392b', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 },
  rodape: { textAlign: 'center' as const, fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' },
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
