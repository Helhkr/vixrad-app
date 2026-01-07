---
exam_type: MR
requires:
  indication: optional
  sex: none
  contrast: required
  side: none
  incidence: none
  decubitus: none
  ecg_gating: optional
  phases: none
  coil: optional
  sedation: optional
  artifact_source: optional
---

# RESSONÂNCIA MAGNÉTICA CARDÍACA

**Técnica:** Exame realizado em equipamento de ressonância magnética com protocolo cardíaco, incluindo sequências cine para avaliação funcional e sequências ponderadas em T1/T2 conforme protocolo, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso, incluindo avaliação de realce tardio miocárdico quando aplicável.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Cavidades cardíacas com dimensões preservadas.

Função sistólica global preservada nas sequências cine realizadas.

Ausência de derrame pericárdico significativo.

Sem sinais evidentes de trombos intracavitários nas sequências realizadas.

<!-- IF CONTRASTE -->
Sem áreas de realce tardio miocárdico sugestivas de fibrose/cicatriz nas sequências realizadas.
<!-- ENDIF CONTRASTE -->

**Impressão diagnóstica:**
Exame sem alterações significativas nas sequências realizadas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
