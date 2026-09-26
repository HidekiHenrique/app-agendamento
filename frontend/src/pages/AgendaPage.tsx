import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agendamentosApi, bloqueiosApi, clientesApi, servicosApi } from '../api/resources';
import type { Agendamento, BloqueioAgenda, Cliente, Servico } from '../api/types';

function hojeISO() {
  return new Date().toLocaleDateString('en-CA');
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
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [exibirFormBloqueio, setExibirFormBloqueio] = useState(false);

  useEffect(() => {
    servicosApi.listar().then(setServicos).catch(() => {});
    clientesApi.listar().then(setClientes).catch(() => {});
  }, []);

  useEffect(() => {
    carregarAgenda();
  }, [data]);

  async function carregarAgenda() {
    setCarregando(true);
    setErro('');
    try {
      const [listaAg, listaBl] = await Promise.all([
        agendamentosApi.listarPorDia(data),
        bloqueiosApi.listar(data),
      ]);
      setAgendamentos(listaAg);
      setBloqueios(listaBl);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar agenda.');
    } finally {
      setCarregando(false);
    }
  }

  async function marcarConcluido(id: number) {
    try {
      await agendamentosApi.atualizarStatus(id, 'concluido');
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao concluir agendamento.');
    }
  }

  async function cancelar(id: number) {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    try {
      await agendamentosApi.atualizarStatus(id, 'cancelado');
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar agendamento.');
    }
  }

  async function removerBloqueio(id: number) {
    if (!confirm('Deseja desbloquear este horário?')) return;
    try {
      await bloqueiosApi.remover(id);
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover bloqueio.');
    }
  }

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <h1 style={estilos.titulo}>Agenda Geral</h1>
        <button onClick={logout} style={estilos.botaoSair}>
          Sair
        </button>
      </header>

      <div style={estilos.topoControles}>
        <div style={estilos.seletorData}>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={estilos.inputData}
          />
        </div>
        <button
          onClick={() => setExibirFormBloqueio((v) => !v)}
          style={estilos.botaoToggleBloqueio}
        >
          {exibirFormBloqueio ? 'Fechar Bloqueio' : '🔒 Bloquear Horário'}
        </button>
      </div>

      {exibirFormBloqueio && (
        <NovoBloqueioForm
          data={data}
          onCriado={() => {
            setExibirFormBloqueio(false);
            carregarAgenda();
          }}
        />
      )}

      <NovoAgendamentoForm
        data={data}
        clientes={clientes}
        servicos={servicos}
        onCriado={carregarAgenda}
      />

      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      {carregando && <p style={{ color: '#777' }}>Carregando dia...</p>}

      {/* Bloqueios do Dia */}
      {bloqueios.length > 0 && (
        <div style={estilos.secaoBloqueios}>
          <strong style={{ fontSize: '0.9rem', color: '#8c4b28' }}>Bloqueios de Horário no Dia:</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            {bloqueios.map((b) => (
              <div key={b.id} style={estilos.itemBloqueio}>
                <span>
                  🔒 <strong>{formatarHora(b.inicio)} às {formatarHora(b.fim)}</strong>
                  {b.motivo ? ` — ${b.motivo}` : ''}
                </span>
                <button onClick={() => removerBloqueio(b.id)} style={estilos.botaoRemoverBloqueio}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agendamentos */}
      <ul style={estilos.lista}>
        {agendamentos.length === 0 && !carregando && (
          <p style={{ color: '#888' }}>Nenhum atendimento agendado nesse dia.</p>
        )}
        {agendamentos.map((ag) => (
          <li key={ag.id} style={estilos.item(ag.status)}>
            <div>
              <strong>{formatarHora(ag.dataHora)}</strong> — {ag.cliente?.nome || 'Cliente'}
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {ag.servico.nome} ({ag.duracaoMin}min) · R$ {ag.precoCobrado.toFixed(2)}
              </div>
              {ag.observacoes && (
                <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>
                  Obs: {ag.observacoes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
              {ag.status !== 'agendado' && (
                <span style={estilos.badge(ag.status)}>
                  {ag.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NovoBloqueioForm({ data, onCriado }: { data: string; onCriado: () => void }) {
  const [inicioHora, setInicioHora] = useState('12:00');
  const [fimHora, setFimHora] = useState('13:00');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (fimHora <= inicioHora) {
      setErro('O horário final deve ser após o horário inicial.');
      return;
    }

    setSalvando(true);
    try {
      await bloqueiosApi.criar({
        inicio: `${data}T${inicioHora}:00`,
        fim: `${data}T${fimHora}:00`,
        motivo: motivo.trim() || undefined,
      });
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar bloqueio.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={estilos.formBloqueio}>
      <div style={{ width: '100%', fontWeight: 'bold', fontSize: '0.9rem', color: '#8c4b28' }}>
        Definir Indisponibilidade / Bloqueio
      </div>
      <label style={{ fontSize: '0.85rem' }}>
        Das:
        <input
          type="time"
          value={inicioHora}
          onChange={(e) => setInicioHora(e.target.value)}
          required
          style={{ marginLeft: '0.3rem', padding: '0.3rem' }}
        />
      </label>
      <label style={{ fontSize: '0.85rem' }}>
        Até:
        <input
          type="time"
          value={fimHora}
          onChange={(e) => setFimHora(e.target.value)}
          required
          style={{ marginLeft: '0.3rem', padding: '0.3rem' }}
        />
      </label>
      <input
        type="text"
        placeholder="Motivo (ex: Almoço, Folga, Médico)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        style={{ flex: 1, minWidth: '150px', padding: '0.4rem' }}
      />
      <button type="submit" disabled={salvando} style={estilos.botaoSalvarBloqueio}>
        {salvando ? 'Salvando...' : 'Salvar Bloqueio'}
      </button>
      {erro && <p style={{ color: '#c0392b', fontSize: '0.85rem', width: '100%', margin: 0 }}>{erro}</p>}
    </form>
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
      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required style={estilos.select}>
        <option value="">Selecione o Cliente...</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome} {c.telefone ? `(${c.telefone})` : ''}
          </option>
        ))}
      </select>

      <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} required style={estilos.select}>
        <option value="">Selecione o Serviço...</option>
        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome} ({s.duracaoMin}min - R$ {s.preco.toFixed(2)})
          </option>
        ))}
      </select>

      <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required style={estilos.inputHora} />

      <button type="submit" disabled={salvando} style={estilos.botaoAdicionar}>
        {salvando ? 'Salvando...' : '+ Agendar'}
      </button>

      {erro && <p style={{ color: '#c0392b', fontSize: '0.85rem', width: '100%', margin: '0.3rem 0 0' }}>{erro}</p>}
    </form>
  );
}

const estilos = {
  pagina: {
    maxWidth: '650px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  titulo: { margin: 0, color: '#333' },
  botaoSair: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    color: '#666',
  },
  topoControles: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  seletorData: { margin: 0 },
  inputData: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  botaoToggleBloqueio: {
    background: '#fff',
    border: '1px solid #c99377',
    color: '#8c4b28',
    borderRadius: '6px',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold' as const,
  },
  formBloqueio: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    background: '#fbf3ed',
    padding: '0.9rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #f2ded1',
  },
  botaoSalvarBloqueio: {
    background: '#a05c36',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold' as const,
  },
  secaoBloqueios: {
    background: '#fcf6f2',
    border: '1px dashed #d9b8a3',
    padding: '0.8rem',
    borderRadius: '8px',
    marginBottom: '1.2rem',
  },
  itemBloqueio: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#5c331c',
  },
  botaoRemoverBloqueio: {
    background: 'none',
    border: 'none',
    color: '#c0392b',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textDecoration: 'underline',
  },
  formNovo: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    background: '#f5f3f0',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    flex: '1 1 180px',
  },
  inputHora: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  botaoAdicionar: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  lista: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  item: (status: string) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid #eee',
    background: status === 'cancelado' ? '#fdf0f0' : status === 'concluido' ? '#f0f7f0' : '#fff',
    opacity: status === 'cancelado' ? 0.65 : 1,
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
  badge: (status: string) => ({
    fontSize: '0.8rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '10px',
    background: status === 'concluido' ? '#e8f5e9' : '#ffebee',
    color: status === 'concluido' ? '#2e7d32' : '#c62828',
    fontWeight: 'bold' as const,
  }),
};
