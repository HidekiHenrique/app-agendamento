import { useEffect, useState } from 'react';
import { agendamentosApi, servicosApi } from '../api/resources';
import type { Servico } from '../api/types';
import logoSvg from '../assets/logo.svg';

function hojeISO() {
  return new Date().toLocaleDateString('en-CA');
}

export function ClienteAgendamentoPage({ onAgendamentoSucesso }: { onAgendamentoSucesso: () => void }) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [data, setData] = useState(hojeISO());
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horaSelecionada, setHoraSelecionada] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    servicosApi
      .listar()
      .then((res) => {
        setServicos(res);
        if (res.length > 0) {
          setServicoSelecionado(res[0]);
        }
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao carregar serviços.'))
      .finally(() => setCarregandoServicos(false));
  }, []);

  useEffect(() => {
    if (!servicoSelecionado || !data) {
      setHorariosDisponiveis([]);
      setHoraSelecionada('');
      return;
    }

    setCarregandoHorarios(true);
    setHoraSelecionada('');
    agendamentosApi
      .obterHorariosDisponiveis(servicoSelecionado.id, data)
      .then((res) => {
        setHorariosDisponiveis(res.horariosDisponiveis);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao buscar horários.');
      })
      .finally(() => setCarregandoHorarios(false));
  }, [servicoSelecionado, data]);

  async function handleConfirmar() {
    if (!servicoSelecionado || !data || !horaSelecionada) {
      setErro('Por favor, selecione um serviço, uma data e um horário.');
      return;
    }

    setErro('');
    setSalvando(true);
    try {
      await agendamentosApi.criarCliente({
        servicoId: servicoSelecionado.id,
        dataHora: `${data}T${horaSelecionada}:00`,
        observacoes: observacoes.trim() || undefined,
      });
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao confirmar agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  if (sucesso) {
    return (
      <div style={estilos.sucessoWrapper}>
        <div className="card" style={estilos.sucessoCard}>
          <div style={estilos.sucessoIconeWrapper}>
            <img src={logoSvg} alt="Espaço Selma Sanches" style={{ width: '40px', height: '40px' }} />
          </div>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Agendamento Confirmado!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Seu atendimento foi reservado com carinho no <strong>Espaço Selma Sanches</strong>.
          </p>

          <div style={estilos.detalhesBox}>
            <div style={estilos.detalheLinha}>
              <span style={{ color: 'var(--color-text-muted)' }}>Procedimento:</span>
              <strong>{servicoSelecionado?.nome}</strong>
            </div>
            <div style={estilos.detalheLinha}>
              <span style={{ color: 'var(--color-text-muted)' }}>Data:</span>
              <strong>{new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</strong>
            </div>
            <div style={estilos.detalheLinha}>
              <span style={{ color: 'var(--color-text-muted)' }}>Horário:</span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>{horaSelecionada}</strong>
            </div>
            <div style={estilos.detalheLinha}>
              <span style={{ color: 'var(--color-text-muted)' }}>Duração / Valor:</span>
              <span>{servicoSelecionado?.duracaoMin} min · R$ {servicoSelecionado?.preco.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={onAgendamentoSucesso} className="btn btn-primary" style={{ width: '100%' }}>
            Ver Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={estilos.pageHeader}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0 }}>Novo Agendamento</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
          Escolha o procedimento e o melhor horário para seu atendimento
        </p>
      </div>

      {erro && <div className="alert-error">{erro}</div>}

      {/* 1. Escolha do Serviço */}
      <section style={estilos.section}>
        <div style={estilos.stepHeader}>
          <span style={estilos.stepNumber}>1</span>
          <span style={estilos.stepTitle}>Selecione o Procedimento</span>
        </div>

        {carregandoServicos ? (
          <div style={estilos.loadingBox}>
            <span className="spinner" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carregando procedimentos...</span>
          </div>
        ) : (
          <div style={estilos.servicesGrid}>
            {servicos.map((s) => {
              const selecionado = servicoSelecionado?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setServicoSelecionado(s)}
                  style={estilos.serviceCard(selecionado)}
                >
                  <div style={estilos.serviceCardHeader}>
                    <span style={estilos.serviceName(selecionado)}>{s.nome}</span>
                    {selecionado && <span style={estilos.checkBadge}>✓</span>}
                  </div>
                  <div style={estilos.serviceDetails}>
                    <span style={estilos.serviceDuration}>{s.duracaoMin} min</span>
                    <span style={estilos.servicePrice(selecionado)}>R$ {s.preco.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Escolha da Data */}
      <section style={estilos.section}>
        <div style={estilos.stepHeader}>
          <span style={estilos.stepNumber}>2</span>
          <span style={estilos.stepTitle}>Escolha a Data</span>
        </div>
        <div style={{ maxWidth: '240px' }}>
          <input
            type="date"
            min={hojeISO()}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input-field"
            style={{ fontWeight: 500 }}
          />
        </div>
      </section>

      {/* 3. Grade de Horários */}
      <section style={estilos.section}>
        <div style={estilos.stepHeader}>
          <span style={estilos.stepNumber}>3</span>
          <span style={estilos.stepTitle}>Horários Disponíveis</span>
        </div>

        {carregandoHorarios && (
          <div style={estilos.loadingBox}>
            <span className="spinner" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Verificando horários livres...</span>
          </div>
        )}

        {!carregandoHorarios && horariosDisponiveis.length === 0 && (
          <div style={estilos.emptyBox}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Nenhum horário livre encontrado para este dia. Por favor, escolha outra data.
            </p>
          </div>
        )}

        {!carregandoHorarios && horariosDisponiveis.length > 0 && (
          <div style={estilos.timeChipsGrid}>
            {horariosDisponiveis.map((h) => {
              const selecionado = horaSelecionada === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoraSelecionada(h)}
                  style={estilos.timeChip(selecionado)}
                >
                  {h}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Observações */}
      <section style={estilos.section}>
        <div style={estilos.stepHeader}>
          <span style={estilos.stepNumber}>4</span>
          <span style={estilos.stepTitle}>Observações (opcional)</span>
        </div>
        <textarea
          rows={2}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma preferência, aviso ou detalhe para a profissional?"
          className="input-field"
          style={{ resize: 'vertical' }}
        />
      </section>

      {/* Confirmação */}
      <div style={estilos.confirmContainer}>
        {servicoSelecionado && horaSelecionada && (
          <div style={estilos.summaryBar}>
            <span>Resumo: <strong>{servicoSelecionado.nome}</strong> às <strong>{horaSelecionada}</strong></span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>R$ {servicoSelecionado.preco.toFixed(2)}</span>
          </div>
        )}
        <button
          onClick={handleConfirmar}
          disabled={salvando || !horaSelecionada || !servicoSelecionado}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
        >
          {salvando ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} />
              <span>Confirmando seu agendamento...</span>
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </button>
      </div>
    </div>
  );
}

const estilos = {
  pageHeader: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '0.75rem',
  },
  section: {
    marginBottom: '1.75rem',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.75rem',
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-subtle)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '1px solid var(--color-primary-border)',
  },
  stepTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  serviceCard: (selecionado: boolean) => ({
    background: selecionado ? 'var(--color-primary-subtle)' : '#FFFFFF',
    border: selecionado ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.9rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    boxShadow: selecionado ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
  }),
  serviceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.4rem',
    marginBottom: '0.5rem',
  },
  serviceName: (selecionado: boolean) => ({
    fontSize: '0.9rem',
    fontWeight: 600,
    color: selecionado ? 'var(--color-primary)' : 'var(--color-text-main)',
    lineHeight: 1.3,
  }),
  checkBadge: {
    fontSize: '0.75rem',
    background: 'var(--color-primary)',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  serviceDuration: {
    color: 'var(--color-text-muted)',
    fontSize: '0.75rem',
  },
  servicePrice: (selecionado: boolean) => ({
    fontWeight: 600,
    color: selecionado ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  }),
  timeChipsGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  timeChip: (selecionado: boolean) => ({
    border: selecionado ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
    background: selecionado ? 'var(--color-primary)' : 'var(--color-surface)',
    color: selecionado ? '#FFFFFF' : 'var(--color-text-main)',
    fontWeight: selecionado ? 600 : 500,
    fontSize: '0.85rem',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font-family)',
    boxShadow: selecionado ? 'var(--shadow-primary)' : 'none',
  }),
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1rem',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
  },
  emptyBox: {
    padding: '1.25rem',
    textAlign: 'center' as const,
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--color-border)',
  },
  confirmContainer: {
    marginTop: '2rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid var(--color-border)',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    marginBottom: '0.75rem',
    padding: '0.6rem 0.85rem',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
  },
  sucessoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1.5rem 0',
  },
  sucessoCard: {
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center' as const,
    padding: '2.2rem 1.75rem',
  },
  sucessoIconeWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'var(--color-primary-subtle)',
    border: '1px solid var(--color-primary-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  detalhesBox: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  detalheLinha: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
};
