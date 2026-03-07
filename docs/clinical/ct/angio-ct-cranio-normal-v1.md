---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DE CRÂNIO
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

<!-- IF PHASE_ARTERIAL -->
# ANGIOTOMOGRAFIA ARTERIAL DE CRÂNIO
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA VENOSA DE CRÂNIO
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA DE CRÂNIO
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com protocolo direcionado para avaliação arterial intracraniana.{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com protocolo direcionado para avaliação venosa intracraniana.{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com protocolos direcionados para avaliação arterial e venosa intracraniana.{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise vascular:**

<!-- IF PHASE_ARTERIAL -->
As artérias intracranianas (carótidas internas, artérias cerebrais anterior, média e posterior, artéria basilar, artérias vertebrais e seus principais ramos) apresentam trajeto, calibre e permeabilidade preservados, sem evidências de estenoses, oclusões, aneurismas ou malformações arteriovenosas.

Ausência de áreas de enchimento vascular anômalo ou de vasos de neoformação.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
Os seios venosos durais (seio sagital superior, seio reto, seios transversos, seios sigmoides), veias corticais e profundas apresentam trajeto, calibre e permeabilidade preservados, sem evidências de trombose, estenoses, malformações venosas ou outras alterações significativas.

Ausência de áreas de enchimento venoso anômalo.
<!-- ELSE -->
**Artérias intracranianas:**
As artérias intracranianas (carótidas internas, artérias cerebrais anterior, média e posterior, artéria basilar, artérias vertebrais e seus principais ramos) apresentam trajeto, calibre e permeabilidade preservados, sem evidências de estenoses, oclusões, aneurismas ou malformações arteriovenosas.

Ausência de áreas de enchimento vascular anômalo ou de vasos de neoformação.

**Seios venosos e veias intracranianas:**
Os seios venosos durais (seio sagital superior, seio reto, seios transversos, seios sigmoides), veias corticais e profundas apresentam trajeto, calibre e permeabilidade preservados, sem evidências de trombose, estenoses, malformações venosas ou outras alterações significativas.

Ausência de áreas de enchimento venoso anômalo.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Angiotomografia arterial de crânio sem alterações vasculares significativas.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Angiotomografia venosa de crânio sem alterações vasculares significativas.
<!-- ELSE -->
**Impressão diagnóstica:**
Angiotomografia arterial e venosa de crânio sem alterações vasculares significativas.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
