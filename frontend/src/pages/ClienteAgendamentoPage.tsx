import { useEffect, useState } from 'react';
import { agendamentosApi, servicosApi } from '../api/resources';
import type { Servico } from '../api/types';

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
      <div style={estilos.sucessoContainer}>
        <div style={estilos.sucessoCard}>
          <div style={estilos.iconeSucesso}>✓</div>
          <h2>Agendamento Confirmado!</h2>
          <p>
            Seu horário para <strong>{servicoSelecionado?.nome}</strong> no dia{' '}
            <strong>{new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')}</strong> às{' '}
            <strong>{horaSelecionada}</strong> foi reservado com sucesso.
          </p>
          <button
            onClick={onAgendamentoSucesso}
            style={estilos.botaoConfirmar}
          >
            Ver Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.pagina}>
      <h2 style={{ marginTop: 0, color: '#333' }}>Novo Agendamento</h2>

      {erro && <p style={estilos.erroMsg}>{erro}</p>}

      {/* 1. Escolha do Serviço */}
      <section style={estilos.secao}>
        <label style={estilos.secaoTitulo}>1. Escolha o Serviço</label>
        {carregandoServicos && <p>Carregando serviços disponíveis...</p>}
        <div style={estilos.gridServicos}>
          {servicos.map((s) => {
            const selecionado = servicoSelecionado?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setServicoSelecionado(s)}
                style={estilos.cardServico(selecionado)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{s.nome}</div>
                <div style={{ fontSize: '0.85rem', color: selecionado ? '#f3edea' : '#666', marginTop: '0.3rem' }}>
                  {s.duracaoMin} min · R$ {s.preco.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Escolha da Data */}
      <section style={estilos.secao}>
        <label style={estilos.secaoTitulo}>2. Escolha a Data</label>
        <input
          type="date"
          min={hojeISO()}
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={estilos.inputData}
        />
      </section>

      {/* 3. Escolha do Horário */}
      <section style={estilos.secao}>
        <label style={estilos.secaoTitulo}>3. Horários Disponíveis</label>
        {carregandoHorarios && <p style={{ color: '#777' }}>Buscando horários disponíveis...</p>}
        {!carregandoHorarios && horariosDisponiveis.length === 0 && (
          <p style={{ color: '#888' }}>
            Nenhum horário livre disponível para essa data ou serviço. Tente escolher outro dia.
          </p>
        )}
        <div style={estilos.gridHorarios}>
          {horariosDisponiveis.map((h) => {
            const selecionado = horaSelecionada === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setHoraSelecionada(h)}
                style={estilos.botaoHora(selecionado)}
              >
                {h}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Observações */}
      <section style={estilos.secao}>
        <label style={estilos.secaoTitulo}>4. Observações (opcional)</label>
        <textarea
          rows={2}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma recomendação, preferência ou detalhe?"
          style={estilos.textarea}
        />
      </section>

      <button
        onClick={handleConfirmar}
        disabled={salvando || !horaSelecionada || !servicoSelecionado}
        style={estilos.botaoConfirmar}
      >
        {salvando ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>
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
  secao: {
    marginBottom: '1.4rem',
  },
  secaoTitulo: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 'bold' as const,
    color: '#444',
    marginBottom: '0.5rem',
  },
  gridServicos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.6rem',
  },
  cardServico: (selecionado: boolean) => ({
    border: selecionado ? '2px solid #8a6d5c' : '1px solid #ddd',
    background: selecionado ? '#8a6d5c' : '#fff',
    color: selecionado ? '#fff' : '#333',
    padding: '0.8rem',
    borderRadius: '8px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  inputData: {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '220px',
  },
  gridHorarios: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  botaoHora: (selecionado: boolean) => ({
    border: selecionado ? '2px solid #8a6d5c' : '1px solid #ccc',
    background: selecionado ? '#8a6d5c' : '#fff',
    color: selecionado ? '#fff' : '#333',
    fontWeight: selecionado ? ('bold' as const) : ('normal' as const),
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    minWidth: '65px',
  }),
  textarea: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  botaoConfirmar: {
    width: '100%',
    padding: '0.85rem',
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.05rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  erroMsg: {
    background: '#fdf0f0',
    color: '#c0392b',
    padding: '0.7rem',
    borderRadius: '6px',
    border: '1px solid #fadbd8',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  sucessoContainer: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '1rem',
    fontFamily: 'system-ui, sans-serif',
  },
  sucessoCard: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    textAlign: 'center' as const,
  },
  iconeSucesso: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#e8f5e9',
    color: '#2e7d32',
    fontSize: '1.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    fontWeight: 'bold' as const,
  },
};
