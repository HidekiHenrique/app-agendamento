import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CadastroClientePage } from './pages/CadastroClientePage';
import { AgendaPage } from './pages/AgendaPage';
import { ServicosPage } from './pages/ServicosPage';
import { ClientesPage } from './pages/ClientesPage';
import { ClienteAgendamentoPage } from './pages/ClienteAgendamentoPage';
import { MeusAgendamentosPage } from './pages/MeusAgendamentosPage';
import { BrandHeader } from './components/BrandHeader';

type AbaMaster = 'agenda' | 'servicos' | 'clientes';
type AbaCliente = 'agendar' | 'meus-agendamentos';

function AppMaster() {
  const [aba, setAba] = useState<AbaMaster>('agenda');
  const { logout, usuario } = useAuth();

  return (
    <div style={estilos.appLayout}>
      <header style={estilos.topBar}>
        <BrandHeader compact subtitle="Painel da Administradora" />
        <div style={estilos.topBarRight}>
          <span style={estilos.userEmail}>{usuario?.email}</span>
          <button onClick={logout} className="btn btn-secondary" style={estilos.botaoSair}>
            Sair
          </button>
        </div>
      </header>

      <nav style={estilos.nav}>
        <button
          onClick={() => setAba('agenda')}
          style={estilos.navPill(aba === 'agenda')}
        >
          Agenda Geral
        </button>
        <button
          onClick={() => setAba('servicos')}
          style={estilos.navPill(aba === 'servicos')}
        >
          Serviços
        </button>
        <button
          onClick={() => setAba('clientes')}
          style={estilos.navPill(aba === 'clientes')}
        >
          Clientes
        </button>
      </nav>

      <main className="container">
        {aba === 'agenda' && <AgendaPage />}
        {aba === 'servicos' && <ServicosPage />}
        {aba === 'clientes' && <ClientesPage />}
      </main>
    </div>
  );
}

function AppCliente() {
  const [aba, setAba] = useState<AbaCliente>('agendar');
  const { logout, usuario } = useAuth();

  return (
    <div style={estilos.appLayout}>
      <header style={estilos.topBar}>
        <BrandHeader compact subtitle="Estética & Bem-Estar" />
        <div style={estilos.topBarRight}>
          <span style={estilos.userName}>
            Olá, <strong>{usuario?.nome?.split(' ')[0] || 'Cliente'}</strong>
          </span>
          <button onClick={logout} className="btn btn-secondary" style={estilos.botaoSair}>
            Sair
          </button>
        </div>
      </header>

      <nav style={estilos.nav}>
        <button
          onClick={() => setAba('agendar')}
          style={estilos.navPill(aba === 'agendar')}
        >
          Agendar Horário
        </button>
        <button
          onClick={() => setAba('meus-agendamentos')}
          style={estilos.navPill(aba === 'meus-agendamentos')}
        >
          Meus Agendamentos
        </button>
      </nav>

      <main className="container">
        {aba === 'agendar' ? (
          <ClienteAgendamentoPage onAgendamentoSucesso={() => setAba('meus-agendamentos')} />
        ) : (
          <MeusAgendamentosPage onNovoAgendamento={() => setAba('agendar')} />
        )}
      </main>
    </div>
  );
}

function Conteudo() {
  const { logado, role } = useAuth();
  const [telaAuth, setTelaAuth] = useState<'login' | 'cadastro'>('login');

  if (!logado) {
    if (telaAuth === 'cadastro') {
      return <CadastroClientePage onIrParaLogin={() => setTelaAuth('login')} />;
    }
    return <LoginPage onIrParaCadastro={() => setTelaAuth('cadastro')} />;
  }

  return role === 'master' ? <AppMaster /> : <AppCliente />;
}

function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  );
}

const estilos = {
  appLayout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--color-bg)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1.25rem',
    background: '#FFFFFF',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
  },
  userEmail: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    display: 'none',
    '@media (min-width: 500px)': {
      display: 'inline',
    },
  },
  botaoSair: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    padding: '1rem 0.75rem 0.5rem',
    borderBottom: '1px solid var(--color-border-subtle)',
    background: '#FFFFFF',
  },
  navPill: (ativo: boolean) => ({
    border: 'none',
    background: ativo ? 'var(--color-primary)' : 'var(--color-surface)',
    color: ativo ? '#FFFFFF' : 'var(--color-text-secondary)',
    padding: '0.55rem 1.15rem',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: ativo ? 600 : 500,
    transition: 'var(--transition)',
    boxShadow: ativo ? 'var(--shadow-primary)' : 'none',
    fontFamily: 'var(--font-family)',
  }),
};

export default App;
