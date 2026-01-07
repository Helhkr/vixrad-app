---
exam_type: MR
requires:
  indication: optional
  sex: none
  contrast: required
  side: none
  incidence: none
  decubitus: none
  ecg_gating: none
  phases: none
  coil: optional
  sedation: optional
  artifact_source: optional
---

# RESSONÂNCIA MAGNÉTICA DAS ÓRBITAS

**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências ponderadas em T1 e T2, com supressão de gordura, incluindo planos axial e coronal, conforme protocolo, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Globos oculares com morfologia preservada.

Nervos ópticos com espessura e sinal preservados, <!-- IF CONTRASTE -->sem realce patológico evidente.<!-- ELSE -->sem alterações significativas nas sequências realizadas.<!-- ENDIF CONTRASTE -->

Musculatura extrínseca ocular com espessura e sinal preservados.

Gordura orbitária sem alterações significativas.

Ausência de coleções ou massas orbitárias evidentes nas sequências realizadas.

**Impressão diagnóstica:**
Exame sem alterações significativas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
