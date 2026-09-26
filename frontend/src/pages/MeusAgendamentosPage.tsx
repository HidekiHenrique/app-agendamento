import { useEffect, useState } from 'react';
import { agendamentosApi } from '../api/resources';
import type { Agendamento } from '../api/types';

function formatarData(isoString: string) {
  const data = new Date(isoString);
  return data.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatarHora(isoString: string) {
  const data = new Date(isoString);
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeusAgendamentosPage({ onNovoAgendamento }: { onNovoAgendamento: () => void }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [modalConfirmacaoId, setModalConfirmacaoId] = useState<number | null>(null);

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
      setErro(err instanceof Error ? err.message : 'Erro ao carregar seus agendamentos.');
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarCancelamento() {
    if (!modalConfirmacaoId) return;
    const id = modalConfirmacaoId;
    setCancelandoId(id);
    try {
      await agendamentosApi.cancelarCliente(id);
      setModalConfirmacaoId(null);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar agendamento.');
    } finally {
      setCancelandoId(null);
    }
  }

  const agora = new Date().getTime();
  const proximos = agendamentos.filter((a) => new Date(a.dataHora).getTime() >= agora && a.status === 'agendado');
  const historico = agendamentos.filter((a) => new Date(a.dataHora).getTime() < agora || a.status !== 'agendado');

  return (
    <div>
      <div style={estilos.topHeader}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0 }}>Meus Agendamentos</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Acompanhe seus horários marcados e histórico
          </p>
        </div>
        <button onClick={onNovoAgendamento} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          + Novo Horário
        </button>
      </div>

      {erro && <div className="alert-error">{erro}</div>}

      {carregando && (
        <div style={estilos.loadingBox}>
          <span className="spinner" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carregando seus atendimentos...</span>
        </div>
      )}

      {!carregando && agendamentos.length === 0 && (
        <div style={estilos.emptyBox}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginBottom: '0.3rem' }}>
            Nenhum agendamento encontrado
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Você ainda não possui horários marcados no Espaço Selma Sanches.
          </p>
          <button onClick={onNovoAgendamento} className="btn btn-primary">
            Agendar Agora
          </button>
        </div>
      )}

      {/* Próximos Atendimentos */}
      {proximos.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={estilos.subHeader}>
            <span style={estilos.subTitle}>Próximos Atendimentos</span>
            <span style={estilos.countBadge}>{proximos.length}</span>
          </div>

          <div style={estilos.grid}>
            {proximos.map((ag) => (
              <div key={ag.id} className="card" style={estilos.cardAgendamento}>
                <div style={estilos.cardBody}>
                  <div style={estilos.cardLeft}>
                    <div style={estilos.dateTimeBadge}>
                      <span style={estilos.timeText}>{formatarHora(ag.dataHora)}</span>
                      <span style={estilos.dateText}>{formatarData(ag.dataHora)}</span>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <h4 style={estilos.serviceTitle}>{ag.servico.nome}</h4>
                      <p style={estilos.serviceInfo}>
                        {ag.duracaoMin} min · R$ {ag.precoCobrado.toFixed(2)}
                      </p>
                      {ag.observacoes && (
                        <p style={estilos.obsText}>"{ag.observacoes}"</p>
                      )}
                    </div>
                  </div>

                  <div style={estilos.cardRight}>
                    <span className="badge badge-agendado">Confirmado</span>
                    <button
                      onClick={() => setModalConfirmacaoId(ag.id)}
                      className="btn btn-danger-outline"
                      style={estilos.btnCancelar}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <section>
          <div style={estilos.subHeader}>
            <span style={estilos.subTitle}>Histórico de Atendimentos</span>
            <span style={estilos.countBadge}>{historico.length}</span>
          </div>

          <div style={estilos.grid}>
            {historico.map((ag) => {
              const badgeClass =
                ag.status === 'concluido'
                  ? 'badge badge-concluido'
                  : ag.status === 'cancelado'
                  ? 'badge badge-cancelado'
                  : 'badge badge-agendado';

              const statusLabel =
                ag.status === 'concluido'
                  ? 'Concluído'
                  : ag.status === 'cancelado'
                  ? 'Cancelado'
                  : 'Realizado';

              return (
                <div key={ag.id} className="card" style={{ ...estilos.cardAgendamento, opacity: ag.status === 'cancelado' ? 0.75 : 1 }}>
                  <div style={estilos.cardBody}>
                    <div style={estilos.cardLeft}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {formatarData(ag.dataHora)} às {formatarHora(ag.dataHora)}
                      </span>
                      <h4 style={{ ...estilos.serviceTitle, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                        {ag.servico.nome}
                      </h4>
                      <p style={estilos.serviceInfo}>
                        R$ {ag.precoCobrado.toFixed(2)} · {ag.duracaoMin} min
                      </p>
                    </div>
                    <div>
                      <span className={badgeClass}>{statusLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal Delicado de Confirmação de Cancelamento */}
      {modalConfirmacaoId && (
        <div style={estilos.modalOverlay}>
          <div className="card" style={estilos.modalBox}>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              Confirmar Cancelamento
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Deseja realmente cancelar este horário? Esta vaga ficará disponível para outras clientes.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalConfirmacaoId(null)}
                disabled={cancelandoId !== null}
                className="btn btn-secondary"
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                disabled={cancelandoId !== null}
                className="btn btn-primary"
              >
                {cancelandoId !== null ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '0.75rem',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  subHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.85rem',
  },
  subTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
  },
  countBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '0.1rem 0.45rem',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  cardAgendamento: {
    padding: '1.1rem 1.25rem',
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  cardLeft: {
    flex: '1 1 200px',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  dateTimeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'var(--color-primary-subtle)',
    border: '1px solid var(--color-primary-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.3rem 0.6rem',
  },
  timeText: {
    fontWeight: 600,
    color: 'var(--color-primary)',
    fontSize: '0.95rem',
  },
  dateText: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.8rem',
  },
  serviceTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
    margin: '0.4rem 0 0.15rem',
  },
  serviceInfo: {
    fontSize: '0.82rem',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  obsText: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic' as const,
    marginTop: '0.35rem',
    margin: '0.35rem 0 0',
  },
  btnCancelar: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1.5rem',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: '3rem 1.5rem',
    textAlign: 'center' as const,
    background: 'var(--color-surface)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-md)',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  },
  modalBox: {
    width: '100%',
    maxWidth: '380px',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-modal)',
    background: '#FFFFFF',
  },
};
