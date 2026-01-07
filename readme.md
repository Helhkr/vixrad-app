# Vixrad

## Visão Geral

O **Vixrad** é um webapp profissional de produtividade médica voltado à criação, edição e geração de **laudos médicos estruturados**, com foco principal em Radiologia.

O sistema **não é um prontuário**, **não armazena laudos**, **não processa dados pessoais de pacientes** e **não substitui decisão médica**. Ele atua exclusivamente como ferramenta de apoio à redação técnica.

Este README é um **documento normativo**. Todas as decisões técnicas, arquiteturais e funcionais descritas aqui **devem ser seguidas** por desenvolvedores humanos e por assistentes de IA (ex.: GitHub Copilot).

---

## Princípios Fundamentais (Regras Absolutas)

Estas regras **não podem ser violadas**:

1. **Nenhum laudo médico é persistido** (nem em banco, nem em logs).
2. **Nenhum dado pessoal de paciente** transita pelo sistema.
3. O backend é **stateless** em relação a conteúdo clínico.
4. **Não utilizar localStorage, sessionStorage ou IndexedDB** para texto médico ou dados clínicos.
  - É permitido usar storage do browser apenas para **preferências não-clínicas** (ex.: última seleção de incidência), desde que não contenha texto médico.
5. A IA **somente é chamada** quando o usuário explicitamente solicita geração de laudo.
6. Templates médicos representam **exames normais** e podem ser copiados sem IA.
7. Auditoria registra apenas **eventos técnicos**, nunca conteúdo médico.

Qualquer código que viole esses princípios está incorreto.

---

## Arquitetura Geral

### Stack Tecnológica

- **Frontend:** Next.js (App Router, TypeScript)
- **Backend:** NestJS (TypeScript)
- **Banco de Dados:** PostgreSQL
- **IA:** Google Gemini API
- **Autenticação:** JWT

### Filosofia Arquitetural

- Separação clara entre UI, regras de negócio e IA
- Backend como orquestrador, nunca como repositório clínico
- Templates versionados e revisáveis

---

## Estrutura do Repositório

```txt
vixrad-app/
├── docs/
│   └── clinical/
│       ├── spec.md
│       └── ct/
│           └── *.md
├── frontend/
│   ├── app/
│   └── features/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── billing/
│       │   ├── templates/
│       │   ├── reports/
│       │   ├── ai/
│       │   ├── audit/
│       │   └── security/
│       ├── common/
│       └── main.ts
├── docker-compose.yml
├── docker-compose.dev.yml
└── readme.md
```

Essa estrutura **não é sugestão**, é o padrão esperado para o projeto.

---

## Como rodar com Docker Compose

Pré-requisitos:
- Docker + Docker Compose v2

### Subir tudo (1 comando)

Sobe Postgres + backend + frontend com build local:

```bash
docker compose up -d --build
```

URLs locais:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Postgres: localhost:5432

Comandos úteis:

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Derrubar (mantém volume do Postgres)
docker compose down

# Derrubar e apagar volume do Postgres (zera o banco)
docker compose down -v
```

Notas:
- O backend aplica migrations automaticamente no startup via `npx prisma migrate deploy`.
- O frontend é buildado com `NEXT_PUBLIC_API_BASE_URL` apontando para `http://localhost:3001` (configurado no compose).

### Rodar modo DEV (hot reload)

O repositório também inclui um compose para desenvolvimento (Nest `npm run dev` + Next `dev` com volumes):

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Se você quiser usar IA sem precisar rodar `export` toda vez, crie um arquivo `.env` na raiz do projeto (ele já é ignorado pelo git):

```bash
cp .env.example .env
# edite .env e preencha GEMINI_API_KEY
```

Portas típicas no modo dev:
- Frontend: http://localhost:3003
- Backend: http://localhost:3002

Para parar:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## Fluxo Funcional do Usuário

### Autenticação

- Login
- Registro com **trial gratuito de 7 dias**
- Acesso é controlado por **papéis (roles)**:
  - `TRIAL`: janela de 7 dias
  - `BLUE`: assinatura paga com janela configurada
  - `ADMIN`: acesso sempre ativo

### Fluxo Principal

1. Selecionar **Tipo de Exame**
2. Selecionar **Template Base**
3. Informar **Indicação clínica** (opcional)
4. Descrever **Achados do Exame**

A partir desse ponto, o usuário pode escolher:

- **COPIAR LAUDO NORMAL**  
  Copia instantaneamente o template normal estruturado. Não usa IA.

- **GERAR LAUDO (IA)**  
  Envia dados técnicos ao backend para geração assistida por IA.

Após qualquer ação:
- O usuário pode clicar em **NOVO LAUDO**, que reseta completamente o estado.

---

## Frontend — Regras de Implementação

### Editor de Laudos

O Editor é o componente central do sistema e **deve conter**:

- Seletores de exame e template
- Campo de indicação (opcional)
- Campo de achados
- Botão: **Copiar Laudo Normal**
- Botão: **Gerar Laudo (IA)**
- Área de exibição do laudo gerado (quando aplicável)
- Botão: **Novo Laudo**

### Estado

- Todo estado é **volátil**
- Nenhum texto médico pode ser persistido no navegador
- Reset completo ao iniciar novo laudo

---

## Backend — Regras de Implementação

### Princípios

- Stateless em relação a conteúdo clínico
- Nenhum texto médico é salvo ou logado
- Validação forte de DTOs

### Endpoint Crítico

`POST /reports/generate`

**DTO:**
- examType: string
- templateId: string
- indication?: string
- findings: string

**Regras:**
- JWT obrigatório
- Acesso ativo (trial/assinatura) ou role `ADMIN`
- Nenhum dado pessoal permitido

### Acesso, Assinaturas e Quota de IA

- O acesso às rotas de templates e geração de laudos é protegido por um guard de acesso (papel + janela ativa).
- Para usuários `TRIAL` e `BLUE`, há controle de custo por quota: após **3000** chamadas **bem-sucedidas** ao modelo preferido dentro da janela ativa, o sistema roteia automaticamente para um modelo de fallback.
- `ADMIN` não sofre limitação de quota (mas as chamadas ainda são registradas tecnicamente).

#### Endpoint Admin (DEV/operacional)

`PATCH /billing/admin/users/:userId/subscription`

- Requer JWT de `ADMIN`
- Permite ajustar `role` e (para `BLUE`) a janela de assinatura

---

## Templates Médicos

### Definição

- Templates são textos base de **exames normais**
- São versionados
- São revisáveis por médicos

### Uso

- Copiados diretamente pelo botão "Copiar Laudo Normal"
- Utilizados como base no Prompt Builder quando a IA é acionada

---

## Prompt Builder (IA)

### Composição do Prompt

1. Regras globais (sistema)
2. Contexto da modalidade
3. Template base normal
4. Indicação (se houver)
5. Achados descritos pelo médico

### Princípios

- O médico é a fonte primária de verdade
- A IA apenas redige e organiza
- Nenhuma inferência não solicitada

### Configuração do Gemini (somente para testes)

- Defina a chave via variável de ambiente (não commite chaves no repositório):
  - `GEMINI_API_KEY`
  - (opcional) `GEMINI_MODEL` (modelo preferido; default: `gemini-3-flash-preview`)
  - (opcional) `GEMINI_FALLBACK_MODEL` (default: `gemini-2.5-flash-lite`)
  - (opcional) `GEMINI_PREFERRED_MODEL_REQUEST_LIMIT` (default: `3000`)
  - (opcional) `GEMINI_TIMEOUT_MS` (default: `20000`)

Obs: os modelos disponíveis dependem da sua chave/conta. Se receber erro de modelo não encontrado, ajuste `GEMINI_MODEL`/`GEMINI_FALLBACK_MODEL` para modelos existentes na sua conta.

No stack de dev (`docker-compose.dev.yml`), o backend lê essas variáveis do seu ambiente local (incluindo `.env` na raiz do projeto).

---

## Auditoria e Conformidade

### Auditável

- user_id
- template_id
- timestamp
- modelo de IA
- duração da requisição

### Não Auditável

- Texto do laudo
- Achados
- Indicação
- Dados do paciente

---

## Ordem Recomendada de Implementação

1. Autenticação + Trial
2. Editor de Laudos (sem IA)
3. Templates e Copiar Laudo Normal
4. Backend de geração (DTO + validação)
5. Prompt Builder
6. Integração com Gemini
7. Billing
8. Auditoria
9. Hardening de segurança

---

## CI (Backend) — Como validar localmente

O repositório possui um workflow de CI para o backend (testes, build e smoke checks). Para reproduzir localmente os mesmos passos do CI, você precisa de **Node.js 20** e **Docker**.

1) Suba o Postgres (porta 5432):

```bash
docker compose up -d postgres
```

2) Execute testes, build e smoke checks do backend:

```bash
cd backend
npm ci
npm test
npm run build

# Smoke checks (não devem logar conteúdo sensível)
bash scripts/smoke_audit.sh
bash scripts/smoke_security.sh
```

Notas:
- Os smoke scripts aplicam migrations automaticamente com `prisma migrate deploy` (útil em ambientes limpos como o CI).
- `smoke_audit.sh` valida que a auditoria registra apenas metadados (sem achados/indicação/laudo).
- `smoke_security.sh` valida `401` para token expirado e `429` ao exceder o rate limit.

---

## Nota Final

O Vixrad é uma ferramenta médica profissional.

Ele deve ser desenvolvido com:
- Clareza
- Previsibilidade
- Segurança
- Respeito à prática clínica

Qualquer comportamento não descrito explicitamente neste README **não deve ser implementado sem revisão arquitetural**.
