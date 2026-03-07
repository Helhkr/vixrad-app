---
exam_type: CT
display_name: ANGIOTOMOGRAFIA DAS CORONÁRIAS
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
# ANGIOTOMOGRAFIA DAS ARTÉRIAS CORONÁRIAS
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
# ANGIOTOMOGRAFIA DAS VEIAS CORONÁRIAS
<!-- ELSE -->
# ANGIOTOMOGRAFIA ARTERIAL E VENOSA CORONARIANA
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF PHASE_ARTERIAL -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica sincronizada ao eletrocardiograma (ECG-gated) após administração de meio de contraste iodado endovenoso, com protocolo direcionado para avaliação das artérias coronárias. Realizadas reconstruções multiplanares e curvas.{{ARTIFACT_SOURCE}}
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica sincronizada ao eletrocardiograma (ECG-gated) após administração de meio de contraste iodado endovenoso, com protocolo direcionado para avaliação das veias coronárias. Realizadas reconstruções multiplanares e curvas.{{ARTIFACT_SOURCE}}
<!-- ELSE -->
**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica sincronizada ao eletrocardiograma (ECG-gated) após administração de meio de contraste iodado endovenoso. Realizadas reconstruções multiplanares e curvas.{{ARTIFACT_SOURCE}}
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->
<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

<!-- IF PHASE_ARTERIAL -->
**Escore de Cálcio de Agatston =** 0 (Zero)

**Análise:**

Origens das artérias coronárias habituais nos seios de Valsalva correspondentes. Dominância coronariana direita (a artéria coronária direita dá origem à artéria descendente posterior).

Tronco da Coronária Esquerda (TCE) de calibre e trajeto conservados, isento de placas parietais ou estenoses.

Artéria Descendente Anterior (DA) de calibre e trajeto conservados, isenta de placas parietais ou estenoses. Ramos diagonais de aspecto habitual.

Artéria Circunflexa (CX) de calibre e trajeto conservados, isenta de placas parietais ou estenoses. Ramos marginais de aspecto habitual.

Artéria Coronária Direita (CD) de calibre e trajeto conservados, isenta de placas parietais ou estenoses.
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Análise:**

Seio coronário com calibre preservado e trajeto habitual, drenando para o átrio direito.

Veias coronárias (grande, anterior e pequena cardiac vein) com opacificação adequada e trajetos preservados.

Ausência de anomalias de drenagem venosa cardíaca.
<!-- ELSE -->
**Escore de Cálcio de Agatston =** 0 (Zero)

**Análise Arterial:**

Origens das artérias coronárias habituais nos seios de Valsalva correspondentes. Dominância coronariana direita (a artéria coronária direita dá origem à artéria descendente posterior).

Tronco da Coronária Esquerda (TCE) de calibre e trajeto conservados, isento de placas parietais ou estenoses.

Artéria Descendente Anterior (DA) de calibre e trajeto conservados, isenta de placas parietais ou estenoses. Ramos diagonais de aspecto habitual.

Artéria Circunflexa (CX) de calibre e trajeto conservados, isenta de placas parietais ou estenoses. Ramos marginais de aspecto habitual.

Artéria Coronária Direita (CD) de calibre e trajeto conservados, isenta de placas parietais ou estenoses.

**Análise Venosa:**

Seio coronário com calibre preservado e trajeto habitual, drenando para o átrio direito.

Veias coronárias com opacificação adequada e trajetos preservados.

Ausência de anomalias de drenagem venosa cardíaca.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

**Estruturas Cardíacas:**
Cavidades cardíacas com dimensões preservadas. Espessura miocárdica dentro dos limites da normalidade. Ausência de falhas de enchimento sugestivas de trombos intracavitários. 

Válvulas cardíacas sem calcificações grosseiras ou espessamentos significativos. Pericárdio fino e liso.

Aorta torácica e artéria pulmonar com calibres preservados. 

<!-- IF PHASE_ARTERIAL -->
**Impressão diagnóstica:**
Escore de Cálcio Zero.

Ausência de placas ateroscleróticas coronarianas calcificadas ou não calcificadas.

Não há evidência de estenose coronariana (CAD-RADS 0).
<!-- ELSE -->
<!-- IF PHASE_VENOSO -->
**Impressão diagnóstica:**
Angiografia venosa coronariana dentro dos limites da normalidade. Seio coronário e veias de drenagem cardíaca com calibres preservados.
<!-- ELSE -->
**Impressão diagnóstica:**
Angiocardiografia arterial e venosa coronariana dentro dos limites da normalidade.

Escore de Cálcio Zero. Ausência de placas ateroscleróticas coronarianas calcificadas ou não calcificadas. Não há evidência de estenose coronariana (CAD-RADS 0).

Seio coronário e veias de drenagem cardíaca com calibres preservados.
<!-- ENDIF PHASE_VENOSO -->
<!-- ENDIF PHASE_ARTERIAL -->

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->