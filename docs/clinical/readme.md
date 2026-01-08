# Clinical Templates — Vixrad

Este diretório contém os modelos clínicos de laudos radiológicos utilizados pelo sistema Vixrad.

Os templates são escritos em Markdown puro, com um bloco de metadados YAML no topo e marcadores de controle em comentários HTML que permitem ao sistema:
- Determinar quais perguntas devem ser feitas ao usuário
- Inserir ou omitir trechos do laudo
- Adaptar o texto final de forma estruturada e rastreável

---

## Estrutura geral de um template

Todo template clínico deve seguir obrigatoriamente a estrutura abaixo:

1. Bloco de metadados YAML (front matter)
2. Título do exame
3. Seções clínicas obrigatórias
4. Seções clínicas opcionais
5. Marcadores de controle em comentários HTML

---

## 1. Bloco de metadados (YAML front matter)

O bloco de metadados deve:
- Estar no início do arquivo
- Começar e terminar com `---`
- Conter apenas YAML válido

### Estrutura mínima

```yaml
---
exam_type: CT
requires:
  indication: optional
  sex: none
  contrast: required
  side: none
---
```

### Campos opcionais adicionais

Além do bloco mínimo, um template pode declarar:

```yaml
side_gender: feminine # ou masculine (controla concordância de {{LADO}})

defaults:
  incidence: "PA e Perfil" # pré-seleção sugerida na UI (se aplicável)
```

---

## 2. exam_type

Define a modalidade do exame.

### Valores previstos

* `CT` — Tomografia Computadorizada
* `XR` — Radiografia
* `US` — Ultrassonografia
* `MR` — Ressonância Magnética
* `MG` — Mamografia
* `DXA` — Densitometria Óssea
* `NM` — Medicina Nuclear

Cada template deve declarar exatamente um `exam_type`.

---

## 3. requires

O bloco `requires` define quais informações o sistema deve perguntar ao usuário antes de gerar o laudo.

Esses campos não indicam obrigatoriedade clínica, mas sim comportamento da interface.

### Estados possíveis

* `required` — o sistema pergunta e exige resposta
* `optional` — o sistema pergunta, resposta é opcional
* `none` — o sistema não pergunta
* `fixed` — valor implícito no template (não perguntado)

### Campos atualmente suportados

```yaml
requires:
  type:
  indication:
  sex:
  side:
  contrast:
  incidence:
  decubitus:
  ecg_gating:
  phases:
  coil:
  sedation:
  artifact_source:
```

Notas rápidas:

- `type` é usado quando o template precisa de uma escolha discreta de “tipo” de exame (ex.: mamografia convencional/digital/3D).
- `contrast: fixed` é usado quando o contraste é implícito (ex.: angiotomografias e angiorressonâncias).
- `artifact_source` controla a pergunta de artefatos e a inserção de um fragmento na **Técnica**.

---

### indication

Indicação clínica do exame.

Valores possíveis:

* `required`
* `optional`
* `none`

---

### sex

Utilizado quando o corpo do laudo varia conforme o sexo do paciente.

Valores possíveis:

* `required`
* `optional`
* `none`

---

### side

Utilizado em exames laterais (direito / esquerdo).

Valores possíveis:

* `required`
* `optional`
* `none`

Observação: a UI pode oferecer a opção `BILATERAL` quando `side` é aplicável.

---

### contrast

Define se o sistema deve perguntar sobre uso de contraste.

Valores possíveis:

* `required` — pergunta se foi com ou sem contraste
* `optional` — pergunta opcional
* `fixed` — contraste implícito (ex.: angiotomografias e angiorressonâncias)
* `none` — não aplicável à modalidade

---

### incidence

Utilizado em radiografias em que o texto varia conforme a incidência.

Valores possíveis:

* `required`
* `optional`
* `none`
* `fixed`

---

### decubitus

Utilizado quando o texto varia conforme o decúbito.

Valores possíveis:

* `required`
* `optional`
* `none`
* `fixed`

---

## 4. Título do exame

O título deve:

* Usar heading de nível 1 (`#`)
* Estar em MAIÚSCULAS
* Conter placeholders quando aplicável

Exemplo:

```md
# TOMOGRAFIA COMPUTADORIZADA DO TORNOZELO {{LADO}}
```

---

## 5. Seções clínicas obrigatórias

Todos os templates devem conter exatamente estas seções, nesta ordem:

1. Técnica
2. Análise
3. Impressão diagnóstica

### Formatação obrigatória

* Apenas o nome da seção fica em negrito
* O texto da Técnica começa na mesma linha
* O texto da Análise e da Impressão começa na linha seguinte

Exemplo:

```md
**Técnica:** Exame realizado em tomógrafo multidetectores (...)

**Análise:**

Texto do laudo.

**Impressão diagnóstica:**
Texto final.
```

---

## 6. Seções clínicas opcionais

### Indicação

Incluída somente se `requires.indication` for diferente de `none`.

Implementação obrigatória:

```md
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
```

---

### Notas

As notas não fazem parte do bloco `requires`.

Elas são geradas dinamicamente a partir da interação do usuário com a IA durante a descrição dos achados.

Formato obrigatório:

```md
<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
```

As notas devem estar em um único parágrafo, podendo conter marcações como `¹`, `²`, `³`.

---

## 7. Marcadores de controle (comentários HTML)

Os comentários HTML funcionam como linguagem de controle declarativa.

### Condicional com alternativa

```md
<!-- IF CONTRASTE -->
Texto quando verdadeiro
<!-- ELSE -->
Texto quando falso
<!-- ENDIF CONTRASTE -->
```

---

### Condicional simples

```md
<!-- IF SEXO_FEMININO -->
Texto específico
<!-- ENDIF SEXO_FEMININO -->
```

Esses comentários:

* São válidos em Markdown
* Não aparecem no laudo final
* São interpretados pelo motor do sistema

---

## 8. Placeholders

Os placeholders devem seguir exatamente este padrão:

```md
{{NOME_DO_CAMPO}}
```

Exemplos:

* `{{LADO}}`
* `{{TYPE}}`
* `{{INDICACAO}}`
* `{{NOTAS}}`

Não utilizar:

* Letras minúsculas
* Espaços
* Sintaxe alternativa

Observação:

- Mesmo fragmentos técnicos (ex.: artefatos/coil/fases) devem ser declarados como placeholders em MAIÚSCULAS (ex.: `{{ARTIFACT_SOURCE}}`, `{{COIL}}`).

---

## 9. Regras gerais

* Nenhum template deve conter texto explicativo ao usuário
* Nenhuma lógica deve existir fora de comentários HTML
* Apenas Markdown padrão (CommonMark)
* Linguagem médica integralmente preservada

---

## Status

Este documento define o padrão oficial de templates clínicos do Vixrad.

Todo novo laudo deve seguir integralmente estas regras.