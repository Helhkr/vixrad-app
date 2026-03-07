# Vixrad - Especificação Técnica de Templates Clínicos

Este documento é o contrato normativo dos templates clínicos.

Regra de precedência:
1. código-fonte do backend;
2. este `spec.md`;
3. `docs/clinical/readme.md`.

## 1. Escopo

Este documento cobre:
- formato do template (`.md` + front matter YAML);
- metadados aceitos;
- linguagem condicional suportada pelo parser;
- placeholders suportados;
- regras mínimas de consistência para evolução.

Este documento não cobre:
- regras de negócio de billing/autenticação;
- política de produto fora de templates.

## 2. Formato canônico

Cada template deve conter:
1. YAML front matter delimitado por `---`;
2. corpo em Markdown válido.

Exemplo mínimo válido:

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

## 3. Metadados

### 3.1 Campo obrigatório

- `exam_type`: `CT | XR | US | MR | MG | DXA | NM`

### 3.2 Campo obrigatório

- `requires`: objeto com estados de coleta da UI.

Estados válidos em `requires`:
- `required`
- `optional`
- `none`
- `fixed`

Chaves suportadas em `requires`:
- `type`
- `indication`
- `sex`
- `contrast`
- `side`
- `incidence`
- `decubitus`
- `ecg_gating`
- `phases`
- `coil`
- `sedation`
- `artifact_source`

Validação mandatória:
- `requires.sex` não aceita `male`/`female`.

### 3.3 Campos opcionais

- `display_name`: nome estável para catálogo `/templates`.
- `side_gender`: `masculine | feminine`.
- `defaults`: objeto de defaults (ex.: `incidence`).
- `phase`: metadado de variação por fase para angio-CT.

Formato de `phase`:

```yaml
phase:
  type: select
  options: [arterial, venoso, arterial_e_venoso]
  required: true
```

```yaml
phase:
  type: static
  value: arterial
```

Domínio de valores de fase:
- `arterial`
- `venoso`
- `arterial_e_venoso`

## 4. Corpo do laudo

Seções obrigatórias (ordem canônica):
1. Título (`# ...`)
2. `**Técnica:**`
3. `**Análise:**`
4. `**Impressão diagnóstica:**`

Seções opcionais típicas:
- indicação (`INDICACAO`)
- notas (`NOTAS`)

## 5. Linguagem condicional

Sintaxe suportada:

```html
<!-- IF CONDICAO -->
...
<!-- ELSE -->
...
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
- `INCIDENCIA`
- `DECUBITUS`
- `PHASE_ARTERIAL`
- `PHASE_VENOSO`
- `PHASE_AMBAS`

Limitações mandatórias:
- não usar `ELSEIF`;
- não usar comparações inline (ex.: `IF PHASE=arterial`);
- para múltiplos ramos, usar `IF` aninhado.

## 6. Placeholders

Formato obrigatório:

```md
{{NOME_DO_CAMPO}}
```

Placeholders amplamente usados:
- `{{INDICACAO}}`
- `{{TYPE}}`
- `{{SEXO}}`
- `{{LADO}}`
- `{{NOTAS}}`
- `{{ECG_GATING}}`
- `{{PHASES}}`
- `{{PHASE}}`
- `{{COIL}}`
- `{{SEDATION}}`
- `{{ARTIFACT_SOURCE}}`
- `{{INCIDENCIA}}`
- `{{DECUBITUS}}`

## 7. Regras de integração backend/frontend

- Se `phase.type=select`, a UI deve solicitar fase no `/report-form`.
- Se `phase.type=static`, a UI não deve solicitar fase e deve enviar o valor fixo.
- Se `phase` estiver ausente, não há fluxo de fase para o template.
- `display_name`, quando presente, deve ser usado como nome no catálogo.

## 8. Critérios de qualidade para alterações

Toda alteração em templates deve:
1. preservar YAML válido;
2. respeitar o domínio de estados de `requires`;
3. usar apenas sintaxe condicional suportada;
4. manter seções obrigatórias do corpo;
5. ser validada com testes de templates do backend.

Comandos recomendados:

```bash
cd backend
npm test -- templates.service.spec.ts templates.controller.spec.ts --runInBand
npm test -- templates.ct-templates.spec.ts --runInBand
```

## 9. Referências

- guia operacional: `docs/clinical/readme.md`
- implementação backend:
  - `backend/src/modules/templates/templates.service.ts`
  - `backend/src/modules/templates/templates.controller.ts`
  - `backend/src/modules/reports/dto/generate-report.dto.ts`