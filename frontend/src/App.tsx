import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AgendaPage } from './pages/AgendaPage';

function Conteudo() {
  const { logado } = useAuth();
  return logado ? <AgendaPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  );
}

export default App;
