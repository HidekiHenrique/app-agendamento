import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CadastroClientePage } from './pages/CadastroClientePage';
import { AgendaPage } from './pages/AgendaPage';
import { ServicosPage } from './pages/ServicosPage';
import { ClientesPage } from './pages/ClientesPage';
import { ClienteAgendamentoPage } from './pages/ClienteAgendamentoPage';
import { MeusAgendamentosPage } from './pages/MeusAgendamentosPage';

type AbaMaster = 'agenda' | 'servicos' | 'clientes';
type AbaCliente = 'agendar' | 'meus-agendamentos';

function AppMaster() {
  const [aba, setAba] = useState<AbaMaster>('agenda');
  const { logout, usuario } = useAuth();

  return (
    <div>
      <header style={estilos.topBar}>
        <span style={estilos.badgePerfil}>Modo Administradora</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>{usuario?.email}</span>
          <button onClick={logout} style={estilos.botaoSair}>
            Sair
          </button>
        </div>
      </header>

      <nav style={estilos.nav}>
        <button
          onClick={() => setAba('agenda')}
          style={estilos.abaBotao(aba === 'agenda')}
        >
          Agenda
        </button>
        <button
          onClick={() => setAba('servicos')}
          style={estilos.abaBotao(aba === 'servicos')}
        >
          Serviços
        </button>
        <button
          onClick={() => setAba('clientes')}
          style={estilos.abaBotao(aba === 'clientes')}
        >
          Clientes
        </button>
      </nav>

      {aba === 'agenda' && <AgendaPage />}
      {aba === 'servicos' && <ServicosPage />}
      {aba === 'clientes' && <ClientesPage />}
    </div>
  );
}

function AppCliente() {
  const [aba, setAba] = useState<AbaCliente>('agendar');
  const { logout, usuario } = useAuth();

  return (
    <div>
      <header style={estilos.topBar}>
        <div>
          <span style={{ fontWeight: 'bold', color: '#444' }}>
            Olá, {usuario?.nome || 'Cliente'}!
          </span>
        </div>
        <button onClick={logout} style={estilos.botaoSair}>
          Sair
        </button>
      </header>

      <nav style={estilos.nav}>
        <button
          onClick={() => setAba('agendar')}
          style={estilos.abaBotao(aba === 'agendar')}
        >
          Agendar Horário
        </button>
        <button
          onClick={() => setAba('meus-agendamentos')}
          style={estilos.abaBotao(aba === 'meus-agendamentos')}
        >
          Meus Agendamentos
        </button>
      </nav>

      {aba === 'agendar' ? (
        <ClienteAgendamentoPage onAgendamentoSucesso={() => setAba('meus-agendamentos')} />
      ) : (
        <MeusAgendamentosPage onNovoAgendamento={() => setAba('agendar')} />
      )}
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: '#fff',
    borderBottom: '1px solid #eaeaea',
    fontFamily: 'system-ui, sans-serif',
  },
  badgePerfil: {
    background: '#f5eee9',
    color: '#8a6d5c',
    fontSize: '0.8rem',
    fontWeight: 'bold' as const,
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
  },
  botaoSair: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#666',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    padding: '1.2rem 0 0.5rem',
    fontFamily: 'system-ui, sans-serif',
  },
  abaBotao: (ativa: boolean) => ({
    border: 'none',
    background: ativa ? '#8a6d5c' : '#eee',
    color: ativa ? '#fff' : '#333',
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: ativa ? ('bold' as const) : ('normal' as const),
    transition: 'all 0.2s',
  }),
};

export default App;
