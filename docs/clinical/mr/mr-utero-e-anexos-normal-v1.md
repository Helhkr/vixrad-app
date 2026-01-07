---
exam_type: MR
requires:
  indication: optional
  sex: fixed
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

# RESSONÂNCIA MAGNÉTICA DO ÚTERO E ANEXOS

**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências ponderadas em T1 e T2, com e sem supressão de gordura, incluindo difusão conforme protocolo, em planos axial, coronal e sagital, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Útero com dimensões preservadas, contornos regulares e zonalidade habitual.

Endométrio com espessura habitual para a fase do ciclo, sem lesões focais evidentes nas sequências realizadas.

Colo uterino sem alterações significativas.

Ovários com morfologia preservada, sem massas anexiais.

Ausência de líquido livre pélvico significativo.

Sem linfonodomegalias pélvicas suspeitas.

**Impressão diagnóstica:**
Exame sem alterações significativas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
