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

# RESSONÂNCIA MAGNÉTICA DA COLUNA TOTAL

**Técnica:** Exame realizado em equipamento de ressonância magnética, com aquisição de sequências ponderadas em T1 e T2 ao longo de toda a coluna vertebral, nos planos sagital e axial (segmentares), incluindo sequências com supressão de gordura conforme protocolo, <!-- IF CONTRASTE -->antes e após a administração de meio de contraste paramagnético endovenoso.<!-- ELSE -->sem a administração de meio de contraste paramagnético endovenoso.<!-- ENDIF CONTRASTE -->{{coil}}{{sedation}}{{ecg_gating}}{{phases}}{{artifact_source}}
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->
**Análise:**

Alinhamento global preservado.

Corpos vertebrais com morfologia e sinal preservados, sem evidências de fratura recente.

Discos intervertebrais sem protrusões ou hérnias discais significativas.

Canal vertebral com calibre preservado.

Medula espinhal com sinal preservado, sem sinais de mielopatia.

**Impressão diagnóstica:**
Exame sem alterações significativas.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
