import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { servicosApi } from '../api/resources';
import type { Servico } from '../api/types';

export function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [exibirForm, setExibirForm] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      setServicos(await servicosApi.listar());
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <div style={estilos.topHeader}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0 }}>Procedimentos & Serviços</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Gerencie o catálogo de serviços, duração e valores
          </p>
        </div>

        <button
          onClick={() => setExibirForm((v) => !v)}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          {exibirForm ? 'Fechar' : '+ Novo Procedimento'}
        </button>
      </div>

      {exibirForm && (
        <NovoServicoForm
          onCriado={() => {
            setExibirForm(false);
            carregar();
          }}
          onCancelar={() => setExibirForm(false)}
        />
      )}

      {carregando && (
        <div style={estilos.loadingBox}>
          <span className="spinner" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carregando procedimentos...</span>
        </div>
      )}

      <div style={estilos.list}>
        {!carregando && servicos.length === 0 && (
          <div style={estilos.emptyBox}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Nenhum serviço cadastrado ainda.
            </p>
          </div>
        )}

        {servicos.map((s) => (
          <ServicoItem key={s.id} servico={s} onAtualizado={carregar} />
        ))}
      </div>
    </div>
  );
}

function NovoServicoForm({
  onCriado,
  onCancelar,
}: {
  onCriado: () => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [duracaoMin, setDuracaoMin] = useState('30');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await servicosApi.criar({
        nome: nome.trim(),
        duracaoMin: Number(duracaoMin),
        preco: Number(preco),
      });
      setNome('');
      setPreco('');
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar serviço.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={estilos.boxFormulario}>
      <div style={estilos.boxHeader}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
          Cadastrar Novo Procedimento
        </h4>
        <button type="button" onClick={onCancelar} style={estilos.btnFechar}>✕</button>
      </div>

      <div style={estilos.formLinha}>
        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">Nome do Serviço / Procedimento</label>
          <input
            placeholder="Ex: Depilação Completa, Massagem Relaxante"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="input-group" style={{ flex: '1 1 110px', margin: 0 }}>
          <label className="input-label">Duração (min)</label>
          <input
            type="number"
            value={duracaoMin}
            onChange={(e) => setDuracaoMin(e.target.value)}
            required
            min={5}
            className="input-field"
          />
        </div>

        <div className="input-group" style={{ flex: '1 1 110px', margin: 0 }}>
          <label className="input-label">Valor (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            min={0}
            step="0.01"
            className="input-field"
          />
        </div>
      </div>

      {erro && <div className="alert-error" style={{ margin: '0.75rem 0 0' }}>{erro}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" onClick={onCancelar} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={salvando} className="btn btn-primary">
          {salvando ? 'Salvando...' : 'Salvar Procedimento'}
        </button>
      </div>
    </form>
  );
}

function ServicoItem({
  servico,
  onAtualizado,
}: {
  servico: Servico;
  onAtualizado: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [duracaoMin, setDuracaoMin] = useState(String(servico.duracaoMin));
  const [preco, setPreco] = useState(String(servico.preco));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar() {
    setErro('');
    setSalvando(true);
    try {
      await servicosApi.atualizar(servico.id, {
        duracaoMin: Number(duracaoMin),
        preco: Number(preco),
      });
      setEditando(false);
      onAtualizado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  }

  async function desativar() {
    if (!confirm(`Deseja desativar o serviço "${servico.nome}"? Ele não aparecerá mais para agendamentos de clientes.`)) {
      return;
    }
    try {
      await servicosApi.desativar(servico.id);
      onAtualizado();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao desativar serviço.');
    }
  }

  if (!editando) {
    return (
      <div className="card" style={estilos.itemCard}>
        <div>
          <h4 style={estilos.servicoTitulo}>{servico.nome}</h4>
          <span style={estilos.servicoMeta}>
            {servico.duracaoMin} min · <strong style={{ color: 'var(--color-primary)' }}>R$ {servico.preco.toFixed(2)}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setEditando(true)} className="btn btn-secondary" style={estilos.btnAcao}>
            Editar
          </button>
          <button onClick={desativar} className="btn btn-danger-outline" style={estilos.btnAcao}>
            Desativar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ ...estilos.itemCard, border: '1.5px solid var(--color-primary-border)' }}>
      <div style={{ flex: 1 }}>
        <h4 style={estilos.servicoTitulo}>{servico.nome}</h4>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Duração:
            <input
              type="number"
              value={duracaoMin}
              onChange={(e) => setDuracaoMin(e.target.value)}
              className="input-field"
              style={{ width: '70px', padding: '0.35rem 0.5rem', display: 'inline-block', marginLeft: '0.3rem' }}
            /> min
          </label>

          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Valor: R$
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="input-field"
              style={{ width: '85px', padding: '0.35rem 0.5rem', display: 'inline-block', marginLeft: '0.3rem' }}
            />
          </label>
        </div>
        {erro && <p style={{ color: '#c0392b', fontSize: '0.8rem', margin: '0.4rem 0 0' }}>{erro}</p>}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', alignSelf: 'flex-start' }}>
        <button onClick={salvar} disabled={salvando} className="btn btn-primary" style={estilos.btnAcao}>
          {salvando ? '...' : 'Salvar'}
        </button>
        <button onClick={() => setEditando(false)} className="btn btn-secondary" style={estilos.btnAcao}>
          Cancelar
        </button>
      </div>
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
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  servicoTitulo: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
    margin: 0,
  },
  servicoMeta: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.2rem',
    display: 'inline-block',
  },
  btnAcao: {
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
};
