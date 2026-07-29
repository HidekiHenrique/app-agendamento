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
      <h2 style={{ marginTop: 0 }}>Serviços</h2>

      <NovoServicoForm onCriado={carregar} />

      {carregando && <p>Carregando...</p>}

      <ul style={estilos.lista}>
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

  if (!editando) {
    return (
      <li style={estilos.item}>
        <span>
          <strong>{servico.nome}</strong> — {servico.duracaoMin}min · R${servico.preco.toFixed(2)}
        </span>
        <button onClick={() => setEditando(true)} style={estilos.botaoEditar}>
          Editar
        </button>
      </li>
    );
  }

  return (
    <li style={estilos.item}>
      <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <strong>{servico.nome}</strong>
        <input
          type="number"
          value={duracaoMin}
          onChange={(e) => setDuracaoMin(e.target.value)}
          style={{ width: '70px' }}
        />
        min · R$
        <input
          type="number"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={{ width: '80px' }}
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
      {erro && <p style={{ color: '#c0392b', fontSize: '0.8rem' }}>{erro}</p>}
    </li>
  );
}

const estilos = {
  pagina: { maxWidth: '600px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' },
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
    padding: '0.7rem',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  botao: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
  },
  botaoEditar: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
