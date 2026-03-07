---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DE TÓRAX
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
# ANGIOTOMOGRAFIA ARTERIAL DE TÓRAX
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA VENOSA DE TÓRAX
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA DE TÓRAX
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica do tórax em fase arterial, após a administração de meio de contraste iodado endovenoso. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica antes e após a administração de meio de contraste iodado endovenoso, com ênfase na fase venosa. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica do tórax em fases arterial e venosa, após a administração de meio de contraste iodado endovenoso. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise:**

<!-- IF PHASE_ARTERIAL -->
Tronco da artéria pulmonar e ramos principais direito e esquerdo com opacificação preservada.

Ausência de falhas de enchimento sugestivas de tromboembolismo pulmonar agudo nos ramos principais, lobares e segmentares avaliáveis.

Coração com dimensões preservadas na avaliação qualitativa.

Ausência de derrame pericárdico.

Aorta torácica com calibres preservados.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
Veias torácicas principais (veia cava superior, veias braquiocefálicas, veia ázigos, veia hemiázigos e veias pulmonares) com trajeto, calibres e opacificação preservados. Ausência de trombose, compressão extrínseca ou anomalias congênitas identificadas.

Artérias torácicas com calibres e trajetos preservados, sem evidências de tromboembolismo ou outras alterações significativas.

Coração com dimensões preservadas na avaliação qualitativa.

Ausência de derrame pericárdico ou pleural.

Ausência de massas mediastinais ou linfonodomegalias significativas.
<!-- ELSE -->
**Artérias pulmonares:**
Tronco da artéria pulmonar e ramos principais direito e esquerdo com opacificação preservada.

Ausência de falhas de enchimento sugestivas de tromboembolismo pulmonar agudo nos ramos principais, lobares e segmentares avaliáveis.

**Veias torácicas:**
Veias torácicas principais (veia cava superior, veias braquiocefálicas, veia ázigos, veia hemiázigos e veias pulmonares) com trajeto, calibres e opacificação preservados. Ausência de trombose, compressão extrínseca ou anomalias congênitas identificadas.

**Estruturas mediastinais e cardíacas:**
Coração com dimensões preservadas na avaliação qualitativa.

Ausência de derrame pericárdico ou pleural.

Ausência de massas mediastinais ou linfonodomegalias significativas.

Aorta torácica com calibres preservados.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Sem evidências de tromboembolismo pulmonar agudo no território arterial pulmonar avaliável. Aorta torácica com calibres preservados.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Veias torácicas com calibres e permeabilidade preservados. Ausência de sinais de trombose venosa.
<!-- ELSE -->
**Impressão diagnóstica:**
Artérias pulmonares e veias torácicas com calibres e permeabilidade preservados. Ausência de sinais de tromboembolismo pulmonar agudo ou trombose venosa. Mediastino sem alterações significativas.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
