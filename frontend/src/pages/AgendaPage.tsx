import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agendamentosApi, clientesApi, servicosApi } from '../api/resources';
import type { Agendamento, Cliente, Servico } from '../api/types';

function hojeISO() {
  return new Date().toISOString().split('T')[0]; // "2026-07-28"
}

function formatarHora(dataHoraUTC: string) {
  return new Date(dataHoraUTC).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AgendaPage() {
  const { logout } = useAuth();
  const [data, setData] = useState(hojeISO());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    servicosApi.listar().then(setServicos).catch(() => {});
    clientesApi.listar().then(setClientes).catch(() => {});
  }, []);

  useEffect(() => {
    carregarAgenda();
  }, [data]);

  async function carregarAgenda() {
    setCarregando(true);
    try {
      const lista = await agendamentosApi.listarPorDia(data);
      setAgendamentos(lista);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar agenda.');
    } finally {
      setCarregando(false);
    }
  }

  async function marcarConcluido(id: number) {
    await agendamentosApi.atualizarStatus(id, 'concluido');
    carregarAgenda();
  }

  async function cancelar(id: number) {
    await agendamentosApi.atualizarStatus(id, 'cancelado');
    carregarAgenda();
  }

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <h1 style={estilos.titulo}>Agenda</h1>
        <button onClick={logout} style={estilos.botaoSair}>
          Sair
        </button>
      </header>

      <div style={estilos.seletorData}>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={estilos.inputData}
        />
      </div>

      <NovoAgendamentoForm
        data={data}
        clientes={clientes}
        servicos={servicos}
        onCriado={carregarAgenda}
      />

      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      {carregando && <p>Carregando...</p>}

      <ul style={estilos.lista}>
        {agendamentos.length === 0 && !carregando && (
          <p style={{ color: '#888' }}>Nenhum agendamento nesse dia.</p>
        )}
        {agendamentos.map((ag) => (
          <li key={ag.id} style={estilos.item(ag.status)}>
            <div>
              <strong>{formatarHora(ag.dataHora)}</strong> — {ag.cliente.nome}
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {ag.servico.nome} ({ag.duracaoMin}min) · R$
                {ag.precoCobrado.toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ag.status === 'agendado' && (
                <>
                  <button onClick={() => marcarConcluido(ag.id)} style={estilos.botaoAcao}>
                    ✓ Concluir
                  </button>
                  <button onClick={() => cancelar(ag.id)} style={estilos.botaoAcaoCancelar}>
                    ✕ Cancelar
                  </button>
                </>
              )}
              {ag.status !== 'agendado' && <span>{ag.status}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NovoAgendamentoForm({
  data,
  clientes,
  servicos,
  onCriado,
}: {
  data: string;
  clientes: Cliente[];
  servicos: Servico[];
  onCriado: () => void;
}) {
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [hora, setHora] = useState('09:00');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await agendamentosApi.criar({
        clienteId: Number(clienteId),
        servicoId: Number(servicoId),
        dataHora: `${data}T${hora}:00`,
      });
      setClienteId('');
      setServicoId('');
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={estilos.formNovo}>
      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
        <option value="">Cliente...</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} required>
        <option value="">Serviço...</option>
        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome} ({s.duracaoMin}min)
          </option>
        ))}
      </select>

      <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />

      <button type="submit" disabled={salvando} style={estilos.botaoAdicionar}>
        {salvando ? 'Salvando...' : '+ Agendar'}
      </button>

      {erro && <p style={{ color: '#c0392b', fontSize: '0.85rem' }}>{erro}</p>}
    </form>
  );
}

const estilos = {
  pagina: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: { margin: 0 },
  botaoSair: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
  },
  seletorData: { margin: '1rem 0' },
  inputData: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' },
  formNovo: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    background: '#f5f3f0',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  botaoAdicionar: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  lista: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  item: (status: string) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #eee',
    background: status === 'cancelado' ? '#fdf0f0' : status === 'concluido' ? '#f0f7f0' : '#fff',
    opacity: status === 'cancelado' ? 0.6 : 1,
  }),
  botaoAcao: {
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  botaoAcaoCancelar: {
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};
