---
exam_type: DXA
requires:
  type: none
  indication: optional
  sex: required
---

# DENSITOMETRIA ÓSSEA (DEXA)

**Técnica:** Densitometria óssea por absorciometria de dupla energia (DEXA), com aquisição conforme protocolo.

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

<!-- IF DXA_LIMITACOES -->
**Limitações técnicas:** Exame realizado na presença de {{DXA_LIMITACOES_LISTA}}, que podem influenciar os resultados.
<!-- ENDIF DXA_LIMITACOES -->

**Análise:**

**Coluna lombar (L1-L4):**
- DMO (g/cm²): {{DXA_L1L4_DMO}}
- T-score: {{DXA_L1L4_T_SCORE}}
- Z-score: {{DXA_L1L4_Z_SCORE}}

**Colo femoral:**
- DMO (g/cm²): {{DXA_COLO_FEMORAL_DMO}}
- T-score: {{DXA_COLO_FEMORAL_T_SCORE}}
- Z-score: {{DXA_COLO_FEMORAL_Z_SCORE}}

**Quadril total:**
- DMO (g/cm²): {{DXA_QUADRIL_TOTAL_DMO}}
- T-score: {{DXA_QUADRIL_TOTAL_T_SCORE}}
- Z-score: {{DXA_QUADRIL_TOTAL_Z_SCORE}}

<!-- IF DXA_ANTEBRACO -->
**Rádio 33% (antebraço):**
- DMO (g/cm²): {{DXA_ANTEBRACO_DMO}}
- T-score: {{DXA_ANTEBRACO_T_SCORE}}
- Z-score: {{DXA_ANTEBRACO_Z_SCORE}}
<!-- ENDIF DXA_ANTEBRACO -->

<!-- IF DXA_EXAME_ANTERIOR -->
**Comparação com exame anterior ({{DXA_EXAME_ANTERIOR_DATA}}):**
- Variação coluna L1-L4: {{DXA_VARIACAO_L1L4}}
- Variação colo femoral: {{DXA_VARIACAO_COLO}}
- Variação quadril total: {{DXA_VARIACAO_QUADRIL}}
<!-- IF DXA_ANTEBRACO -->
- Variação rádio 33%: {{DXA_VARIACAO_ANTEBRACO}}
<!-- ENDIF DXA_ANTEBRACO -->
<!-- ENDIF DXA_EXAME_ANTERIOR -->

**Impressão diagnóstica:**
**{{DXA_CLASSIFICACAO}}** - Valores de densidade mineral óssea (DMO), T-score e Z-score conforme descrito acima.

{{NOTA}}

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
