# Agenda App

App de agendamento pra depilação/massagem - uso pessoal (login único).

## Estrutura

```
backend/   -> API NestJS + Prisma + Supabase (Postgres)
frontend/  -> React + Vite + TypeScript
```

## 1. Backend

```bash
cd backend
npm install
```

Edite o `.env`:
- `DATABASE_URL` e `DIRECT_URL` → pegue em Supabase > Connect > ORM > Prisma (você já configurou isso)
- `MASTER_USER_EMAIL` → o email que vai usar pra logar
- `MASTER_USER_PASSWORD_HASH` → gere um hash da sua senha real (veja abaixo)
- `JWT_SECRET` → qualquer string aleatória longa (ex: gere uma em https://www.uuidgenerator.net/ ou rode `openssl rand -hex 32`)

### Gerar o hash da senha

Com o backend já instalado (`npm install` feito), rode:

```bash
node -e "require('bcrypt').hash('SUA_SENHA_AQUI', 10).then(h => console.log(h))"
```

Isso imprime um hash tipo `$2b$10$...` — cola esse valor completo em
`MASTER_USER_PASSWORD_HASH` no `.env`.

**Se as tabelas ainda não existem no Supabase** (pulei essa etapa se você já rodou):
```bash
npx prisma migrate dev --name init
```

Rodar a API:
```bash
npm run build
npm start
```

Sobe em `http://localhost:3000`.

## 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173` (o Vite avisa a porta exata no terminal).
Abre no navegador, faz login com o email/senha que você configurou no `.env`
do backend, e já cai na agenda.

## Testando o fluxo

1. Antes de tudo, cadastre alguns serviços e clientes direto pela API
   (ainda não tem tela pra isso no front - só a agenda em si por enquanto):

```bash
curl -X POST http://localhost:3000/servicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"nome": "Massagem relaxante", "duracaoMin": 60, "preco": 120}'
```

(Pra pegar o `SEU_TOKEN`, faz login pela tela e olha no DevTools do
navegador → Application → Local Storage → `token`.)

2. Depois disso, cadastrar cliente e agendamento já dá pra fazer direto
   pela tela da agenda.

## Próximos passos sugeridos

- Tela de cadastro de clientes e serviços direto no front (hoje só dá
  pra criar via `curl`/Postman)
- Visualização semanal, não só por dia
- Deploy: backend em algum serviço tipo Railway/Render, frontend na Vercel
