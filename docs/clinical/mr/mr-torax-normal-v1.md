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

# RESSONÂNCIA MAGNÉTICA DO TÓRAX

**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências ponderadas em T1 e T2, com e sem supressão de gordura, em planos axial e coronal, conforme protocolo, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Sem evidências de massas mediastinais ou coleções nas sequências realizadas.

Ausência de derrames pleurais significativos.

Sem linfonodomegalias torácicas suspeitas no campo de visão.

**Impressão diagnóstica:**
Exame sem alterações significativas nas sequências realizadas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
