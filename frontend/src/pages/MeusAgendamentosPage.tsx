import { useEffect, useState } from 'react';
import { agendamentosApi } from '../api/resources';
import type { Agendamento } from '../api/types';

function formatarDataHora(isoString: string) {
  const data = new Date(isoString);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeusAgendamentosPage({ onNovoAgendamento }: { onNovoAgendamento: () => void }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await agendamentosApi.listarMeus();
      setAgendamentos(lista);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar agendamentos.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCancelar(id: number) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) {
      return;
    }

    setCancelandoId(id);
    try {
      await agendamentosApi.cancelarCliente(id);
      await carregar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar agendamento.');
    } finally {
      setCancelandoId(null);
    }
  }

  const agora = new Date().getTime();
  const proximos = agendamentos.filter((a) => new Date(a.dataHora).getTime() >= agora && a.status === 'agendado');
  const historico = agendamentos.filter((a) => new Date(a.dataHora).getTime() < agora || a.status !== 'agendado');

  return (
    <div style={estilos.pagina}>
      <div style={estilos.topo}>
        <h2 style={{ margin: 0, color: '#333' }}>Meus Agendamentos</h2>
        <button onClick={onNovoAgendamento} style={estilos.botaoNovo}>
          + Novo Agendamento
        </button>
      </div>

      {erro && <p style={estilos.erroMsg}>{erro}</p>}
      {carregando && <p style={{ color: '#777' }}>Carregando seus agendamentos...</p>}

      {!carregando && agendamentos.length === 0 && (
        <div style={estilos.vazio}>
          <p>Você ainda não possui nenhum agendamento.</p>
          <button onClick={onNovoAgendamento} style={estilos.botaoNovo}>
            Agendar Agora
          </button>
        </div>
      )}

      {/* Próximos */}
      {proximos.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3 style={estilos.secaoSub}>Próximos Atendimentos</h3>
          <div style={estilos.lista}>
            {proximos.map((ag) => (
              <div key={ag.id} style={estilos.cardAgendamento(ag.status)}>
                <div>
                  <div style={estilos.dataHora}>{formatarDataHora(ag.dataHora)}</div>
                  <div style={estilos.servicoNome}>{ag.servico.nome}</div>
                  <div style={estilos.detalhes}>
                    Duração: {ag.duracaoMin} min · R$ {ag.precoCobrado.toFixed(2)}
                  </div>
                  {ag.observacoes && (
                    <div style={estilos.obs}>Obs: {ag.observacoes}</div>
                  )}
                </div>
                <button
                  onClick={() => handleCancelar(ag.id)}
                  disabled={cancelandoId === ag.id}
                  style={estilos.botaoCancelar}
                >
                  {cancelandoId === ag.id ? 'Cancelando...' : 'Cancelar'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h3 style={estilos.secaoSub}>Histórico</h3>
          <div style={estilos.lista}>
            {historico.map((ag) => (
              <div key={ag.id} style={estilos.cardAgendamento(ag.status)}>
                <div>
                  <div style={estilos.dataHora}>{formatarDataHora(ag.dataHora)}</div>
                  <div style={estilos.servicoNome}>{ag.servico.nome}</div>
                  <div style={estilos.detalhes}>
                    R$ {ag.precoCobrado.toFixed(2)} · {ag.duracaoMin} min
                  </div>
                </div>
                <div>
                  <span style={estilos.badge(ag.status)}>
                    {ag.status === 'concluido' ? 'Concluído' : ag.status === 'cancelado' ? 'Cancelado' : ag.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const estilos = {
  pagina: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: 'system-ui, sans-serif',
  },
  topo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  botaoNovo: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 0.9rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const,
  },
  secaoSub: {
    fontSize: '1.05rem',
    color: '#555',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.3rem',
    marginBottom: '0.8rem',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.8rem',
  },
  cardAgendamento: (status: string) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    opacity: status === 'cancelado' ? 0.65 : 1,
  }),
  dataHora: {
    fontWeight: 'bold' as const,
    fontSize: '1rem',
    color: '#333',
  },
  servicoNome: {
    fontSize: '0.95rem',
    color: '#8a6d5c',
    marginTop: '0.2rem',
    fontWeight: '600' as const,
  },
  detalhes: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.2rem',
  },
  obs: {
    fontSize: '0.8rem',
    color: '#777',
    fontStyle: 'italic' as const,
    marginTop: '0.3rem',
  },
  botaoCancelar: {
    background: '#fff',
    color: '#c0392b',
    border: '1px solid #c0392b',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold' as const,
  },
  badge: (status: string) => ({
    fontSize: '0.8rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '12px',
    background: status === 'concluido' ? '#e8f5e9' : status === 'cancelado' ? '#ffebee' : '#f5f5f5',
    color: status === 'concluido' ? '#2e7d32' : status === 'cancelado' ? '#c62828' : '#666',
    fontWeight: 'bold' as const,
  }),
  vazio: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    background: '#fff',
    borderRadius: '8px',
    border: '1px dashed #ccc',
    color: '#777',
  },
  erroMsg: {
    background: '#fdf0f0',
    color: '#c0392b',
    padding: '0.7rem',
    borderRadius: '6px',
    border: '1px solid #fadbd8',
  },
};
