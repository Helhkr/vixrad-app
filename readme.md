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
4. **Não utilizar localStorage, sessionStorage ou IndexedDB** para texto médico.
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
vixrad/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   └── reports/
│   ├── services/
│   └── types/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── trial/
│   │   │   ├── billing/
│   │   │   ├── templates/
│   │   │   ├── reports/
│   │   │   ├── ai/
│   │   │   ├── audit/
│   │   │   └── security/
│   │   ├── common/
│   │   └── main.ts
│
└── README.md
```

Essa estrutura **não é sugestão**, é o padrão esperado para o projeto.

---

## Fluxo Funcional do Usuário

### Autenticação

- Login
- Registro com **trial gratuito de 7 dias**

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
- Trial ativo ou assinatura válida
- Nenhum dado pessoal permitido

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

## Nota Final

O Vixrad é uma ferramenta médica profissional.

Ele deve ser desenvolvido com:
- Clareza
- Previsibilidade
- Segurança
- Respeito à prática clínica

Qualquer comportamento não descrito explicitamente neste README **não deve ser implementado sem revisão arquitetural**.
