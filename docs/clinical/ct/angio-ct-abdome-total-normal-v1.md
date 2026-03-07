---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DE ABDOME TOTAL
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
# ANGIOTOMOGRAFIA ARTERIAL DE ABDOME TOTAL
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA VENOSA DE ABDOME TOTAL
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA DE ABDOME TOTAL
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fase arterial. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fases portal e de equilíbrio. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fases arterial, portal e de equilíbrio. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise:**

<!-- IF PHASE_ARTERIAL -->
**Aorta abdominal e ramos:**
Aorta abdominal de trajeto, calibre e contornos preservados desde o hiato aórtico até a bifurcação. Paredes sem placas de ateroma significativas. Ausência de aneurismas, dissecções ou trombos murais.

Tronco celíaco com origem anatômica e calibre conservados, com ramos pérvios.

Artéria mesentérica superior com origem e calibre preservados, com boa opacificação.

Artérias renais com origens e calibres habituais, sem sinais de estenoses.

Artéria mesentérica inferior visualizada e pérvia.

Bifurcação aórtica com configuração habitual. Artérias ilíacas comuns, internas e externas com calibres e permeabilidade preservados.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Sistema venoso:**
Veia porta pérvia, de calibre preservado. Veias mesentérica superior e esplênica pérvias.

Veias hepáticas com drenagem habitual para a veia cava inferior.

Veia cava inferior pérvia, de calibre normal em toda sua extensão abdominal.

Veias ilíacas comuns, internas e externas pérvias.
<!-- ELSE -->
**Aorta abdominal e ramos:**
Aorta abdominal de trajeto, calibre e contornos preservados desde o hiato aórtico até a bifurcação. Paredes sem placas de ateroma significativas. Ausência de aneurismas, dissecções ou trombos murais.

Tronco celíaco com origem anatômica e calibre conservados, com ramos pérvios.

Artéria mesentérica superior com origem e calibre preservados, com boa opacificação.

Artérias renais com origens e calibres habituais, sem sinais de estenoses.

Artéria mesentérica inferior visualizada e pérvia.

Bifurcação aórtica com configuração habitual. Artérias ilíacas comuns, internas e externas com calibres e permeabilidade preservados.

**Sistema venoso:**
Veia porta pérvia, de calibre preservado. Veias mesentérica superior e esplênica pérvias.

Veias hepáticas com drenagem habitual para a veia cava inferior.

Veia cava inferior pérvia, de calibre normal em toda sua extensão abdominal.

Veias ilíacas comuns, internas e externas pérvias.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Arteriografia de abdome total dentro dos limites da normalidade. Aorta abdominal, ramos viscerais e vasos ilíacos com calibres e permeabilidade preservados.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Flebografia de abdome total dentro dos limites da normalidade. Sistema venoso portal, cava e ilíaco pérvios, com permeabilidade preservada.
<!-- ELSE -->
**Impressão diagnóstica:**
Arteriografia e flebografia de abdome total dentro dos limites da normalidade. Aorta abdominal, ramos viscerais e vasos ilíacos com calibres preservados. Sistema venoso portal e cava pérvios.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
