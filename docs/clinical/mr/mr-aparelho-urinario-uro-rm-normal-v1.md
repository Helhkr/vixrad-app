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
  phases: optional
  coil: optional
  sedation: optional
  artifact_source: optional
---

# URO-RESSONÂNCIA MAGNÉTICA (APARELHO URINÁRIO)

**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências ponderadas em T1 e T2, com e sem supressão de gordura, incluindo sequências uroteliais conforme protocolo, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Rins em topografia habitual, com morfologia e sinal preservados, sem lesões focais suspeitas nas sequências realizadas.

Sistema pielocalicial sem dilatação.

Ureteres sem dilatação significativa no segmento avaliado.

Bexiga com paredes finas, sem lesões focais evidentes.

**Impressão diagnóstica:**
Exame sem alterações significativas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
