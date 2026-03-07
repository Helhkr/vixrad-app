---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DO MEMBRO INFERIOR
requires:
  indication: optional
  sex: none
  contrast: fixed
  side: required
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
# ANGIOTOMOGRAFIA ARTERIAL DO MEMBRO INFERIOR {{LADO}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA VENOSA DO MEMBRO INFERIOR {{LADO}}
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA DO MEMBRO INFERIOR {{LADO}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica direcionada ao membro inferior {{LADO}} após administração de meio de contraste iodado endovenoso, com fase arterial. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica direcionada ao membro inferior {{LADO}} após administração de meio de contraste iodado endovenoso, com fase venosa. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica direcionada ao membro inferior {{LADO}} após administração de meio de contraste iodado endovenoso, com fases arterial e venosa. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise:**

<!-- IF PHASE_ARTERIAL -->
O eixo ilíaco (artérias ilíaca comum e externa) do lado avaliado apresenta trajeto, calibres e opacificação preservados, isento de estenoses, aneurismas ou sinais de dissecção.

Artérias femorais (comum, superficial e profunda) e artéria poplítea pérvias, com contornos regulares e fluxo mantido. Ausência de placas de ateroma ou calcificações parietais significativas.

Tronco tibioperoneal e artérias infrapatelares (tibiais anterior, posterior e fibular) com opacificação satisfatória e calibre preservado até a extremidade distal.

Ausência de circulação colateral evidente ou fístulas arteriovenosas.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
Veias ilíacas comuns, internas e externas do lado avaliado com trajeto e calibres preservados, pérvias e sem trombose.

Veias femorais (comum, superficial e profunda) e veias poplíteas com opacificação adequada e trajetos habituais.

Veias tibiais e fibulares com permeabilidade preservada.

Ausência de trombose venosa profunda ou compressão extrínseca.
<!-- ELSE -->
**Artérias:**
O eixo ilíaco (artérias ilíaca comum e externa) do lado avaliado apresenta trajeto, calibres e opacificação preservados, isento de estenoses, aneurismas ou sinais de dissecção.

Artérias femorais (comum, superficial e profunda) e artéria poplítea pérvias, com contornos regulares e fluxo mantido. Ausência de placas de ateroma ou calcificações parietais significativas.

Tronco tibioperoneal e artérias infrapatelares (tibiais anterior, posterior e fibular) com opacificação satisfatória e calibre preservado até a extremidade distal.

**Veias:**
Veias ilíacas comuns, internas e externas do lado avaliado com trajeto e calibres preservados, pérvias e sem trombose.

Veias femorais (comum, superficial e profunda) e veias poplíteas com opacificação adequada e trajetos habituais.

Veias tibiais e fibulares com permeabilidade preservada.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Arteriografia do membro inferior {{LADO}} dentro dos limites da normalidade. Sistema arterial pérvio, sem estenoses hemodinamicamente significativas.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Flebografia do membro inferior {{LADO}} dentro dos limites da normalidade. Sistema venoso pérvio, sem sinais de trombose.
<!-- ELSE -->
**Impressão diagnóstica:**
Arteriografia e flebografia do membro inferior {{LADO}} dentro dos limites da normalidade. Sistemas arterial e venoso pérvios e com permeabilidade preservada.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->