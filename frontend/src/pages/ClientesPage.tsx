import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { clientesApi } from '../api/resources';
import type { Cliente } from '../api/types';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
  }, [busca]);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await clientesApi.listar(busca.trim() || undefined);
      setClientes(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao listar clientes.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={estilos.pagina}>
      <h2 style={{ marginTop: 0, color: '#333' }}>Gerenciamento de Clientes</h2>

      <NovoClienteForm onCriado={carregar} />

      <div style={estilos.buscaContainer}>
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={estilos.inputBusca}
        />
      </div>

      {erro && <p style={estilos.erroMsg}>{erro}</p>}
      {carregando && <p style={{ color: '#777' }}>Carregando clientes...</p>}

      <ul style={estilos.lista}>
        {clientes.length === 0 && !carregando && (
          <p style={{ color: '#888' }}>Nenhum cliente encontrado.</p>
        )}
        {clientes.map((c) => (
          <ClienteItem key={c.id} cliente={c} onAtualizado={carregar} />
        ))}
      </ul>
    </div>
  );
}

function NovoClienteForm({ onCriado }: { onCriado: () => void }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await clientesApi.criar({
        nome: nome.trim(),
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      setNome('');
      setTelefone('');
      setEmail('');
      setObservacoes('');
      setAberto(false);
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <div style={{ marginBottom: '1.2rem' }}>
        <button onClick={() => setAberto(true)} style={estilos.botaoNovoCliente}>
          + Novo Cliente Manual
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={estilos.formNovo}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.95rem', color: '#444' }}>Cadastrar Cliente</strong>
        <button type="button" onClick={() => setAberto(false)} style={estilos.botaoFechar}>
          Fechar ✕
        </button>
      </div>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
      />
      <input
        placeholder="Telefone / WhatsApp"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ flex: '1 1 140px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
      />
      <input
        type="email"
        placeholder="E-mail (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
      />
      <input
        placeholder="Observações (opcional)"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
      />

      <button type="submit" disabled={salvando} style={estilos.botaoSalvar}>
        {salvando ? 'Salvando...' : 'Salvar Cliente'}
      </button>

      {erro && <p style={{ color: '#c0392b', fontSize: '0.85rem', width: '100%', margin: 0 }}>{erro}</p>}
    </form>
  );
}

function ClienteItem({ cliente, onAtualizado }: { cliente: Cliente; onAtualizado: () => void }) {
  const [definindoCredenciais, setDefinindoCredenciais] = useState(false);
  const [email, setEmail] = useState(cliente.email || '');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSalvarCredenciais(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      await clientesApi.definirCredenciais(cliente.id, {
        email: email.trim(),
        senha,
      });
      alert('Login de acesso online ativado com sucesso para este cliente!');
      setDefinindoCredenciais(false);
      setSenha('');
      onAtualizado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao definir login.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <li style={estilos.item}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <strong>{cliente.nome}</strong>
          {cliente.possuiLogin ? (
            <span style={estilos.badgeLoginAtivo}>✓ Acesso Online Ativo</span>
          ) : (
            <span style={estilos.badgeSemLogin}>Sem Login Online</span>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
          {cliente.telefone && <span>Tel: {cliente.telefone} · </span>}
          {cliente.email ? <span>Email: {cliente.email}</span> : <em>Sem e-mail cadastrado</em>}
        </div>
        {cliente.observacoes && (
          <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginTop: '0.2rem' }}>
            Obs: {cliente.observacoes}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => {
            setEmail(cliente.email || '');
            setDefinindoCredenciais((v) => !v);
          }}
          style={estilos.botaoCredenciais}
        >
          {cliente.possuiLogin ? 'Alterar Acesso / Senha' : '🔑 Ativar Login do Cliente'}
        </button>
      </div>

      {definindoCredenciais && (
        <form onSubmit={handleSalvarCredenciais} style={estilos.formCredenciais}>
          <div style={{ width: '100%', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
            Definir e-mail e senha para {cliente.nome} poder agendar online:
          </div>
          <input
            type="email"
            placeholder="E-mail do cliente"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={estilos.inputCred}
          />
          <input
            type="password"
            placeholder="Senha inicial (mínimo 6 chars)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={estilos.inputCred}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button type="submit" disabled={salvando} style={estilos.botaoSalvarCred}>
              {salvando ? 'Salvando...' : 'Salvar e Ativar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDefinindoCredenciais(false);
                setErro('');
              }}
              style={estilos.botaoCancelarCred}
            >
              Cancelar
            </button>
          </div>
          {erro && <p style={{ color: '#c0392b', fontSize: '0.8rem', width: '100%', margin: 0 }}>{erro}</p>}
        </form>
      )}
    </li>
  );
}

const estilos = {
  pagina: { maxWidth: '700px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' },
  buscaContainer: { marginBottom: '1rem' },
  inputBusca: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    boxSizing: 'border-box' as const,
  },
  botaoNovoCliente: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  formNovo: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap' as const,
    background: '#f5f3f0',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.2rem',
  },
  botaoFechar: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  botaoSalvar: {
    background: '#8a6d5c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  lista: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  item: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    border: '1px solid #eee',
    background: '#fff',
  },
  badgeLoginAtivo: {
    fontSize: '0.75rem',
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    fontWeight: 'bold' as const,
  },
  badgeSemLogin: {
    fontSize: '0.75rem',
    background: '#f0f0f0',
    color: '#777',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
  },
  botaoCredenciais: {
    background: '#fff',
    border: '1px solid #8a6d5c',
    color: '#8a6d5c',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 'bold' as const,
  },
  formCredenciais: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    background: '#fdfbf7',
    border: '1px solid #eedecf',
    padding: '0.8rem',
    borderRadius: '6px',
    marginTop: '0.4rem',
  },
  inputCred: {
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.85rem',
    flex: '1 1 180px',
  },
  botaoSalvarCred: {
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  botaoCancelarCred: {
    background: '#eee',
    border: 'none',
    borderRadius: '4px',
    padding: '0.4rem 0.6rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  erroMsg: {
    background: '#fdf0f0',
    color: '#c0392b',
    padding: '0.7rem',
    borderRadius: '6px',
    border: '1px solid #fadbd8',
  },
};
