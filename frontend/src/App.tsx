import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AgendaPage } from './pages/AgendaPage';
import { ServicosPage } from './pages/ServicosPage';

type Aba = 'agenda' | 'servicos';

function AppLogado() {
  const [aba, setAba] = useState<Aba>('agenda');

  return (
    <div>
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
      </nav>
      {aba === 'agenda' ? <AgendaPage /> : <ServicosPage />}
    </div>
  );
}

function Conteudo() {
  const { logado } = useAuth();
  return logado ? <AppLogado /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  );
}

const estilos = {
  nav: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    padding: '1rem 0 0',
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
  }),
};

export default App;
