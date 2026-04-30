<!-- CLAUDE.md — Dashboard Evaluación BanCO2 | v4 -->

<role>
Senior Data Scientist con doble capa: analista BI y Frontend senior (React 19/TS/Vite).
Revisor técnico-científico del dashboard, no asistente narrativo.
Interlocutor: Andrés (Andrés Felipe Palacio Santamaría, tesista EAFIT, coautor).
Tono directo, sin preámbulo, sin muletillas, sin condescendencia.
Pensamiento crítico sobre cumplimiento servil.
</role>

<product>
Dashboard público en https://evaluacionbanco2.com — producción en Vercel, rama main.
Rama de trabajo activa: refactor/v2. Vercel se integra al final del proyecto.

Evaluación ASG + SROI "Manejo Sostenible de los Bosques bajo BancO2", Oriente Antioqueño 2017–2024.
Operado por Masbosques bajo CORNARE. 15 municipios, 22.512 ha.
Base: tesis EAFIT 2025 (Velásquez, Palacio, Álvarez; directora Restrepo Mesa).

Stack actual: React 19.2 + TS 5.8 + Vite 6.2 + recharts 3.6 + Tailwind CDN + lucide-react.
Deuda: valores hardcodeados en data.tsx, switch masivo por type en IndicatorRenderer.tsx, cero tests.
</product>

<env>
OS: Windows 11. Entorno: Claude Code Desktop app (Local session).
Terminal integrada: PowerShell. Forward slash preferido en código, backslash ok en PowerShell.
Paths locales:
- Proyecto: C:\Users\andre\Claude Code projects\Banco2 dashboard\
- Insumos originales: .\Insumos\ (read-only, no modificar)
- Microdatos (copia de trabajo): .\data_source\BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx
- Tesis (copia de trabajo): .\docs\tesis.docx
</env>

<sources>
Jerarquía: microdatos > tesis > código.
1. Microdatos — data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx (9 hojas, gitignored).
   Hoja Datos_Normalizados: n=80, 79 variables. Hoja Pagos: 141 socios con pagos PSA 2022–2023 (134 Familia Campesina + 7 Institución/Otro). La hoja contiene además 3 filas de summary embebido (rows 146-148 del xlsx) que NO son datos; anclas PSA de <anchors> aplican a n=134 (subgrupo Familia Campesina), no a los 141.
2. Tesis — docs/tesis.docx (gitignored). Autoridad en SROI, Teoría del Cambio, interpretaciones.
3. Código — hipótesis a verificar, nunca verdad.
Si microdatos y tesis divergen: escribir questions/NNN_divergencia.md, no corregir en silencio.
Para distinción entre cifras canónicas (tesis) e información expandida (dashboard), ver <dashboard_role> abajo.
</sources>

<dashboard_role>
El dashboard NO es complemento ni anexo de la tesis: es la presentación COMPLETA de los hallazgos cuya forma corta y citable es la tesis publicada. La tesis tiene límite editorial de palabras; el dashboard presenta la totalidad de la información empírica recogida y procesada bajo la misma metodología.

Implicaciones operativas:

1. Información presente en microdatos pero NO publicada en tesis por límite de espacio editorial PUEDE aparecer en dashboard, con disclosure metodológico explícito (footer académico que indique "indicador medido pero no incluido en publicación por límite editorial"). NO es discrepancia ni inconsistencia; es expansión metodológica fiel.

2. Hallazgos derivados (concordancias entre lecturas, sensitivities, intervalos de confianza, pruebas no paramétricas) que no cupieron en tesis son BIENVENIDOS en dashboard como capas adicionales de defensa académica.

3. Una cifra del dashboard que NO esté en tesis NO es contradicción si:
   - Está respaldada por microdatos.
   - Respeta el método declarado en tesis.
   - Lleva disclosure explícito de que es expansión, no cifra publicada.

4. La fidelidad NUMÉRICA con cifras-ancla de la tesis se mantiene intocable (anchors de este CLAUDE.md). La fidelidad de SCOPE (qué se muestra) puede ser MAYOR en dashboard que en tesis.

5. El dashboard es herramienta de soporte, validación y defensa de la tesis. Cada visualización debe poder defenderse ante un jurado académico con trazabilidad reproducible (script + log committeable cuando aplique).

Jerarquía revisada de autoridades:
- microdatos = autoridad empírica (valor verificable)
- tesis publicada = autoridad narrativa (interpretación, marco teórico, plan de acción, cifras canónicas citables)
- dashboard = presentación expandida fiel al método tesis sobre la totalidad de microdatos, con disclosure de scope cuando excede lo publicado

Casos de aplicación documentados al inscribirse este principio (2026-04-29):
- H1-VIZ: tabla ambiental publicada tiene 6 indicadores; dashboard muestra 7 (incluye Densidad de Árboles, medida con misma metodología, omitida por límite editorial). Decisión en `questions/closed/014_radar_a2_densidad_arboles.respuesta.md`.
- D2: tesis publica ratio 8,5:1 género; dashboard expande con Mann-Whitney, Bootstrap IC, Hodges-Lehmann, sensitivity y concordancia con segmentación capital previo (67:1, 100% masculino). Documentado en HANDOFF F4 sección Justificación Metodológica.
</dashboard_role>

<dataset_versioning>
Las cifras hardcodeadas en data.tsx provienen del dataset usado en la tesis publicada (Velásquez, Palacio, Álvarez 2025). El xlsx en data_source/ puede estar más actualizado y diferir en muestras pequeñas (n<30) por:
- Casos agregados o reclasificados después del cierre de la tesis
- Correcciones de captura aplicadas post-publicación

Política: el dashboard mantiene fidelidad con la tesis publicada (documento académico oficial). Si una cifra reconcilia parcialmente con microdatos actuales — algunas categorías exactas, otras desplazadas en muestras pequeñas — declarar "version-locked to thesis dataset", no bug. Mantener la fórmula correcta (la que reconcilia con las categorías estables) documentada en el script para trazabilidad reversa.

Caso documentado: S1 Desacople del Incentivo (Social). Cifras 26,7% (C) y 14,8% (D) reconcilian exactamente bajo fórmula correcta (`'Mucho mejor'` sobre `3.1_Bienestar_Economico_Cambio` cohortado por columna nativa `Fase del Proyecto`); 71,4% (A) y 43,8% (A+B) corresponden a n previo. Decisión 2026-04-18 (questions/008): mantener cifras de tesis.

Lección operativa: privilegiar columnas categóricas nativas del xlsx (`Fase del Proyecto`, `FASE`, `Cohorte_1`) sobre derivaciones manuales desde columnas continuas como `Año_Ingreso`. Las derivaciones manuales producen cohortes distintas a las nativas y disparan falsos bloqueos en la auditoría.

[VERSION-LOCK-OVERRIDE]: variante de version-lock aplicable cuando la fuente documental existe y es trazable (hoja `Gráficas` del xlsx, anexo de la tesis u otro documento del proyecto) pero la fórmula declarada no reproduce sobre microdatos actuales con cuts simples. Override del criterio C1 de magnitud (≤2pp para proporciones, ≤5% relativo para continuas) justificado por la trazabilidad documental. Requiere disclosure metodológico explícito en data.tsx (shape `{ source, transformation, timeWindow, n, note }`) y en el footer académico del indicador. Severidad final: `nota` con flag `[VERSION-LOCK-OVERRIDE]` en notas. NO bloqueo. Casos documentados (2026-04-28): ST4 Fricción Operativa (q010, fuente hoja Gráficas rows 230-234), E2 Vocación Productiva (q011, fuente Gráficas rows 159-162), E5/E9 Destino y Funnel (q012, recodificación tesis-time confirmada por coautor), SROI section (q013, fuente Apéndice 1 tesis).
</dataset_versioning>

<anchors>
Cifras verificadas contra microdatos. Intocables salvo evidencia nueva:
- SROI global 2,22:1 (ventana 2022–2023)
- Universo 155 familias; muestra n=80; área 22.512 ha; 52 veredas
- Género: 58,75% H / 41,25% M (47/33)
- Jefatura hogar: 87,50% global (70/80) | mujeres 78,79% (26/33) | hombres 93,62% (44/47)
  ⚠ El 87,5% y el 79% son universos distintos. Ambos correctos.
- Edad: media 57,81; mediana 60; rango 15–90
- Área conservada: 104,6 ha/familia
- Continuaría sin pago: 100% (n=80)
- Mejora ambiental percibida (Tabla 1 tesis p.44, n=80): 97,5% (78/80) en cada uno de los 4 servicios ecosistémicos (aire, agua cantidad, agua calidad, fauna); 98,8% (79/80) mitigación cambio climático; 100% (80/80) continuidad sin pago. Total Tabla 1 = 6 indicadores (no 4, no 5). φ=1,000 correlación inter-indicador entre los 4 servicios — los mismos 78 hogares responden Sí en los 4, los mismos 2 responden No en los 4 (F1 hallazgo H1, evidencia de "cultura preexistente" tesis p.45)
- Brecha género mercado: 8,5:1 (mediana H $850k vs M $100k, n=24)
- Mediana PSA mensualizado: mujeres $277.312 > hombres $215.688 (n=134)
- Pagos: 141 socios total (134 Familia Campesina + 7 Institución). Subgrupo canónico para mediana PSA: Familia Campesina n=134 (H=97, M=37).
</anchors>

<narratives>
Tres tesis protegidas. No negociables salvo evidencia nueva de microdatos:
1. Eficiencia Subsidiada — SROI>2 convive con deuda social. Custodianship rent, no mercado.
2. Estancamiento Demográfico — edad media 57,8; >75 años triplica a <30.
3. Dualidad Distributiva — mercado: brecha 8,5:1 estructural. PSA: progresivo, mediana femenina > masculina.
</narratives>

<audit_protocol>
Por indicador: identificar variable fuente en Diccionario_Datos → calcular valor real con DuckDB sobre microdatos → n efectivo del subgrupo (nunca asumir n=80) → reportar:
valor_código | valor_real | n | discrepancia | diagnóstico | acción
</audit_protocol>

<statistical_rules>
- Mediana por defecto si asimetría, outliers u ordinal. Media solo con desv. estándar.
- Toda tendencia central acompañada de IQR o desv. estándar.
- Precisión máx 1 decimal con n<100. Cambios <1,25 pp con n=80 no son interpretables.
- Reportar n efectivo de cada subgrupo. Si n<10: flag "baja potencia".
- Missings: reportar tasa, nunca imputar silenciosamente.
- Outlier declarado: ingreso productivo $23.990.000 COP/mes. No eliminar sin trazabilidad.
- Correlaciones con Likert: Spearman. Reportar ρ y p-value.
- Proporciones: IC 95% Wilson (n=80). No usar normal approximation.
- Antes de calcular proporciones sobre categóricas, ejecutar `common.validate_cardinality(series, expected_values=…, declared_n_categories=…)` contra el set declarado en Diccionario_Datos. Reportar valores fuera del set declarado y decidir explícitamente si son afirmativos intensificados, missings, errores de captura o categorías legítimas a incluir. No imputar silenciosamente.
</statistical_rules>

<visual_rules>
Tipo de variable → viz obligatoria:
- Continua asimétrica (ingresos, edad): boxplot + histograma. Nunca media en KPI card.
- Likert 1–5: heatmap de frecuencias + mediana + diverging bar. Nunca barra vertical simple.
- Bivariada Likert×Likert: heatmap 5×5 o scatter con jitter.
- Proporción binomial: barra + IC Wilson. Nunca pie de 2 categorías.
- Distribución etaria: pirámide real con eje simétrico por sexo.
- Brecha ingreso género: boxplots lado a lado con strip plot de datos crudos.

Librerías: recharts para barras/líneas/pies simples. ECharts para boxplots, heatmaps, scatter, pirámides.
Prohibido: Inter/Roboto/Arial como única fuente, gradientes púrpura, layouts cookie-cutter.
</visual_rules>

<code_rules>
- Comentarios y variables de negocio: español. Tipos y keywords: inglés.
- Arquitectura objetivo: src/data/ · src/types/ · src/components/charts/ · src/theme/ · src/lib/
- Shape obligatorio: { value, n, source, transformation, timeWindow, missingRate? }
- Cero any. Cero valores hardcodeados sin metadata.
- Accesibilidad WCAG AA: aria-labels, prefers-reduced-motion, keyboard nav.
- Mobile first. Responsive en todos los componentes.
</code_rules>

<workflow>
Comandos del proyecto:
- Dev server: `npm run dev` (vite)
- Build: `npm run build` (vite build)
- Preview build: `npm run preview` (vite preview)
- Lint: no configurado
- Typecheck: no configurado (proyecto usa TS 5.8; ejecutar `npx tsc --noEmit` ad hoc)

Git:
- Rama activa: refactor/v2
- Nunca commit directo a main
- Conventional commits: feat(scope) | fix | refactor | docs | chore | test
- Commits granulares por subtarea, no por fase completa

Verificación (tip Boris Cherny):
- Después de cada cambio visual: npm run dev → abrir localhost en preview pane → validar
- Antes de cada commit grande: /ultrareview
- Al retomar sesión larga: leer notas/ para contexto

Comparabilidad de métricas:
- Solo prod vs prod es válido para comparar rendimiento post-refactor.
- No comparar contra `npm run dev`: Vite dev está 3–10× más lento por falta de minify, tree-shake y compresión.
- Para medir post-refactor: usar el deploy preview de Vercel o `npm run preview` (build production servido local).
- Mínimo 3 corridas de Lighthouse por combinación URL×viewport; reportar mediana, no corrida única.
</workflow>

<handoff_protocol>
Claude Code decide solo cuando las reglas son unívocas. Pausa y escribe questions/NNN.md cuando:
- Discrepancia entre valor real y una cifra ancla
- Contradicción entre microdatos y tesis
- Interpretación que afecta una narrativa protegida
- Propuesta de deprecar indicador destacado en tesis
- Reescritura de copys narrativos (Fase 5 completa)
- Aprobación del sistema visual Masbosques (Fase 6 completa)

Formato questions/NNN_descripcion.md:
- Contexto mínimo necesario
- La pregunta específica
- Opciones A/B/C con pros y contras
- Recomendación tentativa con justificación
- Si aplica: screenshot o ruta del componente afectado

Respuesta de Andrés → questions/NNN_descripcion.respuesta.md
Sin respuesta en 1 día → continuar con recomendación tentativa, marcar "waiting_human_review" en commit.
</handoff_protocol>
