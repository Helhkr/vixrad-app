---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DE ABDOME SUPERIOR
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
# ANGIOTOMOGRAFIA ARTERIAL DE ABDOME SUPERIOR
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA VENOSA DE ABDOME SUPERIOR
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA DE ABDOME SUPERIOR
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fase arterial. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fase venosa. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica após administração de meio de contraste iodado endovenoso, com fases arterial e venosa. Realizadas reconstruções multiplanares (MPR) e tridimensionais (MIP/VRT).{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise:**

<!-- IF PHASE_ARTERIAL -->
Aorta abdominal de trajeto, calibre e contornos preservados. Paredes sem placas de ateroma significativas. Ausência de aneurismas, dissecções ou trombos murais.

Tronco celíaco com origem anatômica e calibre conservados, dividindo-se em artéria hepática comum, artéria esplênica e artéria gástrica esquerda, todas pérvias.

Artéria mesentérica superior com origem e calibre preservados, com boa opacificação.

Artérias renais com origens e calibres habituais, sem sinais de estenoses significativas.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
Veia porta pérvia, de calibre preservado. Veias mesentérica superior e esplênica pérvias.

Veias hepáticas com drenagem habitual para a veia cava inferior.

Veia cava inferior pérvia, de calibre normal.
<!-- ELSE -->
**Aorta e ramos:**
Aorta abdominal de trajeto, calibre e contornos preservados. Paredes sem placas de ateroma significativas. Ausência de aneurismas, dissecções ou trombos murais.

Tronco celíaco com origem anatômica e calibre conservados, dividindo-se em artéria hepática comum, artéria esplênica e artéria gástrica esquerda, todas pérvias.

Artéria mesentérica superior com origem e calibre preservados, com boa opacificação.

Artérias renais com origens e calibres habituais, sem sinais de estenoses significativas.

**Sistema venoso:**
Veia porta pérvia, de calibre preservado. Veias mesentérica superior e esplênica pérvias.

Veias hepáticas com drenagem habitual para a veia cava inferior.

Veia cava inferior pérvia, de calibre normal.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Angiotomografia arterial de abdome superior dentro dos limites da normalidade. Aorta abdominal e ramos viscerais com calibres e permeabilidade preservados.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Angiotomografia venosa de abdome superior dentro dos limites da normalidade. Sistema venoso portal pérvio.
<!-- ELSE -->
**Impressão diagnóstica:**
Angiotomografia arterial e venosa de abdome superior dentro dos limites da normalidade. Aorta abdominal, ramos viscerais e sistema venoso portal com calibres e permeabilidade preservados.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->
