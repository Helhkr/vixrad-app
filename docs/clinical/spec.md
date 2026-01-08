---

# VIXRAD — Especificação Técnica Formal (`spec.md`)

## Objetivo
Este documento define a especificação técnica oficial do sistema **Vixrad**, servindo como referência única para implementação, validação e manutenção.  
Todo o conteúdo aqui descrito é normativo e deve ser seguido por desenvolvedores humanos e agentes de IA auxiliares.

---

## Estrutura dos Templates Clínicos

### Formato
Cada template clínico deve ser um arquivo `.md` contendo:

1. **YAML front matter** (metadados)  
2. **Corpo do laudo em Markdown puro**

### YAML Front Matter
Exemplo:

```yaml
---
exam_type: CT
requires:
  indication: optional
  sex: none
  contrast: required
  side: required
---
```

#### Campos obrigatórios
- **exam_type**: modalidade do exame. Valores possíveis:
  - CT, XR, US, MR, MG, DXA, NM
- **requires**: define perguntas obrigatórias/opcionais antes da geração do laudo.
  - Valores: `required`, `optional`, `none`, `fixed`
  - Campos suportados: `type`, `indication`, `sex`, `contrast`, `side`, `incidence`, `decubitus`, `ecg_gating`, `phases`, `coil`, `sedation`, `artifact_source`

---

## Corpo do Laudo

### Seções obrigatórias (nesta ordem)
1. Título do exame (`#`)
2. Técnica
3. Análise
4. Impressão diagnóstica

### Seções opcionais
- Indicação (se fornecida pelo usuário)
- Notas (geradas dinamicamente pela IA)

---

## Placeholders

Formato: `{{PLACEHOLDER}}`

Placeholders suportados:
- `{{INDICACAO}}`
- `{{TYPE}}`
- `{{SEXO}}`
- `{{LADO}}`
- `{{NOTAS}}`

Placeholders técnicos adicionais (quando o template declarar o campo correspondente em `requires`):
- `{{ECG_GATING}}`
- `{{PHASES}}`
- `{{COIL}}`
- `{{SEDATION}}`
- `{{ARTIFACT_SOURCE}}`

---

## Controle Condicional

Toda lógica é expressa via comentários HTML:

```html
<!-- IF CONDICAO -->
conteúdo
<!-- ELSE -->
conteúdo alternativo
<!-- ENDIF CONDICAO -->
```

Condições suportadas:
- `MG_CONVENCIONAL`
- `MG_DIGITAL`
- `MG_3D`
- `INDICACAO`
- `CONTRASTE`
- `SEXO_MASCULINO`
- `SEXO_FEMININO`
- `NOTAS`

---

## Regras Específicas

### Contraste em Tomografia e Ressonância
- Sempre obrigatório na seção Técnica.
- Controlado por `requires.contrast`.
- Exemplo:

```html
<!-- IF CONTRASTE -->
após a administração de meio de contraste iodado endovenoso.
<!-- ELSE -->
sem a administração de meio de contraste iodado endovenoso.
<!-- ENDIF CONTRASTE -->
```

- Em angiotomografias: `contrast: fixed`.
- Em angiorressonâncias: `contrast: fixed`.

### Sexo do Paciente
Exemplo:

```html
<!-- IF SEXO_FEMININO -->
texto feminino
<!-- ENDIF SEXO_FEMININO -->

<!-- IF SEXO_MASCULINO -->
texto masculino
<!-- ENDIF SEXO_MASCULINO -->
```

### Lado do Exame
Usado em título e texto:

```
{{LADO}}
```

### Notas
- Não fazem parte de `requires`.
- Sempre no final do laudo.
- Exemplo:

```html
<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
```

---

## Documentação Clínica

Arquivos obrigatórios:
- `docs/clinical/README.md` → visão geral + convenções  
- `docs/clinical/spec.md` → especificação técnica formal  

Ambos devem ser **Markdown puro**.

---

## Backend — Regras de Implementação

### Parser
- Deve interpretar YAML front matter.
- Deve resolver `requires`.
- Deve avaliar blocos condicionais HTML.

### DTO Crítico
`GenerateReportDto`:

```ts
examType: string;    // Ex: "CT"
templateId: string;  // Ex: "tc_cranio_v2"
indication?: string; // Opcional
findings: string;    // Texto livre do médico
```

Validação obrigatória com `class-validator`.

---

## Prompt Builder

### Composição em Camadas
1. Sistema / Regras Globais (imutável)  
2. Contexto da Modalidade  
3. Template Base  
4. Indicação (se houver)  
5. Achados do Médico  

### Princípios
- Médico = fonte primária de verdade.  
- IA apenas redige e organiza.  
- Nenhuma inferência não solicitada.  

---

## Auditabilidade

### O que é auditado
- user_id  
- template_id  
- modelo de IA  
- timestamp  
- duração da requisição  

### O que não é auditado
- Texto do laudo  
- Achados  
- Indicação  
- Dados do paciente  

---

## Ordem de Implementação

1. Autenticação + Trial  
2. Editor de Laudos (sem IA)  
3. Templates + Copiar Laudo Normal  
4. Backend Reports + DTO  
5. Prompt Builder  
6. Integração IA (Gemini)  
7. Billing  
8. Auditoria  
9. Hardening de segurança  

---

## Princípio Final

O Vixrad é uma ferramenta de produtividade médica.  
- O médico decide.  
- A IA redige.  
- O sistema protege.  

---