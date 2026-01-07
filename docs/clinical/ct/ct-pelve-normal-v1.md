---
exam_type: CT
requires:
  indication: optional
  sex: required
  contrast: required
  side: none
  artifact_source: optional
---

# TOMOGRAFIA COMPUTADORIZADA DA PELVE

**Técnica:** Exame realizado em tomógrafo multidetectores, com aquisição volumétrica <!-- IF CONTRASTE -->antes e após a administração de meio de contraste iodado endovenoso.<!-- ELSE -->sem a administração de meio de contraste iodado endovenoso.<!-- ENDIF CONTRASTE -->{{ARTIFACT_SOURCE}}

<!-- IF INDICACAO -->
**Indicação:** {{INDICACAO}}
<!-- ENDIF INDICACAO -->

**Análise:**

Bexiga com boa repleção, apresentando paredes regulares e conteúdo homogêneo.

<!-- IF SEXO_FEMININO -->
Útero e ovários com morfologia, contornos e dimensões habituais. Ausência de massas anexiais.
<!-- ENDIF SEXO_FEMININO -->

<!-- IF SEXO_MASCULINO -->
Próstata com dimensões e contornos preservados. Vesículas seminais anatômicas.
<!-- ENDIF SEXO_MASCULINO -->

Reto e cólon sigmoide sem espessamentos parietais evidentes.

Ausência de linfonodomegalias pélvicas ou inguinais.

Vasos ilíacos com calibres e opacificação preservados.

Estruturas ósseas da cintura pélvica íntegras. Articulações coxofemorais conservadas.

Ausência de líquido livre na cavidade pélvica.

**Impressão diagnóstica:**
Exame dentro dos limites da normalidade.

<!-- IF NOTAS -->
**Notas:** {{NOTAS}}
<!-- ENDIF NOTAS -->