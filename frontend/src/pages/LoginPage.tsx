import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../api/types';
import { BrandHeader } from '../components/BrandHeader';

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
    <div style={estilos.pageWrapper}>
      <div style={estilos.loginCard}>
        <BrandHeader subtitle="Agendamentos Online" />

        <div style={estilos.tabsContainer}>
          <button
            type="button"
            onClick={() => {
              setTipoLogin('cliente');
              setErro('');
            }}
            style={estilos.tabButton(tipoLogin === 'cliente')}
          >
            Sou Cliente
          </button>
          <button
            type="button"
            onClick={() => {
              setTipoLogin('master');
              setErro('');
            }}
            style={estilos.tabButton(tipoLogin === 'master')}
          >
            Administradora
          </button>
        </div>

        <form onSubmit={handleSubmit} style={estilos.form}>
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
              placeholder="Digite sua senha"
            />
          </div>

          {erro && <div className="alert-error">{erro}</div>}

          <button type="submit" disabled={carregando} className="btn btn-primary" style={{ width: '100%', marginTop: '0.4rem' }}>
            {carregando ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} />
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar'
            )}
          </button>

          {tipoLogin === 'cliente' && (
            <div style={estilos.footer}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Primeira vez aqui?
              </span>{' '}
              <button type="button" onClick={onIrParaCadastro} style={estilos.linkButton}>
                Criar minha conta
              </button>
            </div>
          )}
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
  loginCard: {
    width: '100%',
    maxWidth: '380px',
    background: '#FFFFFF',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.2rem 2rem',
    boxShadow: 'var(--shadow-card)',
  },
  tabsContainer: {
    display: 'flex',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
    padding: '3px',
    border: '1px solid var(--color-border)',
    marginBottom: '1.4rem',
  },
  tabButton: (ativo: boolean) => ({
    flex: 1,
    padding: '0.55rem 0.5rem',
    border: 'none',
    borderRadius: 'calc(var(--radius-sm) - 2px)',
    background: ativo ? '#FFFFFF' : 'transparent',
    color: ativo ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontWeight: ativo ? 600 : 400,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
    boxShadow: ativo ? 'var(--shadow-sm)' : 'none',
    fontFamily: 'var(--font-family)',
  }),
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
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
