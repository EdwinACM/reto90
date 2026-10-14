window.CONTENT = {
  levels: {
    nuevo: { name: "Principiante", sub: "estás empezando o vuelves después de mucho tiempo", k: 0.8, gain: "1.5–3 kg" },
    medio: { name: "Intermedio", sub: "ya conoces los ejercicios básicos y entrenas con cierta regularidad", k: 1, gain: "1–2 kg" },
    alto:  { name: "Avanzado", sub: "entrenas con constancia desde hace mucho y dominas la técnica", k: 1.3, gain: "0.5–1 kg" },
  },
  goals: {
    fat: { name: "Perder grasa", desc: "Bajar grasa y medidas conservando el músculo. Déficit de calorías y más cardio.", sub: "déficit de calorías, más cardio", paces: [[10, "Suave (10 %)"], [15, "Moderado (15 %)"], [20, "Firme (20 %)"]], pace: 15 },
    recomp: { name: "Perder grasa y ganar músculo", desc: "Recomposición: bajar grasa y ganar fuerza y músculo a la vez. Ideal si empiezas o vuelves a entrenar.", sub: "recomposición: casi en mantenimiento", paces: [[5, "Casi mantenimiento (5 %)"], [10, "Déficit ligero (10 %)"], [15, "Déficit moderado (15 %)"]], pace: 10 },
    muscle: { name: "Ganar músculo", desc: "Subir de peso con control para ganar músculo y fuerza. Superávit moderado y poco cardio.", sub: "superávit moderado, menos cardio", paces: [[5, "Superávit suave (5 %)"], [10, "Superávit moderado (10 %)"], [15, "Superávit firme (15 %)"]], pace: 10 },
  },
  daysOptions: [[3, "3 días: cuerpo completo"], [4, "4 días: torso y pierna"], [5, "5 días: empuje, tirón, pierna y torso"], [6, "6 días: empuje, tirón y pierna ×2"]],
  diets: { omni: "Como de todo", veg: "Vegetariano (huevo y lácteos)" },

  phases: [
    { n: 1, name: "Base", weeks: [1, 4], rir: "3 → 2", steps: 8000, cardioAdd: 0, cardio: "20 min al terminar las pesas y 35 min en la sesión larga", goal: "Aprendes la rutina, encuentras los pesos con los que trabajas bien y fijas tus horarios. La semana 4 es de descarga." },
    { n: 2, name: "Progresión", weeks: [5, 8], rir: "2 → 1", steps: 9000, cardioAdd: 5, cardio: "25 min al terminar las pesas y 40 min en la sesión larga", goal: "Subes peso o repeticiones cada semana en los ejercicios principales. La semana 8 es de descarga." },
    { n: 3, name: "Intensificar", weeks: [9, 12], rir: "1–2 (última serie a 0–1)", steps: 10000, cardioAdd: 10, cardio: "30 min al terminar las pesas y 45 min en la sesión larga", goal: "Buscas tus mejores marcas en los ejercicios principales. Si te recuperas bien, haces intervalos en el cardio del viernes." },
    { n: 4, name: "Cierre", weeks: [13, 13], rir: "1–2", steps: 10000, cardioAdd: 10, cardio: "30 min al terminar las pesas y 45 min en la sesión larga", goal: "Semana 13: tus marcas finales, tus medidas y decidir qué sigue." },
  ],

  milestones: [
    { day: 14, t: "Primer ajuste", d: "Ya tienes dos semanas de datos. Mira si tu peso baja al ritmo esperado y, si no, ajusta las calorías." },
    { day: 30, t: "Primeros resultados", pct: [1.4, 2.7], cm: [1, 3], d: "cintura −{cm} cm. Subes peso o repeticiones en casi todos los ejercicios." },
    { day: 60, t: "Cambio visible", pct: [3.4, 5.4], cm: [3, 5], d: "cintura −{cm} cm. El cambio ya se nota en el abdomen y la cintura." },
    { day: 90, t: "Balance de la etapa", pct: [4.7, 8], cm: [5, 8], d: "cintura −{cm} cm y fuerza igual o mayor. Son cálculos aproximados: cada cuerpo avanza a su ritmo." },
  ],

  weekFocus: {
    1: "Aprende el orden de los ejercicios y anota cada serie. Termina todas con 3 repeticiones en reserva.",
    2: "Ajusta tus pesos: busca el que te deja llegar al máximo del rango con buena técnica.",
    3: "Si llegaste al máximo del rango en los ejercicios principales, sube un poco de peso.",
    4: "DESCARGA: haz una serie menos en cada ejercicio y deja 3 o 4 repeticiones en reserva. Duerme bien y camina.",
    5: "Vuelves con más peso que en la semana 3. Súbelo donde completaste todas las series.",
    6: "Sigue subiendo. Fíjate si algún músculo no se recupera entre sesiones.",
    7: "Es una semana pesada. Cuida el sueño y la proteína.",
    8: "DESCARGA: una serie menos en cada ejercicio, el mismo peso y 3 repeticiones en reserva.",
    9: "Agrega una serie extra a hombro lateral, bíceps y pantorrilla.",
    10: "Mantén esa serie extra y busca tus mejores marcas en los ejercicios principales.",
    11: "Es la semana más exigente. No recortes sueño ni proteína.",
    12: "Última semana fuerte. Mismos pesos, mejor técnica y más control.",
    13: "Semana 13: marcas finales, medidas y revisión completa.",
  },

  help: [
    { q: "¿Cómo registro mi entrenamiento?", a: "Abre la sesión del día y entra a un bloque. Escribe los kilos y las repeticiones (si los dejas vacíos se usan los sugeridos) y toca el círculo de la vuelta. El descanso empieza solo." },
    { q: "¿Qué es una vuelta, una uniserie o una biserie?", a: "Una vuelta es hacer una vez todos los ejercicios del bloque. En una uniserie hay un ejercicio, en una biserie dos seguidos sin descanso entre ellos, y en una triserie tres. Descansas al terminar la vuelta." },
    { q: "¿Cuánto peso uso?", a: "El primer día la app propone un peso de prueba. Elige uno con el que te sobren de 1 a 3 repeticiones: si te sobran más, súbelo; si no llegas al mínimo, bájalo. Desde la segunda sesión se ajusta con lo que registraste." },
    { q: "¿Qué significa “al fallo”?", a: "Es seguir hasta que ya no puedas hacer otra repetición con buena técnica. La app lo pide en la última vuelta de los ejercicios de aislamiento y de máquina. Con barra libre se deja 1 o 2 repeticiones en reserva para cuidar la espalda y las articulaciones." },
    { q: "¿Cómo cambio un ejercicio?", a: "Toca el ejercicio dentro del bloque y elige “Cambiar”. Verás opciones para el mismo músculo que puedes hacer con tu equipo. Si algo te duele, toca “Me duele este ejercicio” y lo reemplazamos por uno más seguro." },
    { q: "¿Puedo entrenar sin gimnasio?", a: "Sí. En Entreno elige Gimnasio, Mancuernas o Sin equipo y el plan se adapta. Puedes cambiar de modalidad cuando quieras." },
    { q: "¿Cómo cambio mi nivel o empiezo de nuevo?", a: "En Ajustes, “Nivel” lo cambia al instante. “Volver a comenzar” te deja empezar un plan nuevo, repetir el cuestionario o borrar todo." },
    { q: "¿Cómo paso mis datos a otro teléfono?", a: "Entra con tu usuario y tu contraseña en el teléfono nuevo y pide autorización. Cuando la apruebes desde el teléfono anterior, tus datos pasan solos. Las fotos no se mueven: se quedan en el teléfono donde las tomaste." },
    { q: "¿Por qué mi peso sube y baja?", a: "Es normal. De un día a otro cambia entre 0.5 y 2 kg por el agua, la sal y lo que comiste. Mira el promedio de 7 días y no el número de hoy." },
    { q: "¿Cómo instalo la app?", a: "En Progreso, Mis datos, la sección “Instalar la app” te explica los pasos para tu teléfono. Instalada se abre a pantalla completa y funciona sin internet." },
    { q: "¿Cómo activo los avisos?", a: "En Ajustes, Notificaciones. Elige qué avisos quieres y a qué hora. En iPhone primero instala la app en la pantalla de inicio." },
  ],
  privacy: [
    { t: "Cuenta y datos", d: "Para usar la app necesitas una cuenta. Tu plan, tus registros, tus comidas y tus medidas se guardan en la nube, ligados a tu usuario, y nadie más puede leerlos." },
    { t: "Un solo dispositivo", d: "Tu cuenta funciona en un dispositivo a la vez. Para pasarla a otro, el nuevo pide autorización y tú la apruebas desde el anterior (o el administrador). Si alguien más sabe tu contraseña, no puede entrar sin ese permiso." },
    { t: "Qué ve el administrador", d: "El administrador revisa los dispositivos y puede bloquear o borrar cuentas. Por la forma en que se guardan los datos, también podría consultarlos. Los usa solo para mantener copias de seguridad." },
    { t: "Tu contraseña", d: "Nunca se guarda tal cual: solo queda una huella que no se puede deshacer. Al crearla se revisa que no esté en listas de contraseñas filtradas, sin enviarla completa." },
    { t: "Lo que no hacemos", d: "No hay publicidad, no vendemos datos y no te seguimos. Tu información no se comparte con nadie, salvo que tú la exportes o la envíes." },
    { t: "Notificaciones", d: "Son opcionales. Para enviarlas se guarda un identificador de tu dispositivo, las horas que elegiste, tu zona horaria y qué avisos activaste. También se revisa si ya entrenaste, te pesaste o llegaste a tu meta de agua, para no avisarte de lo que ya hiciste. Puedes apagarlas cuando quieras y se borran al cerrar sesión." },
    { t: "Fotos de progreso", d: "Son opcionales y nunca se suben. Se quedan solo en este dispositivo y se borran si cierras sesión." },
    { t: "Permisos", d: "La app pide permiso para enviar notificaciones solo si activas esa opción, y para usar la cámara o tus fotos solo cuando eliges una. El bloqueo con huella o Face ID es opcional y se queda en tu dispositivo." },
    { t: "Copias y códigos", d: "El archivo de copia y el código de transferencia contienen tus datos. Compártelos solo con quien confíes." },
    { t: "Cómo borrar todo", d: "En Ajustes, Cuenta, “Eliminar mi cuenta” se borran tu usuario y tus datos. Cerrar sesión solo borra lo que hay en este dispositivo." },
    { t: "Aviso de salud", d: "Las calorías, los pesos y los planes son cálculos aproximados y no sustituyen a un médico ni a un nutriólogo. Si tienes alguna condición de salud, consulta antes de empezar y detente si sientes dolor o mareo." },
  ],
  habits: [
    { title: "Un día de entreno", body: `<ul>
      <li><strong>Al despertar:</strong> medio litro de agua, y creatina si la usas.</li>
      <li><strong>Mañana y mediodía:</strong> desayuno, media mañana y comida, con proteína en cada una.</li>
      <li><strong>De 60 a 90 minutos antes de entrenar:</strong> algo ligero y bajo en grasa.</li>
      <li><strong>Entreno:</strong> calentamiento, pesas y, al final, el cardio si toca.</li>
      <li><strong>Después de entrenar:</strong> una cena o comida fuerte con proteína.</li>
      <li><strong>Antes de dormir:</strong> sin pantallas, luz baja y de 7 a 9 horas de sueño.</li></ul>` },
    { title: "Si entrenas por la mañana", body: `<p>Come algo ligero antes de entrenar en lugar de un desayuno completo, y deja la comida fuerte para después. Los días sin pesas descansa con una caminata de 45 minutos.</p><ul><li>No hay día libre: hay <strong>una comida flexible a la semana</strong>, planeada de antemano.</li></ul>` },
    { title: "Hambre", body: `<ul>
      <li>Toma agua o agua mineral con limón y espera 10 minutos.</li>
      <li>Puedes comer sin límite verduras, pepino, jícama, gelatina sin azúcar o té verde.</li>
      <li>Si el hambre dura varios días, come más verdura y proteína antes de recortar calorías.</li>
      <li>Mucha hambre, cansancio y bajo rendimiento juntos significan que el déficit es demasiado grande. Haz la revisión semanal.</li></ul>` },
    { title: "Sueño", body: `<p>Dormir poco aumenta el hambre y hace que pierdas más músculo y menos grasa con la misma dieta. Apunta a dormir de 7 a 9 horas.</p><ul><li>Acuéstate y levántate a la misma hora, también en fin de semana.</li><li>Haz tu última comida 2 horas antes de dormir y duerme en un cuarto oscuro y fresco.</li><li>Toma cafeína solo hasta las 15:00.</li></ul>` },
    { title: "Agua", body: `<ul><li>Toma entre 2.5 y 3 litros al día, y medio litro más los días de entreno.</li><li>Con una botella de 1 litro, termínala antes de las 11:00, las 16:00 y las 21:00.</li><li>El café o el té sin azúcar están bien. Evita refrescos, jugos y bebidas con calorías.</li></ul>` },
    { title: "Pasos y cardio", body: `<ul><li>Tu meta de pasos es 8,000 en las semanas 1 a 4, 9,000 en la 5 a 8 y 10,000 en la 9 a 13. Es una meta práctica, no un número mágico.</li><li><strong>El cardio es en caminadora o elíptica, a un ritmo en el que puedas hablar frases cortas</strong> (6 o 7 de 10), con unos 115 a 135 latidos por minuto como referencia.</li><li><strong>Se hace después de las pesas:</strong> 20 minutos, y 35 en tu sesión larga. En los días fuertes de pierna es opcional, para que tus piernas se recuperen.</li><li>Los días sin pesas camina de 45 a 60 minutos.</li></ul>` },
    { title: "Antojos", body: `<ul><li>Antes de decidir, espera 10 minutos: toma agua, camina o lávate los dientes.</li><li>Si el antojo sigue, come una porción pequeña que hayas planeado, como un cuadro de chocolate amargo o fruta con yogurt.</li><li>No lo compenses con ayuno ni con más cardio. Haz tu siguiente comida normal.</li></ul>` },
    { title: "Comer fuera", body: `<ul><li>Elige primero la proteína: tacos de bistec, pollo o pescado, caldos, pozole sin tostadas fritas o carne asada.</li><li>Pide una sola porción de arroz, frijoles o tortillas, sin refresco, y toda la salsa que quieras.</li><li>Evita lo empanizado, lo que lleva queso extra, la mayonesa y todo lo que diga “crujiente”.</li><li>Si sabes que vas a salir, come ligero antes (no te saltes comidas) y busca unos 30 g de proteína en cada comida.</li></ul>` },
    { title: "Si te saltas un entreno", body: `<ul><li>No lo recuperes duplicando la siguiente sesión. Sigue con la que toca en el calendario.</li><li>Si tienes poco tiempo, haz una versión mínima de 20 minutos: 2 ejercicios básicos con 3 series cada uno. Cuenta como entreno.</li><li>Si pierdes dos sesiones seguidas, haz la rutina “en casa” durante 2 días para no perder el ritmo.</li><li>Lo importante es la constancia: completar el 85 % de las sesiones ya es excelente.</li></ul>` },
    { title: "Si te sales de la dieta", body: `<p>Sigue con tu siguiente comida y sin castigarte. Una comida fuera del plan casi nunca cambia tu avance de la semana. Lo que cuenta es el promedio de 7 días.</p>` },
  ],

  dailyChecks: [
    
    { id: "sleep", label: "Dormí 7 h o más" },
  ],

  weightFAQ: `<p><strong>Tu peso sube y baja entre 0.5 y 2 kg de un día a otro sin que cambie tu grasa.</strong> A corto plazo lo que mueve la báscula es el agua: la sal, los carbohidratos, lo que hay en el estómago, un entreno intenso y cómo dormiste.</p>
  <ul><li>Pésate en ayunas, después de ir al baño, en el mismo lugar y con la misma ropa.</li><li>Mira el <strong>promedio de 7 días</strong> y no el número de hoy.</li><li>Bajaste grasa de verdad cuando el promedio semanal baja, la cintura baja <em>y</em> tu fuerza se mantiene o sube.</li><li>Si el peso sube el día después de entrenar piernas o de una comida salada, es agua.</li><li>Las fotos y la cintura muestran cambios que la báscula no ve, por ejemplo cuando ganas músculo y pierdes grasa al mismo tiempo.</li></ul>`,

  measureGuide: [
    { t: "Peso", d: "Todos los días en ayunas. Lo que cuenta es el promedio de 7 días." },
    { t: "Cintura", d: "Una vez por semana, el domingo en ayunas. Pon la cinta a la altura del ombligo, sin apretar, al terminar de sacar el aire." },
    { t: "Fotos (opcional)", d: "El día 1 y luego cada 2 semanas. En el mismo lugar, con la misma luz y hora y con ropa parecida. Pon la cámara a la altura del pecho y toma frente, perfil y espalda, relajado." },
    { t: "Fuerza", d: "La app guarda tus series. Busca subir peso o repeticiones en los ejercicios principales." },
    { t: "Pasos, sueño y energía", d: "Márcalos en el chequeo diario. Se resumen en la revisión semanal." },
  ],

  adjustRules: {
    fat: [
      { when: "Bajas más del 1 % de tu peso por semana", act: "Sube unas 150 kcal. Bajar tan rápido puede costarte músculo." },
      { when: "Bajas entre 0.25 % y 1 % por semana", act: "Vas bien. No cambies nada." },
      { when: "Llevas 2 semanas estable y la cintura no baja", act: "Revisa si seguiste el plan. Si lo cumpliste al 85 % o más, primero suma 1,500 pasos al día; si sigues igual otra semana, baja 150 kcal." },
      { when: "Estás estable, pero la cintura baja y la fuerza sube", act: "Estás recomponiendo: no cambies nada." },
      { when: "Subes 2 semanas seguidas sin una razón clara", act: "Revisa las porciones y los fines de semana. Si todo está bien, baja 150 kcal." },
      { when: "Duermes menos de 6 horas, tienes poca energía y tu fuerza baja", act: "No recortes más. Sube 150 kcal o haz una semana de descarga." },
    ],
    recomp: [
      { when: "Bajas más del 0.5 % por semana", act: "Sube unas 150 kcal. Para recomponer conviene ir más despacio." },
      { when: "Tu peso está estable o baja hasta 0.4 % por semana, y la cintura baja o la fuerza sube", act: "Estás recomponiendo: no cambies nada." },
      { when: "Peso, cintura y fuerza llevan 3 semanas sin moverse", act: "Si seguiste el plan al 85 % o más, baja 150 kcal y suma 1,000 pasos al día." },
      { when: "Subes más del 0.25 % por semana durante 2 semanas", act: "Baja de 100 a 150 kcal: te estás pasando del mantenimiento." },
      { when: "Duermes menos de 6 horas, tienes poca energía y tu fuerza baja", act: "Sube 150 kcal o haz una semana de descarga." },
    ],
    muscle: [
      { when: "Subes más del 0.7 % por semana", act: "Baja unas 150 kcal. Subir más rápido que eso suele ser sobre todo grasa." },
      { when: "Subes entre 0.25 % y 0.5 % por semana", act: "Vas bien. No cambies nada." },
      { when: "Subes menos del 0.1 % durante 2 semanas", act: "Si seguiste el plan al 85 % o más, sube 150 kcal (unos 35 g de carbohidratos)." },
      { when: "La cintura sube más rápido que la fuerza", act: "Baja unas 150 kcal: el superávit es demasiado grande para tu nivel." },
      { when: "Tu fuerza baja y duermes poco o estás cansado", act: "No cambies las calorías: duerme más y haz una semana de descarga." },
    ],
  },
  adjustLimit: "Cambia una sola cosa a la vez y espera 2 semanas. La app nunca baja de tu mínimo seguro de calorías.",

  reviewQuestions: [
    { id: "adh", q: "¿Cuántos días de 7 seguiste el plan de comida?", min: 0, max: 7, def: 6 },
    { id: "ses", q: "¿Cuántos entrenos hiciste de 6?", min: 0, max: 6, def: 6 },
    { id: "slp", q: "¿Cuántos días dormiste 7 h o más?", min: 0, max: 7, def: 5 },
    { id: "eng", q: "Energía promedio (1 = agotado, 5 = excelente)", min: 1, max: 5, def: 3 },
    { id: "hun", q: "Hambre promedio (1 = ninguna, 5 = constante)", min: 1, max: 5, def: 3 },
    { id: "str", q: "¿Subiste peso o repeticiones en más de la mitad de los ejercicios principales?", yesno: true },
  ],


  blocksGuide: `<p><strong>Uniserie:</strong> un solo ejercicio. Haces una serie, descansas y repites; cada repetición del ciclo es una <em>vuelta</em>. Aquí es donde más peso subes.</p>
  <p><strong>Biserie:</strong> dos ejercicios seguidos, sin descanso entre ellos (A1 y A2). Al terminar A2 descansas y empieza la siguiente vuelta. Ahorra tiempo y sube el volumen.</p>
  <p><strong>Triserie:</strong> lo mismo, con tres ejercicios (A1, A2 y A3).</p>
  <p>El descanso que ves en cada bloque es el que tomas <strong>al terminar la vuelta completa</strong>.</p>`,

  weightsGuide: `<p>Los pesos son <strong>puntos de partida</strong>. Se calculan con tu peso, tu sexo y tu nivel, y son conservadores a propósito porque la app no conoce tu fuerza real.</p>
  <ul><li>Elige el peso con el que terminas la serie con <strong>1 o 2 repeticiones en reserva</strong>, es decir, podrías hacer 1 o 2 más.</li>
  <li>Si te sobran más de 3 repeticiones, sube el peso. Si no llegas al mínimo del rango, bájalo.</li>
  <li>Desde la segunda sesión la app sugiere el peso según lo que registraste. Si completaste todas las vueltas en el máximo del rango, te propone subir.</li>
  <li>“c/mano” es cada mancuerna, “stack” es lo que marca la máquina de placas y “total” es la barra con los discos.</li></ul>`,

  absGuide: `<p><strong>Para que se marque el abdomen necesitas dos cosas a la vez:</strong> un músculo desarrollado, que se logra entrenándolo con peso, y poca grasa encima, que se logra con un déficit de calorías sostenido.</p>
  <ul><li>Hacer abdominales <strong>no quema la grasa de la barriga</strong>. En un estudio de 6 semanas, entrenar abdomen 5 veces por semana mejoró la resistencia del músculo, pero no redujo la grasa abdominal ni la cintura.</li>
  <li>Por eso el plan combina abdomen con peso varias veces por semana (crunch en polea, elevaciones de piernas, rueda, plancha y oblicuos), un déficit moderado, pasos y buen sueño.</li>
  <li>Trata el abdomen como cualquier otro músculo: cada semana sube peso o repeticiones.</li>
  <li>Cuánta grasa necesitas perder para verlo cambia de una persona a otra. Mide tu cintura cada semana: te dice más que la báscula.</li></ul>
  <p>En 90 días lo más probable es que el abdomen se vea más definido al bajar la cintura varios centímetros. Los cuadritos bien marcados suelen pedir menos grasa y más tiempo.</p>`,

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
  limitedGuide: `<p>Cuando tus mancuernas ya no suben de peso, el músculo puede seguir creciendo si cambias <strong>cómo</strong> las usas:</p>
  <ol><li><strong>Más repeticiones:</strong> llega hasta 20 o 25 antes de buscar más peso. Las cargas ligeras llevadas cerca del fallo también hacen crecer el músculo.</li>
  <li><strong>Bajar lento:</strong> 3 segundos al bajar y 1 de pausa abajo.</li>
  <li><strong>Una pierna o un brazo a la vez:</strong> zancadas, subidas al escalón, remo y press a una mano duplican la carga.</li>
  <li><strong>Menos descanso:</strong> de 45 a 60 segundos en los ejercicios accesorios.</li>
  <li><strong>Terminar cerca del fallo:</strong> deja de 0 a 2 repeticiones en reserva en la última serie.</li></ol>
  <p>Ojo: para la <em>fuerza máxima</em> siguen siendo mejores las cargas altas. Si lo que buscas es solo el tamaño del músculo, estas técnicas funcionan.</p>`,

  cardioGuide: `<p><strong>Para qué sirve:</strong> gastar calorías extra sin cansar tus piernas para el siguiente entreno. Por eso la base es un cardio suave y constante.</p>
  <ul><li><strong>Caminadora:</strong> inclinación de 6 a 10 %, velocidad de 5.5 a 6.5 km/h y sin agarrarte de los pasamanos.</li>
  <li><strong>Elíptica:</strong> resistencia de 6 a 8, unas 120 a 140 zancadas por minuto y la espalda recta.</li>
  <li><strong>Cómo saber que vas bien:</strong> puedes hablar frases cortas, pero no cantar. Si no puedes hablar, baja el ritmo.</li>
  <li><strong>Calentamiento:</strong> los primeros 3 a 5 minutos, más suaves.</li>
  <li><strong>Intervalos (opcional, desde la semana 5 y solo en tu sesión larga):</strong> 5 minutos suaves, 8 rondas de 30 segundos fuertes (8 de 10) con 90 segundos suaves, y 5 minutos suaves. Si tus piernas no se recuperan para el siguiente entreno, vuelve al ritmo suave.</li>
  <li><strong>Por qué después de las pesas:</strong> así llegas al entreno con toda tu fuerza. Sumar cardio no frena el crecimiento del músculo ni la fuerza máxima.</li></ul>
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

  supplements: `<p><strong>La creatina monohidratada</strong> (de 3 a 5 g al día, a cualquier hora y todos los días) es el suplemento con más respaldo para ganar fuerza y masa magra. El omega 3, el magnesio, el multivitamínico y la vitamina C son opcionales, y ninguno quema grasa.</p><p>La proteína en polvo es solo una comodidad. Si llegas a tus gramos con comida, no la necesitas.</p>`,


  why: {
    train: [
      { t: "Cómo elegimos los ejercicios", d: "Primero van los ejercicios que más peso permiten, porque ahí es donde más progresas. Cada músculo tiene al menos un ejercicio principal y uno de aislamiento. Para el aislamiento preferimos los que estiran el músculo (tríceps sobre la cabeza, curl inclinado, jalón con brazos rectos) y dejamos fuera los que rinden poco o castigan las articulaciones. Por eso los hombres no hacen abductor y las mujeres tienen una vuelta extra de glúteo. En casa se usan flexiones, remo invertido, sentadilla búlgara y puente de glúteo, que son lo más efectivo sin equipo.", s: ["triceps"] },
      { t: "Cada músculo, al menos dos veces por semana", d: "Entrenar un músculo dos o más veces por semana da mejores resultados que hacerlo una sola vez. Por eso el trabajo se reparte en varios días y cada sesión se mantiene llevadera.", s: ["freq16", "freq19", "helms15"] },
      { t: "Cuántas series hace cada músculo", d: "Más series por semana ayudan a crecer, sobre todo hasta unas 10. Cada músculo recibe entre 6 y 20 series directas por semana, según su tamaño y tu nivel. Si alguno se queda corto, la app le agrega un ejercicio.", s: ["vol"] },
      { t: "Repeticiones", d: "Los ejercicios principales van de 6 a 12 repeticiones con un peso exigente. El aislamiento va de 12 a 15, porque con pesos más ligeros cerca del fallo el músculo también crece y las articulaciones sufren menos.", s: ["helms15", "load"] },
      { t: "Descansos", d: "Los ejercicios principales piden de 90 a 150 segundos, los de aislamiento 60 y el abdomen 45. Descansar más en los básicos permite mover más peso. Las biseries ahorran tiempo en el resto.", s: ["rest"] },
      { t: "Ejercicios que estiran el músculo", d: "Hacer el tríceps con el brazo sobre la cabeza, el curl inclinado o el jalón con brazos rectos trabaja el músculo estirado, que es donde mejor responde. En el tríceps, la extensión sobre la cabeza hizo crecer más la cabeza larga que la extensión en polea.", s: ["triceps"] },
      { t: "Abdomen con peso y variedad", d: "Elevación de piernas colgado, crunch en polea con peso, rueda, plancha y oblicuos. Puedes cambiar cualquiera por un ejercicio equivalente. Entrenar abdomen no quema la grasa de esa zona: para eso están el déficit de calorías y los pasos.", s: ["abs", "spot"] },
      { t: "Cardio después de las pesas", d: "Sumar cardio no frena el crecimiento del músculo ni la fuerza máxima. Va al final del entreno y, en los días fuertes de pierna, es opcional.", s: ["concurrent"] },
      { t: "Fallo y repeticiones en reserva", d: "La última vuelta de los ejercicios de aislamiento y de máquina llega al fallo. Con barra libre se deja 1 o 2 repeticiones en reserva para cuidar la espalda y las articulaciones. En las primeras vueltas quedan de 1 a 3 en reserva. Quien empieza calcula peor su esfuerzo, por eso arranca con más margen.", s: ["zourdos"] },
      { t: "Cuándo subir peso y semanas de descarga", d: "Subes peso cuando completas el máximo del rango en todas las vueltas. Las semanas 4 y 8 son de descarga: bajas la carga para recuperarte y seguir progresando. Es una práctica habitual entre entrenadores, no un resultado exacto de estudios.", s: ["bell"] },
      { t: "Cómo se reparten los días", d: "Con 3 días haces cuerpo completo, con 4 torso y pierna, con 5 empuje, tirón, pierna, torso y pierna, y con 6 empuje, tirón y pierna dos veces. Cada músculo se trabaja al menos dos veces por semana. Si empiezas, el volumen baja una serie por bloque. Si ya tienes mucha experiencia, sube una serie en el ejercicio principal. Si tu objetivo es ganar músculo, hay menos cardio y una serie más en los accesorios.", s: ["freq16", "helms15"] },
      { t: "En casa con mancuernas o sin equipo", d: "Las cargas ligeras llevadas cerca del fallo hacen crecer el músculo casi igual que las pesadas, aunque para la fuerza máxima las pesadas son mejores. Por eso en casa subes repeticiones, bajas lento y pasas a una pierna o un brazo antes de pedir más peso. Sin banca, cada ejercicio se sustituye por uno equivalente (press de suelo, flexiones elevadas) y con barra de dominadas entra el tirón vertical.", s: ["load"] },
      { t: "Dominadas y fondos", d: "Son ejercicios con tu propio peso que trabajan muchos músculos a la vez. Si en el cuestionario dijiste que haces 5 o más, entran en tu plan en lugar del jalón al pecho y la extensión de tríceps en polea, y avanzas con repeticiones y luego con peso. Si no llegas a 5, se quedan como alternativas y puedes usar el jalón y la máquina de fondos asistidos hasta lograrlo.", s: ["helms15"] },
      { t: "Mujeres y hombres", d: "Los estudios revisados muestran que el músculo crece de forma parecida en ambos sexos, y que las mujeres pueden mejorar más su fuerza relativa en el tren superior. Por eso el plan es el mismo y solo cambian los pesos de partida.", s: ["sexdiff"] },
    ],
    diet: [
      { only: ["fat", "recomp"], t: "Calorías: {{GOAL_KCAL}}", d: "Con tus datos, tu mantenimiento estimado es de unas {{MAINT}} kcal. Un día de entreno son unas {{KCAL_T}} y uno de descanso unas {{KCAL_R}}. La idea es bajar como máximo entre 0.5 % y 1 % de tu peso por semana: en atletas, bajar 0.7 % por semana conservó mejor el músculo y la fuerza que bajar 1.4 %. Si tu objetivo es recomponer, lo normal es cambiar unos {{RATE}} por semana.", s: ["helms14", "garthe", "issnDiet"] },
      { only: ["fat", "recomp"], t: "Proteína: unos {{PROT}} g al día", d: "Son {{PROT_KG}} g por cada kg de tu peso (unos {{PROT_FFM}} g por kg de masa magra si tu grasa corporal fuera de {{BF}} %, una estimación y no una medición). Para quien entrena y está en déficit, lo recomendado es de 2.3 a 3.1 g por kg de masa magra.", s: ["issnProt", "issnDiet"] },
      { only: ["muscle"], t: "Calorías: superávit de ≈ {{PCT}} %", d: "Con tus datos, tu mantenimiento estimado es de unas {{MAINT}} kcal. Un día de entreno son unas {{KCAL_T}} y uno de descanso unas {{KCAL_R}}. Para quien empieza o ya tiene algo de experiencia se sugiere comer entre 10 % y 20 % más y subir entre 0.25 % y 0.5 % del peso por semana (unos {{RATE}}). Con mucha experiencia conviene ir más despacio. Nadie conoce el superávit ideal, y quien empieza puede ganar músculo con poco o ningún superávit.", s: ["iraki", "slater"] },
      { only: ["muscle"], t: "Proteína: unos {{PROT}} g al día", d: "Son {{PROT_KG}} g por kg de tu peso, según tu nivel. Comer más proteína que unos 1.6 g por kg no dio más músculo en promedio, y 1.8 deja un poco de margen. Lo habitual para ganar músculo es de 1.4 a 2.0 g por kg.", s: ["morton", "issnProt"] },
      { only: ["muscle"], t: "Grasas ≈ {{FAT}} g y carbohidratos ≈ {{CARB}} g", d: "Las grasas aportan cerca del {{FAT_PCT}} % de las calorías y el resto son carbohidratos, que te dan energía para entrenar. En superávit, casi todo lo extra va a carbohidratos.", s: ["acsm", "issnDiet"] },
      { only: ["muscle"], t: "Qué esperar", d: "Con tu nivel ({{LEVEL}}) puedes ganar unos {{GAIN}} de músculo en esta primera etapa del plan. Parte de lo que subas en la báscula será grasa. Si la cintura sube más rápido que tu fuerza, baja las calorías.", s: ["iraki"] },
      { t: "Tus {{MEALS}} comidas del día", d: "Con {{MEALS}} comidas al día, cada una lleva unos {{PROT_MEAL}} g de proteína, una cantidad que el cuerpo aprovecha bien de una sola vez. Las calorías se reparten entre ellas y cambian entre un día de pesas y uno de descanso. Lo que más importa es el total del día; el número de comidas y los horarios se eligen para que puedas seguirlos.", s: ["protMeal", "helms14"] },
      { t: "Grasas ≈ {{FAT}} g y carbohidratos ≈ {{CARB}} g", d: "Las grasas aportan cerca del {{FAT_PCT}} % de las calorías (lo habitual es entre 20 % y 35 %). El resto son carbohidratos, que se concentran antes de entrenar. Ninguna proporción es mejor que otra para cambiar tu cuerpo, así que elegimos la que te deja entrenar bien.", s: ["acsm", "issnDiet"] },
      { t: "Creatina, sueño y pasos", d: "La creatina es el suplemento con más respaldo para ganar fuerza y masa magra. Dormir poco hace que pierdas menos grasa y más músculo con la misma dieta. Los pasos son una meta práctica, no un número mágico.", s: ["creatine", "sleep"] },
      { only: ["recomp"], t: "Recomposición: qué esperar", d: "Funciona, pero es más lenta que bajar grasa o ganar músculo por separado. Con tu nivel ({{LEVEL}}) puedes ganar unos {{GAIN}} de músculo en esta primera etapa si llegas a tu proteína y subes peso con el tiempo.", s: ["recomp"] },
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

  honesty: `<p>Las calorías y los macros son <strong>cálculos aproximados con un rango</strong>, no valores exactos. Tu mantenimiento real lo descubres con 2 o 3 semanas de datos de peso.</p><p>La recomposición (perder grasa y ganar músculo a la vez) funciona, pero cuánto músculo ganas depende de tu nivel: con el tuyo ({{LEVEL}}) son unos {{GAIN}} en esta primera etapa si llegas a tu proteína y subes peso, y no conviene esperar ganar mucho músculo y perder mucha grasa al mismo ritmo. El cambio que más se ve viene de bajar la cintura y mantener o subir la fuerza.</p><p>Esto no sustituye a un médico ni a un nutriólogo. Si tienes mareos, dolor en el pecho o una lesión, detente y consulta.</p>`,

  sources: [
    { t: "Dietas y composición corporal", w: "Posición de la Sociedad Internacional de Nutrición Deportiva, 2017", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5470183/" },
    { t: "Momento y reparto de los nutrientes", w: "Posición de la Sociedad Internacional de Nutrición Deportiva, 2017", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5596471" },
    { t: "Nutrición y suplementos para fisicoculturismo natural", w: "Helms, Aragon y Fitschen, 2014", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4033492/" },
    { t: "Nutrición y rendimiento deportivo", w: "Posición conjunta de ACSM, Academy of Nutrition and Dietetics y Dietitians of Canada, 2016", u: "https://doi.org/10.1249/MSS.0000000000000852" },
    { t: "Volumen semanal de entrenamiento y crecimiento muscular", w: "Schoenfeld, Ogborn y Krieger, 2016", u: "https://pubmed.ncbi.nlm.nih.gov/?term=Schoenfeld+dose-response+weekly+resistance+training+volume+muscle+mass" },
    { t: "Frecuencia de entrenamiento y crecimiento muscular", w: "Schoenfeld, Ogborn y Krieger, 2016", u: "https://pubmed.ncbi.nlm.nih.gov/27102172/" },
    { t: "Entrenar cerca del fallo y crecimiento muscular", w: "Refalo y colaboradores, 2023", u: "https://openrepository.aut.ac.nz/items/78679612-6ff4-4d00-95d1-7920d072a760/full" },
    { t: "Descanso entre series y crecimiento muscular", w: "Singer y colaboradores, 2024", u: "https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/pdf" },
    { t: "Ritmo de pérdida de peso en deportistas", w: "Garthe y colaboradores, 2011", u: "https://nih.brage.unit.no/nih-xmlui/handle/11250/171332" },
    { t: "Pausas en la dieta (estudio MATADOR)", w: "Byrne y colaboradores, 2018", u: "https://ecite.utas.edu.au/123184" },
    { t: "Energía suficiente para entrenar (RED-S)", w: "Consenso del Comité Olímpico Internacional, 2018", u: "https://www.researchgate.net/profile/Margo_Mountjoy/publication/325212903_International_Olympic_Committee_IOC_Consensus_Statement_on_Relative_Energy_Deficiency_in_Sport_RED-S_2018_Update" },
    { t: "Proteína en adultos mayores (PROT-AGE)", w: "Bauer y colaboradores, 2013", u: "https://researchexperts.utmb.edu/en/publications/evidence-based-recommendations-for-optimal-dietary-protein-intake/" },
    { t: "Ejercicio durante el embarazo", w: "Colegio Estadounidense de Obstetras y Ginecólogos", u: "https://pubmed.ncbi.nlm.nih.gov/30410829/" },
    { t: "Guías de actividad física", w: "Organización Mundial de la Salud, 2020", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7719906/" },
    { t: "Pasos diarios y salud", w: "Paluch y colaboradores, 2022", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9289978/" },
  ],
};
