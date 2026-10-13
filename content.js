window.CONTENT = {
  levels: {
    nuevo: { name: "Principiante", sub: "menos de 3 meses entrenando", k: 0.8, gain: "1.5–3 kg" },
    medio: { name: "Intermedio", sub: "3 a 12 meses", k: 1, gain: "1–2 kg" },
    alto:  { name: "Avanzado", sub: "más de 1 año", k: 1.3, gain: "0.5–1 kg" },
  },
  goals: {
    fat: { name: "Perder grasa", desc: "Bajar grasa y medidas conservando el músculo. Déficit de calorías y más cardio.", sub: "déficit de calorías, más cardio", paces: [[10, "Suave (10 %)"], [15, "Moderado (15 %)"], [20, "Firme (20 %)"]], pace: 15 },
    recomp: { name: "Perder grasa y ganar músculo", desc: "Recomposición: bajar grasa y ganar fuerza y músculo a la vez. Ideal si empiezas o vuelves a entrenar.", sub: "recomposición: casi en mantenimiento", paces: [[5, "Casi mantenimiento (5 %)"], [10, "Déficit ligero (10 %)"], [15, "Déficit moderado (15 %)"]], pace: 10 },
    muscle: { name: "Ganar músculo", desc: "Subir de peso con control para ganar músculo y fuerza. Superávit moderado y poco cardio.", sub: "superávit moderado, menos cardio", paces: [[5, "Superávit suave (5 %)"], [10, "Superávit moderado (10 %)"], [15, "Superávit firme (15 %)"]], pace: 10 },
  },
  daysOptions: [[3, "3 días · cuerpo completo"], [4, "4 días · torso y pierna"], [5, "5 días · empuje, tirón, pierna y torso"], [6, "6 días · empuje, tirón y pierna ×2"]],
  diets: { omni: "Como de todo", veg: "Vegetariano (huevo y lácteos)" },

  phases: [
    { n: 1, name: "Base", weeks: [1, 4], rir: "3 → 2", steps: 8000, cardioAdd: 0, cardio: "Lun, Mar y Jue 20 · Vie 35 min", goal: "Aprender la rutina, encontrar tus cargas de trabajo y fijar horarios. Semana 4 es de descarga." },
    { n: 2, name: "Progresión", weeks: [5, 8], rir: "2 → 1", steps: 9000, cardioAdd: 5, cardio: "Lun, Mar y Jue 25 · Vie 40 min", goal: "Subir peso o repeticiones cada semana en los básicos. Semana 8 es de descarga." },
    { n: 3, name: "Intensificar", weeks: [9, 12], rir: "1–2 (última serie a 0–1)", steps: 10000, cardioAdd: 10, cardio: "Lun, Mar y Jue 30 · Vie 45 min", goal: "Mejores marcas en los ejercicios principales y, si te recuperas bien, intervalos en el cardio del viernes." },
    { n: 4, name: "Cierre", weeks: [13, 13], rir: "1–2", steps: 10000, cardioAdd: 10, cardio: "Lun, Mar y Jue 30 · Vie 45 min", goal: "Días 85–90: marcas finales, medidas, fotos y decidir la siguiente fase." },
  ],

  milestones: [
    { day: 14, t: "Primer ajuste", d: "Con 2 semanas de datos, revisa si la tendencia de peso va en rango y ajusta calorías si hace falta." },
    { day: 30, t: "Mes 1", pct: [1.4, 2.7], cm: [1, 3], d: "cintura −{cm} cm · subiste carga o repeticiones en la mayoría de ejercicios." },
    { day: 60, t: "Mes 2", pct: [3.4, 5.4], cm: [3, 5], d: "cintura −{cm} cm · fotos con cambio visible en abdomen y cintura." },
    { day: 90, t: "Día 90", pct: [4.7, 8], cm: [5, 8], d: "cintura −{cm} cm · fuerza igual o mayor. Son estimaciones: tu cuerpo marca el ritmo real." },
  ],

  weekFocus: {
    1: "Aprende el orden, anota cada serie. Termina cada serie con 3 repeticiones en reserva.",
    2: "Ajusta cargas: busca el peso con el que llegas al rango alto con buena técnica.",
    3: "Primera subida de peso en los básicos si llegaste al máximo del rango.",
    4: "DESCARGA: quita 1 serie a cada ejercicio y deja 3–4 repeticiones en reserva. Duerme y camina.",
    5: "Vuelves con más carga que en la semana 3. Sube peso donde completaste todas las series.",
    6: "Mantén la progresión. Primer chequeo de volumen: ¿algún músculo no se recupera?",
    7: "Semana pesada. Prioriza sueño y proteína.",
    8: "DESCARGA: quita 1 serie a cada ejercicio, mismo peso, 3 repeticiones en reserva.",
    9: "Añade 1 serie extra a hombro lateral, bíceps y pantorrilla.",
    10: "Mantén el volumen extra; busca marcas personales en los básicos.",
    11: "Semana más exigente del reto. No recortes sueño ni proteína.",
    12: "Última semana fuerte. Mismas cargas, mejor técnica y control.",
    13: "Días 85–90: marcas finales, fotos, medidas y revisión completa.",
  },

  habits: [
    { title: "Horarios (lunes a viernes)", body: `<ul>
      <li><strong>7:00</strong> Agua (500 ml) y creatina si la usas.</li>
      <li><strong>7:30</strong> Desayuno · <strong>10:30</strong> media mañana · <strong>14:00</strong> comida.</li>
      <li><strong>17:00</strong> Pre-entreno (60–90 min antes del gym).</li>
      <li><strong>18:00–20:00</strong> Entreno (calentamiento + pesas; el cardio va al final).</li>
      <li><strong>20:45</strong> Cena.</li>
      <li><strong>22:30</strong> Pantallas fuera, luz baja. <strong>23:00</strong> a dormir.</li></ul>` },
    { title: "Fin de semana (10:00–12:00)", body: `<p>Entrena sábado <em>o</em> domingo; el otro día descansa con una caminata de 45 min.</p><ul>
      <li>8:30 Come el pre-entreno (ligero, en lugar del desayuno completo).</li>
      <li>12:30 Comida fuerte como post-entreno.</li>
      <li>Fuera del entreno, el plan es igual de simple. No hay “día libre”: hay <strong>una comida flexible a la semana</strong>, planeada.</li></ul>` },
    { title: "Hambre", body: `<ul>
      <li>Primero toma agua o agua mineral con limón y espera 10 minutos.</li>
      <li>Verduras libres, pepino, jícama, gelatina sin azúcar o té verde no rompen el plan.</li>
      <li>Si el hambre es constante varios días, sube verdura y proteína antes de recortar más calorías.</li>
      <li>Hambre extrema + cansancio + mal rendimiento = señal de déficit demasiado grande. Usa la revisión semanal.</li></ul>` },
    { title: "Sueño (7–9 h)", body: `<p>Dormir poco empeora el hambre y hace que bajes más músculo y menos grasa con la misma dieta. En un estudio pequeño de 14 días (10 adultos), con 5.5 h de sueño frente a 8.5 h la pérdida de grasa fue 55 % menor y la de masa magra 60 % mayor.</p><ul><li>Hora fija de dormir y de levantarse, incluso en fin de semana.</li><li>Última comida 2 h antes de dormir; cuarto oscuro y fresco.</li><li>Cafeína máximo hasta las 15:00.</li></ul>` },
    { title: "Hidratación", body: `<ul><li><strong>2.5–3 L al día</strong>. Medio litro extra los días de entreno.</li><li>Una botella de 1 L: termínala antes de las 11:00, 16:00 y 21:00.</li><li>Café o té sin azúcar está bien. Evita refrescos, jugos y bebidas con calorías.</li></ul>` },
    { title: "Pasos y cardio", body: `<ul><li>Meta de pasos: 8,000 (semanas 1–4), 9,000 (5–8), 10,000 (9–13). Es una meta práctica, no un número mágico.</li><li><strong>Cardio en caminadora o elíptica, zona 2</strong>: ritmo en el que puedes hablar frases cortas (6–7 de 10), unos 115–135 latidos por minuto (orientativo).</li><li><strong>Cuándo:</strong> siempre <em>después</em> de las pesas. Lunes, martes y jueves, 20 min; viernes, el más largo (35 min). Los días de pierna no hay cardio para que tus piernas se recuperen.</li><li>El otro día del fin de semana: caminata de 45–60 min.</li></ul>` },
    { title: "Antojos", body: `<ul><li>Regla de los 10 minutos: toma agua, camina o lávate los dientes antes de decidir.</li><li>Si sigue, come una porción pequeña <em>planeada</em> (ej. 1 cuadro de chocolate amargo o fruta con yogurt).</li><li>No compensas con ayuno ni con más cardio. Sigues con la siguiente comida.</li></ul>` },
    { title: "Comer fuera", body: `<ul><li>Elige primero la proteína: tacos de bistec, pollo o pescado; caldos, pozole sin tostadas fritas; carne asada.</li><li>Una porción de arroz, frijoles o tortillas; sin refresco; salsa libre.</li><li>Evita lo empanizado, “con queso extra”, mayonesa y todo lo que dice “crujiente”.</li><li>Si sabes que saldrás, come ligero antes (no te saltes comidas) y conserva ~30 g de proteína en cada comida.</li></ul>` },
    { title: "Si te saltas un entreno", body: `<ul><li><strong>No se recupera</strong> duplicando después. Retomas con la siguiente sesión del calendario.</li><li>Versión mínima (20 min): 2 ejercicios básicos, 3 series cada uno. Cuenta como entreno.</li><li>Dos sesiones perdidas seguidas: haz la rutina “en casa” 2 días para no cortar el ritmo.</li><li>La meta es la constancia: 85 % de sesiones completadas ya es excelente.</li></ul>` },
    { title: "Si te sales de la dieta", body: `<p>Retoma en la siguiente comida, sin castigo. Una comida fuera del plan casi nunca afecta la tendencia semanal. Lo que cuenta es el promedio de 7 días.</p>` },
  ],

  dailyChecks: [
    
    { id: "sleep", label: "Dormí 7 h o más" },
  ],

  weightFAQ: `<p><strong>Tu peso sube y baja 0.5–2 kg de un día a otro sin que cambie tu grasa.</strong> Lo que mueve la báscula a corto plazo es agua: sal, carbohidratos (cada gramo de glucógeno guarda varios gramos de agua), cuántos alimentos hay en el estómago, el entrenamiento intenso y el sueño.</p>
  <ul><li>Pésate en ayunas, después de orinar, mismo sitio y misma ropa.</li><li>Mira el <strong>promedio de 7 días</strong>, no el número de hoy.</li><li>Pérdida real de grasa = promedio semanal que baja <em>y</em> cintura que baja <em>y</em> fuerza estable o mayor.</li><li>Si el peso sube el día después de entrenar piernas o de una comida salada, es agua.</li><li>Las fotos y la cintura detectan cambios que la báscula no ve (cuando ganas músculo y pierdes grasa a la vez).</li></ul>`,

  measureGuide: [
    { t: "Peso", d: "Diario, en ayunas. Se evalúa el promedio de 7 días." },
    { t: "Cintura", d: "1 vez por semana (domingo en ayunas). Cinta a la altura del ombligo, sin apretar, al final de una exhalación." },
    { t: "Fotos", d: "Días 1, 15, 30, 45, 60, 75 y 90. Mismo lugar, misma luz, misma hora, ropa igual, cámara a la altura del pecho. Frente, perfil y espalda, relajado." },
    { t: "Fuerza", d: "La app guarda tus series. Busca subir peso o repeticiones en los básicos." },
    { t: "Pasos, sueño y energía", d: "Marca en el chequeo diario. Se resume en la revisión semanal." },
  ],

  adjustRules: {
    fat: [
      { when: "Bajas más de 1 % del peso por semana", act: "Sube ≈ 150 kcal. Perder tan rápido puede costar músculo." },
      { when: "Bajas entre 0.25 % y 1 % por semana", act: "Perfecto. No cambies nada." },
      { when: "Estable 2 semanas seguidas y la cintura no baja", act: "Revisa adherencia. Si fue ≥ 85 %, primero +1,500 pasos al día; si sigue igual otra semana, −150 kcal." },
      { when: "Estable pero la cintura baja y la fuerza sube", act: "Recomposición funcionando: no cambies nada." },
      { when: "Subes 2 semanas seguidas sin explicación", act: "Revisa porciones y fines de semana; si todo está bien, −150 kcal." },
      { when: "Sueño < 6 h, energía baja, fuerza cayendo", act: "No recortes más: sube 150 kcal o haz una descarga antes." },
    ],
    recomp: [
      { when: "Bajas más de 0.5 % por semana", act: "Sube ≈ 150 kcal: para recomponer conviene ir más despacio." },
      { when: "Peso estable o baja hasta 0.4 % por semana, cintura baja o fuerza sube", act: "Recomposición funcionando: no cambies nada." },
      { when: "Peso, cintura y fuerza estancados 3 semanas", act: "Si la adherencia fue ≥ 85 %, −150 kcal y +1,000 pasos al día." },
      { when: "Subes más de 0.25 % por semana 2 semanas seguidas", act: "−100 a −150 kcal: te estás pasando del mantenimiento." },
      { when: "Sueño < 6 h, energía baja, fuerza cayendo", act: "Sube 150 kcal o haz una descarga antes." },
    ],
    muscle: [
      { when: "Subes más de 0.7 % por semana", act: "Baja ≈ 150 kcal: más peso que eso suele ser sobre todo grasa." },
      { when: "Subes entre 0.25 % y 0.5 % por semana", act: "Perfecto. No cambies nada." },
      { when: "Subes menos de 0.1 % durante 2 semanas", act: "Si la adherencia fue ≥ 85 %, +150 kcal (≈ 35 g de carbohidratos)." },
      { when: "La cintura sube más rápido que la fuerza", act: "Baja ≈ 150 kcal: el superávit es demasiado grande para tu nivel." },
      { when: "Fuerza cayendo con sueño bajo o fatiga", act: "No cambies calorías: duerme más y haz una descarga." },
    ],
  },
  adjustLimit: "Cambia una sola cosa a la vez, espera 2 semanas y nunca bajes de 1,800 kcal en día de entreno.",

  reviewQuestions: [
    { id: "adh", q: "¿Cuántos días de 7 seguiste el plan de comida?", min: 0, max: 7, def: 6 },
    { id: "ses", q: "¿Cuántos entrenos hiciste de 6?", min: 0, max: 6, def: 6 },
    { id: "slp", q: "¿Cuántos días dormiste 7 h o más?", min: 0, max: 7, def: 5 },
    { id: "eng", q: "Energía promedio (1 = agotado, 5 = excelente)", min: 1, max: 5, def: 3 },
    { id: "hun", q: "Hambre promedio (1 = ninguna, 5 = constante)", min: 1, max: 5, def: 3 },
    { id: "str", q: "¿Subiste peso o repeticiones en más de la mitad de los ejercicios principales?", yesno: true },
  ],


  blocksGuide: `<p><strong>Uniserie:</strong> un solo ejercicio. Haces una serie, descansas y repites (es una <em>vuelta</em>). Es donde subes más peso.</p>
  <p><strong>Biserie:</strong> dos ejercicios seguidos sin descanso entre ellos (A1 y A2). Al terminar A2 descansas y empieza la siguiente vuelta. Ahorra tiempo y sube el volumen.</p>
  <p><strong>Triserie:</strong> igual, con tres ejercicios (A1, A2 y A3).</p>
  <p>El descanso que ves en cada bloque es el que tomas <strong>al terminar la vuelta completa</strong>.</p>`,

  weightsGuide: `<p>Los pesos son <strong>estimaciones de partida</strong> calculadas con tu peso, tu sexo y tu nivel, y a propósito conservadoras. No conozco tu fuerza real.</p>
  <ul><li>Elige el peso con el que terminas la serie con <strong>1–2 repeticiones en reserva</strong> (podrías hacer 1–2 más).</li>
  <li>Si te sobran más de 3 repeticiones, sube. Si no llegas al mínimo del rango, baja.</li>
  <li>A partir de la segunda sesión la app sugiere tu peso según lo que registraste: si completaste todas las vueltas en el máximo del rango, te propone subir.</li>
  <li>“c/mano” = cada mancuerna. “stack” = lo que marca la máquina de placas. “total” = barra y discos juntos.</li></ul>`,

  absGuide: `<p><strong>Para marcar el abdomen necesitas dos cosas a la vez:</strong> músculo abdominal desarrollado (se entrena con carga y progresión) y poca grasa encima (se logra con déficit calórico sostenido).</p>
  <ul><li>Hacer abdominales <strong>no quema la grasa de la barriga</strong>. En un estudio aleatorizado de 6 semanas, entrenar abdomen 5 veces por semana mejoró la resistencia muscular pero no redujo grasa abdominal ni cintura.</li>
  <li>Por eso el plan combina: abdomen con carga 4 veces por semana (cable crunch con peso, elevaciones de piernas, rueda, plancha) + déficit moderado + pasos + dormir bien.</li>
  <li>Trata los abdominales como cualquier otro músculo: sube peso o repeticiones cada semana.</li>
  <li>Cuánta grasa necesitas perder para que se vean varía por persona (genética y dónde guardas grasa). Mide tu cintura cada semana: es mejor indicador que la báscula.</li></ul>
  <p>Lo más probable en 90 días es ver el abdomen claramente más definido al bajar la cintura varios centímetros; los cuadritos nítidos suelen requerir bastante menos grasa y más tiempo.</p>`,

  cardioKinds: {
    gym: [
      { id: "cam", name: "Caminadora", gif: "Walking_Treadmill", how: "Inclinación 6–10 %, 5.5–6.5 km/h, sin agarrarte de los pasamanos." },
      { id: "eli", name: "Elíptica", gif: "Elliptical_Trainer", how: "Resistencia 6–8, unas 120–140 zancadas por minuto, espalda recta." },
    ],
    home: [
      { id: "cam", name: "Caminata rápida", gif: "Walking_Treadmill", how: "Paso rápido, con pendiente o escaleras, sin correr." },
      { id: "run", name: "Trote suave", gif: "Jogging_Treadmill", how: "Trote ligero en el que puedas hablar frases cortas." },
    ],
  },
  cardioGuide: `<p><strong>Objetivo:</strong> gastar calorías extra sin fatigar tus piernas para el siguiente entreno. Por eso la base es cardio suave y constante (zona 2).</p>
  <ul><li><strong>Caminadora:</strong> inclinación 6–10 %, velocidad 5.5–6.5 km/h, sin agarrarte de los pasamanos.</li>
  <li><strong>Elíptica:</strong> resistencia 6–8, unas 120–140 zancadas por minuto, espalda recta.</li>
  <li><strong>Cómo saber que va bien:</strong> puedes hablar frases cortas pero no cantar. Si no puedes hablar, baja el ritmo.</li>
  <li><strong>Calentamiento:</strong> los primeros 3–5 minutos más suaves.</li>
  <li><strong>Intervalos (opcional, desde la semana 5, solo el viernes):</strong> 5 min suaves, luego 8 rondas de 30 s fuertes (8 de 10) + 90 s suaves, y 5 min suaves. Si tus piernas no se recuperan para el siguiente entreno, vuelve a zona 2.</li><li><strong>Por qué después de las pesas:</strong> así llegas con toda tu fuerza al entreno. Un meta-análisis de 43 estudios encontró que sumar cardio no frena la hipertrofia ni la fuerza máxima.</li></ul>
  <p>El cardio ayuda, pero lo que más pesa para bajar grasa es el déficit de calorías. No lo uses para “compensar” una comida.</p>`,

  foodRules: `<ul>
    <li><strong>Proteína se pesa cruda</strong>; arroz, papa y frijol se pesan cocidos.</li>
    <li>Cocina con aceite en aerosol (2–3 segundos) o a la plancha.</li>
    <li>Salsas caseras, sal moderada, especias libres.</li>
    <li>Evita refrescos, jugos, fritos, pan dulce y postres industriales.</li>
    <li>Alcohol: lo mejor es evitarlo; si lo tomas, máximo 1–2 bebidas y no en la semana de descarga.</li>
    <li>Día de descanso: omite el pre-entreno y conserva el snack de proteína.</li>
    <li>Verduras libres: nopales, calabacita, espinaca, champiñones, chayote, pimiento, apio, jitomate, cebolla, pepino.</li></ul>`,

  hydrationTips: `<ul><li>2.5–3 L al día, 500 ml extra los días de entreno.</li><li>Agua mineral con limón, té verde y gelatina sin azúcar sirven para el hambre.</li><li>Una pizca de sal en el agua si sudas mucho.</li></ul>`,

  supplements: `<p><strong>Creatina monohidratada</strong>, 3–5 g al día (cualquier hora, todos los días) es el suplemento con más evidencia de seguridad y eficacia para fuerza y masa magra. La tomabas en tu plan anterior y puedes continuarla. Omega 3, magnesio, multivitamínico y vitamina C son opcionales: no hay evidencia de que quemen grasa.</p><p>La proteína en polvo es solo comodidad; si cubres tus gramos con comida, no la necesitas.</p>`,

  sources: [
    { id: "issnProt", v: "resumen verificado", t: "ISSN Position Stand: protein and exercise (Jäger et al., 2017)", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5477153/", why: "Proteína: 1.4–2.0 g/kg para construir músculo; más alta en déficit." },
    { id: "issnDiet", v: "resumen verificado", t: "ISSN Position Stand: diets and body composition (Aragon et al., 2017)", u: "https://pubmed.ncbi.nlm.nih.gov/28630601/", why: "Déficit para perder grasa, 2.3–3.1 g/kg de masa magra en déficit, y ninguna proporción de macros es superior." },
    { id: "helms14", v: "resumen verificado", t: "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation (Helms et al., 2014)", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4033492/", why: "Pérdida de 0.5–1 % del peso por semana; el momento y la frecuencia de comidas influyen poco." },
    { id: "helms15", v: "resumen verificado", t: "Recommendations for natural bodybuilding contest preparation: resistance and cardiovascular training (Helms et al., 2015)", u: "https://pubmed.ncbi.nlm.nih.gov/24998610/", why: "Músculos 2 veces por semana o más, la mayoría de repeticiones en 6–12 al 70–80 % del máximo." },
    { id: "garthe", v: "resumen verificado", t: "Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes (Garthe et al., Int J Sport Nutr Exerc Metab, 2011)", u: "", why: "0.7 % del peso por semana conservó mejor la masa magra y la fuerza que 1.4 % (24 atletas)." },
    { id: "freq16", v: "resumen verificado", t: "Effects of resistance training frequency on measures of muscle hypertrophy (Schoenfeld et al., Sports Med, 2016)", u: "https://pubmed.ncbi.nlm.nih.gov/27102172/", why: "Entrenar un músculo 2 o más veces por semana superó a 1 vez." },
    { id: "freq19", v: "resumen verificado", t: "How many times per week should a muscle be trained? (Schoenfeld, Grgic & Krieger, J Sports Sci, 2019)", u: "", why: "Con las series semanales igualadas, la frecuencia pesa poco: por eso se reparte el volumen para que cada sesión sea llevadera." },
    { id: "vol", v: "resumen verificado", t: "Dose-response relationship between weekly resistance training volume and increases in muscle mass (Schoenfeld, Ogborn & Krieger, J Sports Sci, 2016)", u: "", why: "Más series semanales por músculo se asocian con más crecimiento, con evidencia clara hasta ~10 series." },
    { id: "load", v: "resumen verificado", t: "Strength and hypertrophy adaptations between low- vs high-load resistance training (Schoenfeld et al., J Strength Cond Res, 2017)", u: "https://pubmed.ncbi.nlm.nih.gov/28834797/", why: "Cargas ligeras llevadas al fallo también hacen crecer el músculo: por eso el aislamiento va en 12–15 repeticiones." },
    { id: "rest", v: "resumen verificado", t: "Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men (Schoenfeld et al., J Strength Cond Res, 2016)", u: "https://doi.org/10.1519/JSC.0000000000001272", why: "3 min de descanso dio más fuerza y más grosor muscular que 1 min (estudio pequeño de 8 semanas)." },
    { id: "triceps", v: "resumen verificado", t: "Triceps brachii hypertrophy with overhead vs pushdown extensions (Maeo et al., 2022)", u: "", why: "La extensión con el brazo arriba de la cabeza hizo crecer más la cabeza larga (21 personas sin entrenamiento, 12 semanas)." },
    { id: "concurrent", v: "resumen verificado", t: "Compatibility of concurrent aerobic and strength training for skeletal muscle size and function (Schumann et al., Sports Med, 2022)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9474354/", why: "Sumar cardio no frena la hipertrofia ni la fuerza máxima; puede atenuar la potencia." },
    { id: "abs", v: "resumen verificado", t: "Electromyographic comparison of a variety of abdominal exercises to the traditional crunch (University of Wisconsin)", u: "https://minds.wisc.edu/items/13f23340-bc92-4049-9c47-6fcc60df9852", why: "Los estudios de EMG favorecen la elevación de piernas colgado; los resultados con el rodillo son mixtos. EMG no es lo mismo que crecimiento." },
    { id: "spot", v: "resumen verificado", t: "The effect of abdominal exercise on abdominal fat (Vispute et al., J Strength Cond Res, 2011)", u: "https://doi.org/10.1519/JSC.0b013e3181fb4a46", why: "Entrenar abdomen no reduce la grasa abdominal por sí solo (24 personas, 6 semanas)." },
    { id: "protMeal", v: "resumen secundario", t: "How much protein can the body use in a single meal for muscle-building? (Schoenfeld & Aragon, JISSN, 2018)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5828430/", why: "El tope de 20–25 g por comida es demasiado bajo; ~0.4 g/kg por comida en 4 o más comidas (cifra tomada de un resumen: verifícala)." },
    { id: "acsm", v: "resumen secundario", t: "Nutrition and Athletic Performance (Thomas, Erdman & Burke; Academy of Nutrition and Dietetics, Dietitians of Canada y ACSM, 2016)", u: "https://pubmed.ncbi.nlm.nih.gov/26917108/", why: "Proteína 1.2–2.0 g/kg, grasas 20–35 % de la energía, carbohidratos según la actividad (cifras tomadas de un resumen: verifícalas)." },
    { id: "creatine", v: "resumen verificado", t: "ISSN Position Stand: Safety and efficacy of creatine supplementation (Kreider et al., 2017)", u: "https://doi.org/10.1186/s12970-017-0173-z", why: "Creatina: eficacia y seguridad en personas sanas." },
    { id: "sleep", v: "resumen verificado", t: "Insufficient sleep undermines dietary efforts to reduce adiposity (Nedeltcheva et al., Ann Intern Med, 2010)", u: "", why: "Dormir poco reduce la grasa perdida y aumenta la masa magra perdida (10 adultos, 14 días)." },
    { id: "recomp", v: "resumen secundario", t: "Body recomposition: can trained individuals build muscle and lose fat at the same time? (Barakat et al., Strength Cond J, 2020)", u: "https://doi.org/10.1519/SSC.0000000000000584", why: "Recomposición en personas entrenadas: posible, más lenta que perder grasa o ganar músculo por separado." },
    { id: "iraki", v: "resumen verificado", t: "Nutrition recommendations for bodybuilders in the off-season: a narrative review (Iraki et al., Sports, 2019)", u: "https://pubmed.ncbi.nlm.nih.gov/31247944/", why: "Superávit de ~10–20 % y subida de 0.25–0.5 % del peso por semana en principiantes e intermedios; más conservador en avanzados." },
    { id: "slater", v: "resumen verificado", t: "Is an energy surplus required to maximize skeletal muscle hypertrophy associated with resistance training? (Slater et al., Front Nutr, 2019)", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6710320/", why: "El superávit necesario para la hipertrofia máxima no se conoce con certeza." },
    { id: "morton", v: "resumen verificado", t: "Protein supplementation and resistance training-induced gains in muscle mass and strength: systematic review, meta-analysis and meta-regression (Morton et al., Br J Sports Med, 2018)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5867436/", why: "Más proteína no dio ganancias extra de masa magra por encima de ≈ 1.6 g/kg/día en promedio." },
    { id: "zourdos", v: "resumen verificado", t: "Novel resistance training-specific rating of perceived exertion scale measuring repetitions in reserve (Zourdos et al., J Strength Cond Res, 2016)", u: "", why: "Escala de esfuerzo basada en repeticiones en reserva; la experiencia afecta la precisión." },
    { id: "bell", v: "resumen verificado", t: "Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach (Bell et al., Sports Med Open, 2023)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10511399/", why: "Definición consensuada de descarga como periodo de menor estrés de entrenamiento (no verifiqué los detalles de cuándo hacerla)." },
    { id: "sexdiff", v: "resumen secundario", t: "Sex differences in resistance training adaptations (Roberts et al., 2020; Refalo et al., 2025)", u: "", why: "Ganancias relativas de masa muscular similares entre hombres y mujeres; los hombres ganan más en términos absolutos (cifras de resúmenes de terceros)." },
    { id: "fedb", v: "licencia indicada en el repositorio", t: "Free Exercise DB (Ollie Jennings / yuhonas), Unlicense, dominio público", u: "https://github.com/yuhonas/free-exercise-db", why: "Fotos de inicio y fin de cada ejercicio; la app las convierte en animaciones." },
  ],

  why: {
    train: [
      { t: "Cómo elegimos los ejercicios", d: "Solo entran ejercicios que cumplen cuatro criterios: (1) los compuestos y más cargables van primero porque son donde más progresas; (2) cada músculo tiene al menos un ejercicio principal y uno de aislamiento; (3) el aislamiento prefiere posiciones con el músculo estirado (tríceps sobre la cabeza, curl inclinado, pulldown con brazos rectos); (4) se descartan los de poco rendimiento o que castigan las articulaciones. Por eso, por ejemplo, los hombres no hacen abductor y las mujeres tienen una vuelta extra de glúteo. En casa no hay equipo: se usan variantes de flexiones, remo invertido, sentadilla búlgara y puente de glúteo, que son las opciones más efectivas sin material.", s: ["triceps"] },
      { t: "Cada músculo, 2 veces por semana", d: "Empuje, Tirón y Pierna se repiten (A y B). Entrenar un músculo 2 o más veces superó a 1 vez; con las series igualadas la frecuencia pesa poco, así que se repartió el volumen en 2 días para que cada sesión sea llevadera.", s: ["freq16", "freq19", "helms15"] },
      { t: "10–16 series directas por semana", d: "Más series semanales se asocian con más crecimiento, con evidencia clara hasta ~10 y más débil después. Para un nivel principiante o intermedio, 10–16 deja margen para progresar sin quemarte.", s: ["vol"] },
      { t: "6–12 repeticiones en lo principal; 12–15 en aislamiento", d: "La mayoría de repeticiones va entre 6 y 12 al 70–80 % del máximo. Las cargas ligeras llevadas cerca del fallo también hacen crecer, por eso el aislamiento va más alto y es más amable con las articulaciones.", s: ["helms15", "load"] },
      { t: "Descansos: 2 min en lo principal, 45–90 s en aislamiento", d: "Un estudio en hombres entrenados vio más fuerza y más grosor muscular con 3 min que con 1 min. Con 2 horas de gimnasio, 2 min en los básicos es el compromiso; las biseries ahorran tiempo en lo demás.", s: ["rest"] },
      { t: "Ejercicios que estiran el músculo", d: "Tríceps con el brazo arriba de la cabeza, curl inclinado y pulldown con brazos rectos trabajan el músculo alargado. En el tríceps, 12 semanas de extensión sobre la cabeza hicieron crecer más la cabeza larga que el pushdown (estudio con personas sin entrenamiento).", s: ["triceps"] },
      { t: "Abdomen con carga, 4 días por semana", d: "Elevación de piernas colgado, crunch en polea con peso, rodillo y planchas. Los estudios de EMG favorecen la elevación de piernas colgado, pero EMG no mide crecimiento. Y entrenar abdomen no quema la grasa de esa zona: por eso van el déficit y los pasos.", s: ["abs", "spot"] },
      { t: "Cardio después de las pesas, no en días de pierna", d: "Sumar cardio no frena la hipertrofia ni la fuerza máxima en 43 estudios; puede atenuar la potencia. Aun así, el cardio va al final del entreno y las piernas descansan de él.", s: ["concurrent"] },
      { t: "Esfuerzo medido en repeticiones en reserva (RIR)", d: "Terminar cada serie dejando 1–3 repeticiones “en el tanque” se puede estimar con una escala validada de esfuerzo percibido; los principiantes calculan peor, por eso al inicio se busca el peso con tu criterio y se ajusta en la siguiente sesión.", s: ["zourdos"] },
      { t: "Progresión doble y semanas de descarga", d: "Subes peso cuando completas el máximo del rango en todas las vueltas. Un consenso de expertos define la descarga como un periodo de menor carga para reducir la fatiga y preparar el siguiente bloque; las semanas 4 y 8 son una práctica habitual, no un resultado de estudios.", s: ["bell"] },
      { t: "División según tus días y tu nivel", d: "Con 3 días haces cuerpo completo; con 4, torso y pierna; con 5, empuje, tirón, pierna, torso y pierna; con 6, empuje, tirón y pierna dos veces. Siempre cada músculo ≥ 2 veces por semana. Si eres principiante, el volumen baja una serie por bloque; si ya llevas más de un año, sube una en el ejercicio principal. Si tu objetivo es ganar músculo, el cardio se reduce y se añade una serie a los accesorios.", s: ["freq16", "helms15"] },
      { t: "Mujeres y hombres", d: "Los resúmenes que encontré indican que las ganancias relativas de masa muscular son similares entre sexos y que las mujeres pueden mejorar más en fuerza relativa de tren superior; los hombres ganan más en términos absolutos. Por eso el plan es el mismo y solo cambian los pesos de partida.", s: ["sexdiff"] },
    ],
    diet: [
      { only: ["fat", "recomp"], t: "Calorías: {{GOAL_KCAL}}", d: "Con tus datos, tu mantenimiento estimado es ≈ {{MAINT}} kcal; día de entreno ≈ {{KCAL_T}} y día de descanso ≈ {{KCAL_R}}. Se busca perder 0.5–1 % del peso por semana como máximo; en un estudio con atletas, 0.7 % por semana conservó mejor la masa magra y la fuerza que 1.4 %. Con recomposición, lo esperable es ≈ {{RATE}} por semana.", s: ["helms14", "garthe", "issnDiet"] },
      { only: ["fat", "recomp"], t: "Proteína: ≈ {{PROT}} g al día", d: "Son 2.2 g por kg de tu peso (≈ {{PROT_FFM}} g por kg de masa magra si tu grasa corporal fuera ≈ {{BF}} %; es una estimación, no una medición). El rango para entrenados en déficit es 2.3–3.1 g/kg de masa magra; para construir músculo en general, 1.4–2.0 g/kg.", s: ["issnProt", "issnDiet"] },
      { only: ["muscle"], t: "Calorías: superávit de ≈ {{PCT}} %", d: "Con tus datos, tu mantenimiento estimado es ≈ {{MAINT}} kcal; día de entrenamiento ≈ {{KCAL_T}} y de descanso ≈ {{KCAL_R}}. Para principiantes e intermedios se sugiere un superávit de ~10–20 % y subir 0.25–0.5 % del peso por semana (≈ {{RATE}}); más conservador si ya tienes mucha experiencia. Ojo: el superávit óptimo no se conoce con certeza, y los principiantes pueden ganar músculo con poco o ningún superávit.", s: ["iraki", "slater"] },
      { only: ["muscle"], t: "Proteína: ≈ {{PROT}} g al día", d: "Son 1.8 g por kg de tu peso. Un meta-análisis encontró que más proteína no aportó ganancias extra de masa magra por encima de ≈ 1.6 g/kg/día en promedio; 1.8 deja margen. El rango habitual para construir músculo es 1.4–2.0 g/kg.", s: ["morton", "issnProt"] },
      { only: ["muscle"], t: "Grasas ≈ {{FAT}} g y carbohidratos ≈ {{CARB}} g", d: "Las grasas cubren ≈ {{FAT_PCT}} % de las calorías y el resto son carbohidratos, que alimentan tus entrenos. Con superávit, la mayor parte del plus va a carbohidratos.", s: ["acsm", "issnDiet"] },
      { only: ["muscle"], t: "Qué esperar", d: "Con tu nivel ({{LEVEL}}) puedes ganar ≈ {{GAIN}} de músculo en 90 días. Parte de lo que subas en la báscula será grasa; si la cintura sube más rápido que la fuerza, baja las calorías.", s: ["iraki"] },
      { t: "5 comidas con 25–50 g de proteína", d: "Reparte la proteína en 4 o más comidas con ≈ 0.4 g/kg cada una (≈ {{PROT_MEAL}} g para ti). Es una recomendación de una revisión; el total diario importa más que el reparto exacto. Frecuencia y horarios influyen poco en la pérdida de grasa: se eligieron por adherencia.", s: ["protMeal", "helms14"] },
      { t: "Grasas ≈ {{FAT}} g y carbohidratos ≈ {{CARB}} g", d: "Grasas ≈ {{FAT_PCT}} % de las calorías (rango habitual 20–35 %). El resto son carbohidratos, más abundantes en el pre-entreno. Ninguna proporción de macros es superior para la composición corporal: se eligió la que te deja entrenar bien.", s: ["acsm", "issnDiet"] },
      { t: "Creatina 3–5 g, sueño 7–9 h, pasos", d: "La creatina es el suplemento con mejor respaldo para fuerza y masa magra. Dormir poco hace perder menos grasa y más músculo con la misma dieta. Los pasos son una meta práctica, sin cifra mágica.", s: ["creatine", "sleep"] },
      { only: ["recomp"], t: "Recomposición: expectativas", d: "Es posible en personas entrenadas, pero más lenta que perder grasa o ganar músculo por separado. Con tu nivel ({{LEVEL}}), puedes ganar ≈ {{GAIN}} de músculo en 90 días si cumples la proteína y progresas en carga.", s: ["recomp"] },
    ],
  },

  foodGuide: {
    semaforo: [
      { lvl: "verde", title: "Come a diario", note: "La base de tu semana.", groups: [
        { g: "Proteínas magras", items: ["Pechuga de pollo o pavo", "Pescado blanco (tilapia, huachinango) y atún en agua", "Huevo y claras", "Res magra: bistec, molida 90/10", "Yogurt griego natural sin azúcar, requesón, queso panela", "Frijol, lentejas, garbanzo, soya texturizada, tofu"] },
        { g: "Carbohidratos", items: ["Arroz, papa, camote", "Avena, tortilla de maíz, pan integral", "Fruta entera: plátano, manzana, fresa, papaya, naranja"] },
        { g: "Grasas buenas (con medida)", items: ["Aguacate", "Cacahuate, nueces, almendras", "Aceite de oliva, una cucharadita"] },
        { g: "Verduras (libres)", items: ["Nopales, calabacita, espinaca, brócoli, jitomate, pepino, chayote, champiñones, jícama, apio"] },
      ] },
      { lvl: "amarillo", title: "Con medida", note: "Disfrútalos, pero pesa o cuenta la porción.", groups: [
        { g: "Con medida", items: ["Queso: panela, oaxaca, manchego", "Pan blanco, bolillo, tortilla de harina", "Pasta, pizza, hamburguesa sencilla", "Granola y cereal de caja", "Chocolate amargo", "Licuados y jugos naturales", "Salsas comerciales y aderezos", "Crema de cacahuate, mermelada, miel", "Embutidos magros como jamón de pavo"] },
      ] },
      { lvl: "rojo", title: "Evita o deja para ocasiones", note: "Aportan muchas calorías y casi nada de saciedad o nutrientes.", groups: [
        { g: "Mejor evitar", items: ["Refrescos, jugos de caja, bebidas energéticas", "Pan dulce, galletas, donas, pastelitos", "Frituras y empanizados", "Botanas y papitas", "Chorizo, salchicha, tocino", "Alcohol (ver la página de qué evitar)"] },
      ] },
    ],
    evitar: [
      { t: "Refrescos, jugos de caja y bebidas con azúcar", w: "Son calorías líquidas: no sacian y se suman sin que lo notes.", s: "Agua, agua mineral con limón, té o café sin azúcar." },
      { t: "Pan dulce, galletas y pastelitos", w: "Mezclan azúcar y grasa y es muy fácil comer de más.", s: "Fruta con yogurt griego, avena con canela, un cuadro de chocolate amargo." },
      { t: "Frituras y empanizados", w: "El aceite de la fritura multiplica las calorías sin sumar proteína.", s: "A la plancha, al horno o en freidora de aire." },
      { t: "Botanas y papitas", w: "Se comen sin medida y no llenan.", s: "Jícama o pepino con limón y chile, palomitas naturales." },
      { t: "Chorizo, salchicha y tocino", w: "Mucha grasa saturada y sodio por poca proteína.", s: "Pechuga, jamón de pavo, bistec magro." },
      { t: "Mayonesa, crema, aderezos y mantequilla en exceso", w: "Son calorías escondidas en pequeñas cantidades.", s: "Mostaza, yogurt griego, aguacate, salsa casera." },
      { t: "Alcohol", w: "Aporta calorías sin saciar y empeora el sueño y la recuperación. Si lo tomas, que sea poco y fuera del día de entreno.", s: "Agua mineral con limón; si bebes, 1–2 copas y con comida." },
      { t: "Productos “light” o “fit” ultraprocesados", w: "La etiqueta no garantiza que sea buena opción: revisa porciones, azúcares añadidos y proteína.", s: "Alimentos simples y fáciles de pesar." },
      { t: "Saltarte comidas o ayunar para “compensar”", w: "Suele terminar en hambre excesiva y en comer de más después.", s: "Retoma en la siguiente comida, con tu porción normal." },
      { t: "Comer frente a la pantalla o a mordidas", w: "Pierdes la cuenta de cuánto comiste.", s: "Sirve tu porción en un plato y come sentado." },
    ],
    swaps: [
      ["Refresco", "Agua mineral con limón"],
      ["Jugo de caja", "Fruta entera"],
      ["Pan dulce", "Avena con fruta y canela"],
      ["Tortilla de harina", "Tortilla de maíz"],
      ["Papitas", "Jícama con chile y limón"],
      ["Crema o mayonesa", "Yogurt griego natural o mostaza"],
      ["Carne frita o empanizada", "Pollo o res a la plancha"],
      ["Chorizo", "Pechuga o jamón de pavo"],
      ["Café con azúcar", "Café con canela y endulzante"],
      ["Cereal azucarado", "Avena con yogurt griego"],
      ["Helado", "Yogurt griego con fresas congeladas"],
      ["Arroz doble", "Arroz normal y el doble de verduras"],
    ],
    ideas: [
      { t: "Desayuno", items: ["Chilaquiles al horno con pollo", "Hotcakes de avena y claras", "Huevos a la mexicana con frijoles", "Molletes integrales con panela y pico de gallo", "Avena overnight con yogurt griego y fruta", "Burrito de claras con espinaca", "Licuado de proteína con plátano y avena"] },
      { t: "Comida", items: ["Pollo a la plancha con arroz y nopales", "Bistec con frijoles y ensalada", "Pescado al ajillo con papa", "Caldo de pollo con verduras (sin tostadas fritas)", "Picadillo de res con calabacita", "Tinga de pollo en tostadas horneadas", "Pozole de pollo con rábano y lechuga"] },
      { t: "Pre-entreno (60–90 min antes)", items: ["Plátano con crema de cacahuate", "Avena con yogurt griego", "Tostadas con jamón de pavo y fruta", "Quesadilla de panela en tortilla de maíz"] },
      { t: "Después de entrenar", items: ["Pollo con arroz", "Tacos de pescado o bistec", "Yogurt griego con fruta y avena", "Licuado de proteína con plátano"] },
      { t: "Cena", items: ["Omelette con panela y verduras", "Tacos de pollo con verduras", "Sopa de verduras con pollo", "Ensalada grande con atún", "Quesadilla de panela con nopales", "Pescado a la plancha con ensalada"] },
      { t: "Snacks con proteína", items: ["Yogurt griego con fresas", "Huevos cocidos con jícama", "Atún en tostadas", "Requesón con fruta", "Rollitos de jamón de pavo con panela", "Garbanzos asados"] },
    ],
    fuera: [
      { t: "Comida corrida", d: "Pide el guisado sin empanizar, frijoles y ensalada. Pasa la sopa de pasta y el arroz extra, y toma agua natural o de fruta sin azúcar." },
      { t: "Taquería", d: "3 a 5 tacos de bistec, pollo o pescado, con salsa y cebolla. Evita refresco, tacos dorados y las tortillas extra." },
      { t: "Antojitos", d: "Esquites sin exceso de mayonesa, un tamal, quesadilla sin freír o tostada de ceviche. Deja para ocasiones los tlacoyos y las gorditas fritas." },
      { t: "Restaurante", d: "Elige proteína a la parrilla o al horno con verduras y una porción de carbohidrato. Pide aderezos aparte." },
      { t: "Comida rápida", d: "Hamburguesa sencilla o pollo a la parrilla, sin papas ni refresco. Evita los combos." },
      { t: "Pizza", d: "Dos rebanadas de masa delgada y una ensalada." },
      { t: "Sushi", d: "Sashimi o rollos sin tempura ni queso crema, y edamames." },
      { t: "Fiestas y reuniones", d: "Come primero la proteína, usa plato pequeño, haz una sola ronda y brinda con agua mineral." },
      { t: "Una comida flexible a la semana", d: "Planéala de antemano y disfrútala sin culpa. Una comida fuera del plan casi nunca cambia la tendencia semanal." },
    ],
    etiquetas: `<ol><li>Mira la <strong>porción</strong>: todo lo demás se refiere a ella, no al paquete completo.</li><li>Revisa las <strong>kcal por porción</strong> y multiplícalas por lo que realmente vas a comer.</li><li>Busca <strong>azúcares añadidos</strong>: cuanto menos, mejor.</li><li>Compara la <strong>proteína</strong>: como regla práctica, buena opción es la que da 10 g o más por cada 100 kcal.</li><li>Lee la lista de ingredientes: entre menos y más reconocibles, mejor.</li></ol>`,
    manos: `<p>Cuando no tengas báscula, usa tu mano como guía por comida:</p><ul><li><strong>Proteína:</strong> una palma (≈ 100–120 g de carne o pescado ya cocidos).</li><li><strong>Carbohidratos:</strong> un puño (≈ media taza de arroz, papa o frijoles).</li><li><strong>Grasas:</strong> un pulgar (aguacate, nueces, aceite).</li><li><strong>Verduras:</strong> dos puños, sin límite real.</li></ul><p>Es menos exacto que pesar, pero sirve para comer fuera.</p>`,
    prep: `<p><strong>Un domingo de preparación ahorra toda la semana.</strong></p><ul><li>Cocina 2 proteínas (pollo y carne molida o bistec), 2 carbohidratos (arroz y papa o frijoles) y verduras al vapor o asadas.</li><li>Pesa la proteína <strong>cruda</strong> antes de cocinarla y reparte en recipientes.</li><li>Guarda 3–4 días en el refrigerador y congela el resto.</li><li>Prepara salsas caseras y deja cortadas verduras y fruta.</li><li>Ahorro: compra cortes grandes de pollo y res, aprovecha ofertas de temporada y usa huevo, frijol, lentejas, avena y arroz como base.</li></ul>`,
    alt: `<ul><li><strong>Sin carne:</strong> huevo, lácteos, soya texturizada, tofu, lentejas, garbanzo y frijol combinados con arroz o tortilla. Revisa que llegues a tu proteína del día.</li><li><strong>Sin lácteos:</strong> bebida de soya sin azúcar, tofu o claras en lugar de yogurt y panela.</li><li><strong>Sin lactosa:</strong> el yogurt griego suele tolerarse mejor porque tiene menos lactosa; pruébalo en poca cantidad.</li><li><strong>Sin gluten:</strong> arroz, maíz, papa, camote y avena certificada sin gluten.</li><li><strong>Alergia al huevo:</strong> usa pollo, atún, yogurt o tofu.</li></ul><p>Si tienes una condición médica, alergias graves o estás embarazada o en lactancia, consulta a un profesional antes de seguir un déficit de calorías.</p>`,
  },

  honesty: `<p>Los números de calorías y macros son <strong>estimaciones con rango</strong>, no valores exactos. Tu mantenimiento real se descubre con 2–3 semanas de datos de peso.</p><p>La recomposición (perder grasa y ganar músculo a la vez) funciona, pero la ganancia de músculo depende de tu nivel: con el tuyo ({{LEVEL}}) es ≈ {{GAIN}} en 90 días si comes la proteína y progresas en carga, pero no esperes ganar mucho músculo y perder mucha grasa al mismo ritmo. La transformación visible viene sobre todo de bajar cintura y conservar o ganar fuerza.</p><p>Esto no sustituye a un médico ni a un nutriólogo. Si tienes mareos, dolor en el pecho o lesiones, detente y consulta.</p>`,
};
