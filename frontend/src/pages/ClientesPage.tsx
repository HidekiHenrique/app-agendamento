import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { clientesApi } from '../api/resources';
import type { Cliente } from '../api/types';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [exibirFormNovo, setExibirFormNovo] = useState(false);

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
    <div>
      <div style={estilos.topHeader}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0 }}>Gestão de Clientes</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Base de clientes cadastradas e acesso online
          </p>
        </div>

        <button
          onClick={() => setExibirFormNovo((v) => !v)}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          {exibirFormNovo ? 'Fechar' : '+ Cadastrar Cliente'}
        </button>
      </div>

      {exibirFormNovo && (
        <NovoClienteForm
          onCriado={() => {
            setExibirFormNovo(false);
            carregar();
          }}
          onCancelar={() => setExibirFormNovo(false)}
        />
      )}

      <div style={estilos.buscaWrapper}>
        <input
          type="text"
          placeholder="🔍 Buscar cliente por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-field"
          style={{ background: '#FFFFFF' }}
        />
      </div>

      {erro && <div className="alert-error">{erro}</div>}

      {carregando && (
        <div style={estilos.loadingBox}>
          <span className="spinner" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carregando clientes...</span>
        </div>
      )}

      <div style={estilos.list}>
        {!carregando && clientes.length === 0 && (
          <div style={estilos.emptyBox}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Nenhuma cliente encontrada.
            </p>
          </div>
        )}

        {clientes.map((c) => (
          <ClienteItem key={c.id} cliente={c} onAtualizado={carregar} />
        ))}
      </div>
    </div>
  );
}

function NovoClienteForm({
  onCriado,
  onCancelar,
}: {
  onCriado: () => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

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
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={estilos.boxFormulario}>
      <div style={estilos.boxHeader}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
          Cadastrar Cliente Manualmente
        </h4>
        <button type="button" onClick={onCancelar} style={estilos.btnFechar}>✕</button>
      </div>

      <div style={estilos.formLinha}>
        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">Nome Completo</label>
          <input
            placeholder="Nome da cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="input-group" style={{ flex: '1 1 140px', margin: 0 }}>
          <label className="input-label">Telefone / WhatsApp</label>
          <input
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group" style={{ flex: '2 1 200px', margin: 0 }}>
          <label className="input-label">E-mail (opcional)</label>
          <input
            type="email"
            placeholder="cliente@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="input-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
        <label className="input-label">Observações Internas (opcional)</label>
        <input
          placeholder="Ex: Prefere atendimento à tarde, pele sensível, etc."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="input-field"
        />
      </div>

      {erro && <div className="alert-error" style={{ margin: '0.75rem 0 0' }}>{erro}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" onClick={onCancelar} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={salvando} className="btn btn-primary">
          {salvando ? 'Salvando...' : 'Salvar Cadastro'}
        </button>
      </div>
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
      alert('Acesso online vinculado com sucesso para esta cliente!');
      setDefinindoCredenciais(false);
      setSenha('');
      onAtualizado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao vincular credenciais.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card" style={estilos.clienteCard}>
      <div style={estilos.clienteCardTop}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h4 style={estilos.clienteNome}>{cliente.nome}</h4>
            {cliente.possuiLogin ? (
              <span className="badge badge-agendado" style={{ fontSize: '0.7rem' }}>
                ✓ Login Ativo
              </span>
            ) : (
              <span className="badge badge-cancelado" style={{ fontSize: '0.7rem' }}>
                Sem Login Online
              </span>
            )}
          </div>

          <div style={estilos.clienteMeta}>
            {cliente.telefone && <span>WhatsApp: {cliente.telefone} · </span>}
            {cliente.email ? <span>{cliente.email}</span> : <em style={{ color: 'var(--color-text-light)' }}>Sem e-mail</em>}
          </div>

          {cliente.observacoes && (
            <p style={estilos.clienteObs}>Obs: {cliente.observacoes}</p>
          )}
        </div>

        <div>
          <button
            onClick={() => {
              setEmail(cliente.email || '');
              setDefinindoCredenciais((v) => !v);
            }}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            {cliente.possuiLogin ? 'Alterar Acesso' : '🔑 Ativar Login da Cliente'}
          </button>
        </div>
      </div>

      {definindoCredenciais && (
        <form onSubmit={handleSalvarCredenciais} style={estilos.credenciaisBox}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Definir e-mail e senha de acesso para {cliente.nome}:
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' as const, marginTop: '0.5rem' }}>
            <input
              type="email"
              placeholder="E-mail da cliente"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              style={{ flex: '1 1 180px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            />
            <input
              type="password"
              placeholder="Senha inicial (mín. 6 chars)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="input-field"
              style={{ flex: '1 1 180px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="submit" disabled={salvando} className="btn btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                {salvando ? 'Salvando...' : 'Salvar e Ativar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDefinindoCredenciais(false);
                  setErro('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
          {erro && <p style={{ color: '#c0392b', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>{erro}</p>}
        </form>
      )}
    </div>
  );
}

const estilos = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '0.75rem',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  buscaWrapper: {
    marginBottom: '1.25rem',
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
  clienteCard: {
    padding: '1rem 1.25rem',
  },
  clienteCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  clienteNome: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
    margin: 0,
  },
  clienteMeta: {
    fontSize: '0.82rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.25rem',
  },
  clienteObs: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic' as const,
    margin: '0.35rem 0 0',
  },
  credenciaisBox: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.85rem',
    marginTop: '0.85rem',
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
