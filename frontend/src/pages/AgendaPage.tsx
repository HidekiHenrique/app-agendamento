import { useEffect, useState } from 'react';
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

function formatarDataExtenso(dataISO: string) {
  return new Date(`${dataISO}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function AgendaPage() {
  const [data, setData] = useState(hojeISO());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [exibirFormBloqueio, setExibirFormBloqueio] = useState(false);
  const [exibirFormNovoAgendamento, setExibirFormNovoAgendamento] = useState(false);

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
      setErro(err instanceof Error ? err.message : 'Erro ao carregar agenda do dia.');
    } finally {
      setCarregando(false);
    }
  }

  async function marcarConcluido(id: number) {
    try {
      await agendamentosApi.atualizarStatus(id, 'concluido');
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao concluir atendimento.');
    }
  }

  async function cancelar(id: number) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await agendamentosApi.atualizarStatus(id, 'cancelado');
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar agendamento.');
    }
  }

  async function removerBloqueio(id: number) {
    if (!confirm('Deseja remover este bloqueio de horário?')) return;
    try {
      await bloqueiosApi.remover(id);
      carregarAgenda();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover bloqueio.');
    }
  }

  return (
    <div>
      <div style={estilos.topHeader}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0 }}>Agenda Diária</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0', textTransform: 'capitalize' }}>
            {formatarDataExtenso(data)}
          </p>
        </div>

        <div style={estilos.actionButtons}>
          <button
            onClick={() => setExibirFormNovoAgendamento((v) => !v)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            {exibirFormNovoAgendamento ? 'Fechar Formulário' : '+ Agendar Atendimento'}
          </button>
          <button
            onClick={() => setExibirFormBloqueio((v) => !v)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            {exibirFormBloqueio ? 'Fechar Bloqueio' : '🔒 Bloquear Horário'}
          </button>
        </div>
      </div>

      <div style={estilos.dateControlBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Selecionar Data:
          </span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontWeight: 500 }}
          />
        </div>
        <button
          onClick={() => setData(hojeISO())}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
        >
          Hoje
        </button>
      </div>

      {erro && <div className="alert-error">{erro}</div>}

      {/* Formulário de Novo Bloqueio */}
      {exibirFormBloqueio && (
        <NovoBloqueioForm
          data={data}
          onCriado={() => {
            setExibirFormBloqueio(false);
            carregarAgenda();
          }}
          onCancelar={() => setExibirFormBloqueio(false)}
        />
      )}

      {/* Formulário de Novo Agendamento pela Master */}
      {exibirFormNovoAgendamento && (
        <NovoAgendamentoForm
          data={data}
          clientes={clientes}
          servicos={servicos}
          onCriado={() => {
            setExibirFormNovoAgendamento(false);
            carregarAgenda();
          }}
          onCancelar={() => setExibirFormNovoAgendamento(false)}
        />
      )}

      {carregando && (
        <div style={estilos.loadingBox}>
          <span className="spinner" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carregando atendimentos...</span>
        </div>
      )}

      {/* Bloqueios do Dia */}
      {bloqueios.length > 0 && (
        <div style={estilos.bloqueiosSection}>
          <div style={estilos.bloqueioHeader}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
              🔒 Horários Bloqueados no Dia
            </span>
          </div>
          <div style={estilos.bloqueiosList}>
            {bloqueios.map((b) => (
              <div key={b.id} style={estilos.bloqueioItem}>
                <div>
                  <strong>{formatarHora(b.inicio)} às {formatarHora(b.fim)}</strong>
                  {b.motivo && <span style={{ color: 'var(--color-text-muted)' }}> — {b.motivo}</span>}
                </div>
                <button onClick={() => removerBloqueio(b.id)} style={estilos.linkRemoverBloqueio}>
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Atendimentos */}
      <div style={estilos.agendaList}>
        {!carregando && agendamentos.length === 0 && (
          <div style={estilos.emptyBox}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Nenhum agendamento marcado para esta data.
            </p>
          </div>
        )}

        {agendamentos.map((ag) => {
          const isCancelado = ag.status === 'cancelado';
          const isConcluido = ag.status === 'concluido';

          return (
            <div key={ag.id} className="card" style={{ ...estilos.agendamentoCard, opacity: isCancelado ? 0.65 : 1 }}>
              <div style={estilos.cardContent}>
                <div style={estilos.timeColumn}>
                  <span style={estilos.horaDestaque}>{formatarHora(ag.dataHora)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {ag.duracaoMin} min
                  </span>
                </div>

                <div style={estilos.infoColumn}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={estilos.clienteNome}>{ag.cliente?.nome || 'Cliente'}</h4>
                    {ag.cliente?.telefone && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ({ag.cliente.telefone})
                      </span>
                    )}
                  </div>
                  <div style={estilos.procedimentoInfo}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{ag.servico.nome}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}> · R$ {ag.precoCobrado.toFixed(2)}</span>
                  </div>
                  {ag.observacoes && (
                    <p style={estilos.obsTexto}>Obs: {ag.observacoes}</p>
                  )}
                </div>

                <div style={estilos.acoesColumn}>
                  {ag.status === 'agendado' && (
                    <>
                      <button onClick={() => marcarConcluido(ag.id)} className="btn btn-primary" style={estilos.btnConcluir}>
                        ✓ Concluir
                      </button>
                      <button onClick={() => cancelar(ag.id)} className="btn btn-danger-outline" style={estilos.btnCancelarAcao}>
                        Cancelar
                      </button>
                    </>
                  )}
                  {ag.status !== 'agendado' && (
                    <span className={isConcluido ? 'badge badge-concluido' : 'badge badge-cancelado'}>
                      {isConcluido ? 'Concluído' : 'Cancelado'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NovoBloqueioForm({
  data,
  onCriado,
  onCancelar,
}: {
  data: string;
  onCriado: () => void;
  onCancelar: () => void;
}) {
  const [inicioHora, setInicioHora] = useState('12:00');
  const [fimHora, setFimHora] = useState('13:00');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (fimHora <= inicioHora) {
      setErro('O horário final deve ser posterior ao horário inicial.');
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
    <form onSubmit={handleSubmit} className="card" style={estilos.boxFormulario}>
      <div style={estilos.boxHeader}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
          Bloquear Horário / Indisponibilidade
        </h4>
        <button type="button" onClick={onCancelar} style={estilos.btnFechar}>✕</button>
      </div>

      <div style={estilos.formLinha}>
        <div className="input-group" style={{ flex: '1 1 120px', margin: 0 }}>
          <label className="input-label">Início</label>
          <input
            type="time"
            value={inicioHora}
            onChange={(e) => setInicioHora(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-group" style={{ flex: '1 1 120px', margin: 0 }}>
          <label className="input-label">Término</label>
          <input
            type="time"
            value={fimHora}
            onChange={(e) => setFimHora(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">Motivo (opcional)</label>
          <input
            type="text"
            placeholder="Ex: Almoço, Intervalo, Consulta"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {erro && <div className="alert-error" style={{ margin: '0.75rem 0 0' }}>{erro}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" onClick={onCancelar} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={salvando} className="btn btn-primary">
          {salvando ? 'Salvando...' : 'Salvar Bloqueio'}
        </button>
      </div>
    </form>
  );
}

function NovoAgendamentoForm({
  data,
  clientes,
  servicos,
  onCriado,
  onCancelar,
}: {
  data: string;
  clientes: Cliente[];
  servicos: Servico[];
  onCriado: () => void;
  onCancelar: () => void;
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
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao agendar horário.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={estilos.boxFormulario}>
      <div style={estilos.boxHeader}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
          Agendar Atendimento Manualmente
        </h4>
        <button type="button" onClick={onCancelar} style={estilos.btnFechar}>✕</button>
      </div>

      <div style={estilos.formLinha}>
        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Selecione a cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.telefone ? `(${c.telefone})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">Procedimento</label>
          <select
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Selecione o procedimento...</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} ({s.duracaoMin}min - R$ {s.preco.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="input-group" style={{ flex: '1 1 120px', margin: 0 }}>
          <label className="input-label">Horário</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            className="input-field"
          />
        </div>
      </div>

      {erro && <div className="alert-error" style={{ margin: '0.75rem 0 0' }}>{erro}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" onClick={onCancelar} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={salvando} className="btn btn-primary">
          {salvando ? 'Salvando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </form>
  );
}

const estilos = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  dateControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.9rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  boxFormulario: {
    marginBottom: '1.5rem',
    background: '#FFFFFF',
    border: '1.5px solid var(--color-primary-border)',
  },
  boxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  btnFechar: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  formLinha: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  bloqueiosSection: {
    background: 'var(--color-primary-subtle)',
    border: '1px solid var(--color-primary-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem',
  },
  bloqueioHeader: {
    marginBottom: '0.5rem',
  },
  bloqueiosList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
  },
  bloqueioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: 'var(--color-primary-dark)',
  },
  linkRemoverBloqueio: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  agendaList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  agendamentoCard: {
    padding: '1rem 1.25rem',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  timeColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '65px',
    padding: '0.4rem 0.6rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
  },
  horaDestaque: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  infoColumn: {
    flex: '1 1 200px',
  },
  clienteNome: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
    margin: 0,
  },
  procedimentoInfo: {
    fontSize: '0.85rem',
    marginTop: '0.2rem',
  },
  obsTexto: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic' as const,
    margin: '0.3rem 0 0',
  },
  acoesColumn: {
    display: 'flex',
    gap: '0.4rem',
    alignItems: 'center',
  },
  btnConcluir: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  btnCancelarAcao: {
    padding: '0.4rem 0.8rem',
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
};
