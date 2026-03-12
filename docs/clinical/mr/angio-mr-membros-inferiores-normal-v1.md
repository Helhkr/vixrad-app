---
exam_type: MR
requires:
  indication: optional
  sex: none
  contrast: fixed
  side: required
  incidence: none
  decubitus: none
  ecg_gating: none
  coil: optional
  sedation: optional
  artifact_source: optional
phase:
  type: select
  options:
    - arterial
    - venoso
    - arterial_e_venoso
  required: true
---

<!-- IF PHASE_ARTERIAL -->
# ANGIORRESSONÂNCIA ARTERIAL DO MEMBRO INFERIOR {{LADO}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIORRESSONÂNCIA VENOSA DO MEMBRO INFERIOR {{LADO}}
<!-- ELSE -->
# ANGIORRESSONÂNCIA ARTERIAL E VENOSA DO MEMBRO INFERIOR {{LADO}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências angiográficas para avaliação arterial do membro inferior {{LADO}} conforme protocolo, com administração de meio de contraste paramagnético endovenoso em fase arterial.{{COIL}}{{SEDATION}}{{ECG_GATING}}{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências angiográficas para avaliação venosa do membro inferior {{LADO}} conforme protocolo, com administração de meio de contraste paramagnético endovenoso em fase venosa.{{COIL}}{{SEDATION}}{{ECG_GATING}}{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências angiográficas para avaliação arterial e venosa do membro inferior {{LADO}} conforme protocolo, com administração de meio de contraste paramagnético endovenoso em fases arterial e venosa.{{COIL}}{{SEDATION}}{{ECG_GATING}}{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

<!-- IF PHASE_ARTERIAL -->
Opacificação arterial preservada nas sequências realizadas.

Artérias ilíacas, femorais, poplíteas e principais ramos tibiais/fibulares pérvios, sem estenoses hemodinamicamente significativas ou oclusões no lado avaliado.

Ausência de dilatações aneurismáticas evidentes.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
Opacificação venosa preservada nas sequências realizadas.

Veias ilíacas, femorais, poplíteas e principais ramos tibiais/fibulares pérvios, sem sinais de trombose no lado avaliado.

Ausência de sinais de compressão venosa extrínseca.
<!-- ELSE -->
**Artérias:**
Opacificação arterial preservada nas sequências realizadas.

Artérias ilíacas, femorais, poplíteas e principais ramos tibiais/fibulares pérvios, sem estenoses hemodinamicamente significativas ou oclusões no lado avaliado.

**Veias:**
Opacificação venosa preservada nas sequências realizadas.

Veias ilíacas, femorais, poplíteas e principais ramos tibiais/fibulares pérvios, sem sinais de trombose no lado avaliado.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Angiorressonância arterial do membro inferior {{LADO}} dentro dos limites da normalidade, sem estenoses hemodinamicamente significativas.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Angiorressonância venosa do membro inferior {{LADO}} dentro dos limites da normalidade, sem sinais de trombose nas veias avaliadas.
<!-- ELSE -->
**Impressão diagnóstica:**
Angiorressonância arterial e venosa do membro inferior {{LADO}} dentro dos limites da normalidade, sem estenoses arteriais significativas ou trombose venosa.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
