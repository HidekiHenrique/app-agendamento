# Agenda Backend (NestJS + Prisma + Supabase)

Backend do app de agendamento pra depilação/massagem. Uso pessoal (só sua
mãe usa), então não tem autenticação de múltiplos usuários - é só a API
gerenciando clientes, serviços e agendamentos.

## 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com e um novo projeto (grátis).
2. Vá em **Project Settings > Database**.
3. Copie duas connection strings:
   - **Connection pooling** (modo "Transaction", porta `6543`) → vai no `DATABASE_URL`
   - **Connection string** direta (porta `5432`) → vai no `DIRECT_URL`

## 2. Configurar o `.env`

Edite o arquivo `.env` e cole suas strings reais no lugar dos placeholders:

```
DATABASE_URL="postgresql://postgres.xxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

A senha é a que você definiu ao criar o projeto no Supabase (ou pode
resetar em Project Settings > Database > Reset Database Password).

## 3. Instalar dependências e criar as tabelas

```bash
npm install
npx prisma migrate dev --name init
```

Esse comando lê o `prisma/schema.prisma` e cria as tabelas `Cliente`,
`Servico` e `Agendamento` direto no seu banco Supabase - você pode
inclusive ver elas aparecerem em **Table Editor** no painel do Supabase
depois de rodar.

## 4. Rodar a API

```bash
npm run build
npm start
```

Ou em modo desenvolvimento (recarrega sozinho):

```bash
npm run start:dev
```

API sobe em `http://localhost:3000`.

## Rotas

| Método | Rota                        | O que faz                                   |
|--------|------------------------------|----------------------------------------------|
| GET    | `/clientes?busca=Maria`     | Lista/busca clientes                          |
| POST   | `/clientes`                 | Cria cliente `{ nome, telefone?, observacoes? }` |
| GET    | `/servicos`                 | Lista serviços ativos                         |
| POST   | `/servicos`                 | Cria serviço `{ nome, duracaoMin, preco }`   |
| DELETE | `/servicos/:id`              | Desativa serviço (soft delete)                |
| GET    | `/agendamentos?data=2026-07-28` | Lista agenda do dia                       |
| POST   | `/agendamentos`             | Cria agendamento `{ clienteId, servicoId, dataHora, observacoes? }` |
| PATCH  | `/agendamentos/:id/status`   | Atualiza status `{ status: "concluido" }`    |

O `POST /agendamentos` já bloqueia com erro 400 se o horário conflitar com
outro agendamento existente (calculado a partir da duração do serviço).

## Estrutura

```
src/
  prisma/           -> conexão com o banco (equivalente ao seu PDO)
  clientes/         -> CRUD de clientes
  servicos/         -> CRUD de serviços (depilação, massagem, etc + duração/preço)
  agendamentos/     -> a agenda em si, com checagem de conflito de horário
prisma/
  schema.prisma     -> definição das tabelas (equivalente aos CREATE TABLE)
```

## Próximos passos

1. Rodar o `prisma migrate dev` de verdade contra seu Supabase (não deu
   pra testar aqui no sandbox porque a rede é restrita - o download do
   engine do Prisma foi bloqueado, mas na sua máquina funciona normal).
2. Cadastrar uns serviços iniciais (`POST /servicos`) pra já ter algo pra
   testar a agenda.
3. Construir o front em React consumindo essa API.
