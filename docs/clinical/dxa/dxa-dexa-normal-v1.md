---
exam_type: DXA
requires:
  type: none
  indication: optional
---

# DENSITOMETRIA ÓSSEA (DEXA)

**Técnica:** Densitometria óssea por absorciometria de dupla energia (DEXA), com aquisição conforme protocolo.

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

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

**Interpretação (OMS):**
- T-score entre -1,0 e +1,0: Normal
- T-score entre -1,0 e -2,5: Osteopenia
- T-score ≤ -2,5: Osteoporose

**Impressão diagnóstica:**
Valores de densidade mineral óssea (DMO), T-score e Z-score conforme descrito acima.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
