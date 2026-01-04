# Vixrad — Checklist Técnico de Implementação (Copilot‑Aware)

Este checklist deve ser seguido **na ordem apresentada**.  
Cada etapa pressupõe que a anterior esteja concluída e commitada.

O objetivo é:
- Guiar o desenvolvimento humano
- Constranger assistentes de IA (Copilot, Claude, etc.) a seguirem o projeto corretamente
- Evitar retrabalho arquitetural

---

## FASE 0 — BASE DO PROJETO (já concluída)

✔ README.md normativo criado  
✔ Estrutura de pastas criada conforme README  
✔ Commit inicial da estrutura

Se qualquer item acima não estiver versionado, **pare aqui**.

---

## FASE 1 — FRONTEND BASE (SEM IA)

### 1.1 Inicialização do Frontend

- [ ] Inicializar Next.js com App Router e TypeScript
- [ ] Configurar ESLint e Prettier
- [ ] Garantir que `frontend/app/layout.tsx` e `page.tsx` existam

**Regras:**
- Não implementar autenticação ainda
- Não implementar IA
- Não persistir estado local

📌 Commit sugerido:
> feat(frontend): bootstrap nextjs app router

---

### 1.2 Estrutura do Editor de Laudos

Criar a feature central:

`frontend/features/reports/`

- [ ] `ReportEditor.tsx`
- [ ] Componentes filhos:
  - ExamTypeSelect
  - TemplateSelect
  - IndicationInput
  - FindingsInput
  - ActionButtons

**Regras obrigatórias:**
- Estado totalmente volátil
- Nenhum uso de localStorage
- Nenhuma chamada de backend

📌 Commit sugerido:
> feat(frontend): report editor base structure

---

### 1.3 Botões Críticos

Implementar comportamento dos botões:

- [ ] **Copiar Laudo Normal**
  - Copia texto do template selecionado
  - Não chama backend
  - Não chama IA

- [ ] **Novo Laudo**
  - Reset completo do estado

📌 Commit sugerido:
> feat(frontend): copy normal report and reset flow

---

## FASE 2 — BACKEND BASE (SEM IA)

### 2.1 Inicialização do Backend

- [ ] Inicializar NestJS com TypeScript
- [ ] Criar `main.ts`
- [ ] Configurar validação global (class-validator)

📌 Commit sugerido:
> feat(backend): bootstrap nestjs base

---

### 2.2 Módulos Fundamentais

Criar módulos vazios:

- [ ] auth
- [ ] users
- [ ] trial
- [ ] billing
- [ ] templates
- [ ] reports
- [ ] audit

Nenhuma lógica clínica ainda.

📌 Commit sugerido:
> chore(backend): scaffold core modules

---

## FASE 3 — TEMPLATES MÉDICOS

### 3.1 Estrutura de Templates

No módulo `templates`:

- [ ] Definir entidade Template (sem conteúdo clínico dinâmico)
- [ ] Campos: id, modalidade, região, texto_base, versão, status

📌 Commit sugerido:
> feat(templates): template entity and repository

---

### 3.2 Seed de Templates

- [ ] Inserir templates normais (TC já definidos)
- [ ] Garantir versionamento
- [ ] Nenhuma dependência de IA

📌 Commit sugerido:
> feat(templates): seed initial radiology templates

---

## FASE 4 — AUTENTICAÇÃO E TRIAL

### 4.1 Auth

- [ ] Registro
- [ ] Login
- [ ] JWT

### 4.2 Trial

- [ ] Trial automático de 7 dias
- [ ] Middleware de verificação

📌 Commit sugerido:
> feat(auth): authentication and trial system

---

## FASE 5 — GERAÇÃO DE LAUDO (SEM IA AINDA)

### 5.1 Endpoint de Geração

Criar:

`POST /reports/generate`

- [ ] DTO validado
- [ ] Autorização
- [ ] Retornar erro mockado

Nenhuma IA nesta fase.

📌 Commit sugerido:
> feat(reports): generate endpoint contract

---

## FASE 6 — PROMPT BUILDER

### 6.1 Implementação

Criar serviço:

- [ ] PromptBuilderService
- [ ] Composição em camadas (conforme README)

📌 Commit sugerido:
> feat(ai): deterministic prompt builder

---

## FASE 7 — INTEGRAÇÃO COM GEMINI

### 7.1 Serviço de IA

- [ ] Cliente Gemini
- [ ] Timeout
- [ ] Tratamento de erro

### 7.2 Integração com Reports

- [ ] Chamar IA apenas quando solicitado

📌 Commit sugerido:
> feat(ai): gemini integration for report generation

---

## FASE 8 — AUDITORIA

### 8.1 Eventos Auditáveis

- [ ] user_id
- [ ] template_id
- [ ] timestamp
- [ ] duração

Nenhum texto clínico.

📌 Commit sugerido:
> feat(audit): technical audit events

---

## FASE 9 — BILLING

- [ ] Planos mensal/anual
- [ ] Validação de assinatura

📌 Commit sugerido:
> feat(billing): subscription enforcement

---

## FASE 10 — HARDENING

- [ ] Rate limit
- [ ] Sanitização de inputs
- [ ] Logs técnicos

📌 Commit sugerido:
> chore(security): hardening and safeguards

---

## REGRA FINAL

Se um assistente de IA sugerir algo que:
- Persista laudo
- Armazene texto clínico
- Inferira diagnóstico

👉 **Está errado por definição**.

Revisar sempre contra o README.md.

