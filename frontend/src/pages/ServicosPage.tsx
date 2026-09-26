import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { servicosApi } from '../api/resources';
import type { Servico } from '../api/types';

export function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);

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
    <div style={estilos.pagina}>
      <h2 style={{ marginTop: 0, color: '#333' }}>Gerenciamento de Serviços</h2>

      <NovoServicoForm onCriado={carregar} />

      {carregando && <p style={{ color: '#777' }}>Carregando serviços...</p>}

      <ul style={estilos.lista}>
        {servicos.length === 0 && !carregando && (
          <p style={{ color: '#888' }}>Nenhum serviço ativo cadastrado.</p>
        )}
        {servicos.map((s) => (
          <ServicoItem key={s.id} servico={s} onAtualizado={carregar} />
        ))}
      </ul>
    </div>
  );
}

function NovoServicoForm({ onCriado }: { onCriado: () => void }) {
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
        nome,
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
    <form onSubmit={handleSubmit} style={estilos.formNovo}>
      <input
        placeholder="Nome do serviço"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        style={{ flex: 2, minWidth: '160px' }}
      />
      <input
        type="number"
        placeholder="Duração (min)"
        value={duracaoMin}
        onChange={(e) => setDuracaoMin(e.target.value)}
        required
        min={5}
        style={{ width: '110px' }}
      />
      <input
        type="number"
        placeholder="Preço (R$)"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        required
        min={0}
        step="0.01"
        style={{ width: '110px' }}
      />
      <button type="submit" disabled={salvando} style={estilos.botao}>
        {salvando ? 'Salvando...' : '+ Novo serviço'}
      </button>
      {erro && <p style={{ color: '#c0392b', fontSize: '0.85rem', width: '100%' }}>{erro}</p>}
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
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function desativar() {
    if (!confirm(`Deseja realmente desativar o serviço "${servico.nome}"?`)) {
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
      <li style={estilos.item}>
        <span>
          <strong>{servico.nome}</strong> — {servico.duracaoMin}min · R$ {servico.preco.toFixed(2)}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => setEditando(true)} style={estilos.botaoEditar}>
            Editar
          </button>
          <button onClick={desativar} style={estilos.botaoDesativar}>
            Desativar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li style={estilos.item}>
      <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>{servico.nome}</strong>
        <input
          type="number"
          value={duracaoMin}
          onChange={(e) => setDuracaoMin(e.target.value)}
          style={{ width: '70px', padding: '0.3rem' }}
        />
        min · R$
        <input
          type="number"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={{ width: '80px', padding: '0.3rem' }}
        />
      </span>
      <span style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={salvar} disabled={salvando} style={estilos.botao}>
          {salvando ? '...' : 'Salvar'}
        </button>
        <button onClick={() => setEditando(false)} style={estilos.botaoEditar}>
          Cancelar
        </button>
      </span>
      {erro && <p style={{ color: '#c0392b', fontSize: '0.8rem', width: '100%' }}>{erro}</p>}
    </li>
  );
}

const estilos = {
  pagina: { maxWidth: '650px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' },
  formNovo: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    background: '#f5f3f0',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  lista: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid #eee',
    background: '#fff',
  },
  botao: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  botaoEditar: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  botaoDesativar: {
    background: '#fff',
    color: '#c0392b',
    border: '1px solid #e74c3c',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
