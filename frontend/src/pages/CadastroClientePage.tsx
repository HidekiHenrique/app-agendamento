import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrandHeader } from '../components/BrandHeader';

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
      setErro('As senhas digitadas não coincidem.');
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
    <div style={estilos.pageWrapper}>
      <div style={estilos.card}>
        <BrandHeader subtitle="Cadastro de Cliente" />

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nome Completo</label>
            <input
              type="text"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Maria Oliveira"
            />
          </div>

          <div className="input-group">
            <label className="input-label">WhatsApp / Telefone</label>
            <input
              type="tel"
              className="input-field"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="input-group">
            <label className="input-label">E-mail</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <input
              type="password"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirmar Senha</label>
            <input
              type="password"
              className="input-field"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              placeholder="Repita sua senha"
            />
          </div>

          {erro && <div className="alert-error">{erro}</div>}

          <button
            type="submit"
            disabled={carregando}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.4rem' }}
          >
            {carregando ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} />
                <span>Criando conta...</span>
              </>
            ) : (
              'Cadastrar e Acessar'
            )}
          </button>

          <div style={estilos.footer}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Já possui conta cadastrada?
            </span>{' '}
            <button type="button" onClick={onIrParaLogin} style={estilos.linkButton}>
              Fazer login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const estilos = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 1rem',
    background: 'radial-gradient(circle at top, #FAF5F5 0%, #FFFFFF 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#FFFFFF',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.2rem 2rem',
    boxShadow: 'var(--shadow-card)',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-family)',
    textDecoration: 'underline',
    padding: '0 0.2rem',
  },
};
