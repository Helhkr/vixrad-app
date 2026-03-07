# Clinical Templates - Vixrad

Este diretório contém os templates clínicos de laudos radiológicos usados pelo Vixrad.

Objetivo deste documento:
- orientar criação e manutenção de templates no dia a dia;
- fornecer checklist prático para mudanças seguras.

Para regras normativas e contrato técnico, consulte `docs/clinical/spec.md`.

## Estrutura de um template

Todo template deve conter:
1. YAML front matter no topo;
2. corpo em Markdown;
3. seções clínicas obrigatórias: `Técnica`, `Análise`, `Impressão diagnóstica`.

Exemplo mínimo:

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

## Front matter no uso prático

Campos comuns:
- `exam_type`: modalidade (`CT|XR|US|MR|MG|DXA|NM`)
- `requires`: comportamento de perguntas na UI
- `display_name` (opcional): nome estável para `/templates`
- `side_gender` (opcional): concordância para `{{LADO}}`
- `defaults` (opcional): defaults de UI
- `phase` (opcional): variação por fase em angio-CT

Exemplo com campos avançados:

```yaml
---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DE ABDOME SUPERIOR
requires:
  indication: optional
  sex: none
  contrast: fixed
  side: none
  artifact_source: optional
phase:
  type: select
  options:
    - arterial
    - venoso
    - arterial_e_venoso
  required: true
---
```

## `requires`: regra rápida

Estados válidos para qualquer campo de `requires`:
- `required`
- `optional`
- `none`
- `fixed`

Campos suportados hoje:
- `type`
- `indication`
- `sex`
- `side`
- `contrast`
- `incidence`
- `decubitus`
- `ecg_gating`
- `phases`
- `coil`
- `sedation`
- `artifact_source`

Atenção:
- não usar `male`/`female` em `requires.sex`;
- `requires.sex` aceita apenas estados, não valores de sexo.

## `phase`: quando usar

Use `phase` apenas se o exame realmente mudar título/conteúdo/impressão por fase.

`select` (pergunta ao usuário):

```yaml
phase:
  type: select
  options: [arterial, venoso, arterial_e_venoso]
  required: true
```

`static` (valor fixo, sem pergunta):

```yaml
phase:
  type: static
  value: arterial
```

Sem `phase`: o fluxo não pergunta fase.

## Condicionais no corpo

O parser suporta `IF/ELSE/ENDIF` em comentários HTML:

```md
<!-- IF CONTRASTE -->
texto A
<!-- ELSE -->
texto B
<!-- ENDIF CONTRASTE -->
```

Limitações importantes:
- não há `ELSEIF`;
- não há comparação inline (ex.: `IF PHASE=arterial`);
- para múltiplos ramos, use `IF` aninhado.

## Placeholders

Padrão obrigatório:

```md
{{NOME_DO_CAMPO}}
```

Exemplos comuns:
- `{{INDICACAO}}`
- `{{LADO}}`
- `{{SEXO}}`
- `{{NOTAS}}`
- `{{ARTIFACT_SOURCE}}`
- `{{INCIDENCIA}}`
- `{{DECUBITUS}}`
- `{{PHASE}}`

## Checklist de alteração segura

Antes de abrir PR:
1. validar YAML do front matter;
2. confirmar que `requires` usa apenas estados válidos;
3. confirmar se `display_name` é necessário;
4. confirmar se `phase` é realmente necessário (`select`, `static` ou ausente);
5. revisar condicionais (`IF/ELSE/ENDIF` apenas);
6. revisar placeholders em maiúsculas e com sintaxe `{{...}}`.

Validação recomendada no backend:

```bash
cd backend
npm test -- templates.service.spec.ts templates.controller.spec.ts --runInBand
npm test -- templates.ct-templates.spec.ts --runInBand
```

## Convenções gerais

- manter linguagem clínica, sem texto instrucional ao usuário final;
- não colocar lógica fora de comentários condicionais;
- usar `display_name` quando o título renderizado puder variar;
- para exames de escopo único, evitar `phase: select`.