'use strict';

(() => {
  const questions = [
    { q: '¿Qué permite hacer una VLAN en un switch?', options: ['Dividirlo en redes lógicas independientes', 'Aumentar físicamente sus puertos', 'Sustituir todas las direcciones IP', 'Eliminar la necesidad de configurar puertos'], answer: 0, why: 'Una VLAN agrupa puertos en una red lógica independiente dentro del switch.' },
    { q: 'Un equipo de la VLAN 20 envía un broadcast. ¿Quién lo recibe?', options: ['Todos los equipos del switch', 'Los equipos de la VLAN 20 dentro del mismo dominio', 'Solo los equipos de la VLAN 10', 'Ningún equipo'], answer: 1, why: 'Cada VLAN constituye un dominio de broadcast separado.' },
    { q: '¿Qué ocurre con los dominios de broadcast al dividir una red en varias VLAN?', options: ['Desaparecen', 'Su número disminuye necesariamente', 'Aumenta su número y normalmente disminuye su tamaño', 'Todos se fusionan'], answer: 2, why: 'Cada VLAN crea un dominio de broadcast independiente.' },
    { q: '¿Qué dispositivo permite comunicar equipos de distintas VLAN?', options: ['Un concentrador sin configurar', 'Un dispositivo de capa 3, como un router o switch multicapa', 'Un cable de consola', 'Un switch de capa 2 sin enrutamiento'], answer: 1, why: 'La comunicación entre VLAN requiere enrutamiento de capa 3.' },
    { q: '¿Qué caracteriza a un puerto de acceso para datos?', options: ['Transporta necesariamente todas las VLAN', 'Asocia normalmente el tráfico de datos sin etiqueta a una VLAN', 'Solo puede conectarse a un router', 'Añade siempre una etiqueta al PC'], answer: 1, why: 'Un puerto access asocia el tráfico de datos sin etiquetar a su VLAN de acceso.' },
    { q: '¿Cuál es la función de un enlace troncal?', options: ['Transportar varias VLAN por un mismo enlace', 'Conectar exclusivamente un PC', 'Convertir direcciones MAC en IP', 'Eliminar los dominios de broadcast'], answer: 0, why: 'Un troncal puede transportar tráfico de varias VLAN, normalmente usando etiquetas 802.1Q.' },
    { q: 'En un troncal 802.1Q habitual, ¿qué tramas se envían sin etiqueta?', options: ['Las de todas las VLAN', 'Las de la VLAN nativa', 'Las de voz exclusivamente', 'Las de gestión exclusivamente'], answer: 1, why: 'La VLAN nativa se transmite sin etiqueta en la configuración habitual del troncal.' },
    { q: '¿Por qué debe coincidir la VLAN nativa en los extremos del troncal?', options: ['Para que ambas interfaces tengan la misma dirección MAC', 'Para evitar que las tramas sin etiqueta se asignen a VLAN distintas', 'Para que todos los puertos sean access', 'Para aumentar el número de bits del VID'], answer: 1, why: 'Una trama sin etiqueta se asigna a la VLAN nativa del extremo receptor.' },
    { q: '¿Cuánto mide la etiqueta 802.1Q?', options: ['2 bytes', '4 bytes', '6 bytes', '12 bytes'], answer: 1, why: 'La etiqueta tiene 4 bytes: 16 bits de TPID y 16 bits de TCI.' },
    { q: '¿Qué valor identifica normalmente una etiqueta 802.1Q en el campo TPID?', options: ['0x0800', '0x0806', '0x8100', '0x86DD'], answer: 2, why: 'El TPID 0x8100 identifica la etiqueta 802.1Q.' },
    { q: '¿Cuántos bits tiene el campo VID de la etiqueta?', options: ['3', '8', '12', '16'], answer: 2, why: 'El VID tiene 12 bits; los valores 0 y 4095 están reservados.' },
    { q: '¿Cuál es el mayor identificador de VLAN utilizable?', options: ['4094', '4095', '4096', '65535'], answer: 0, why: 'El VID 4095 está reservado; el mayor identificador utilizable es 4094.' },
    { q: '¿Para qué sirve el campo PCP de 802.1Q?', options: ['Identificar la dirección IP', 'Indicar la prioridad de la trama', 'Indicar el número de puerto físico', 'Sustituir el campo VID'], answer: 1, why: 'PCP proporciona tres bits de prioridad para calidad de servicio.' },
    { q: '¿Qué comando asigna la VLAN 10 a un puerto de acceso Cisco?', options: ['switchport access vlan 10', 'encapsulation dot1Q 10', 'vtp domain 10', 'no vlan 10'], answer: 0, why: 'En el modo de configuración de interfaz se utiliza switchport access vlan 10.' },
    { q: '¿Qué comando muestra los enlaces troncales activos en un switch Cisco?', options: ['show interfaces trunk', 'show ip route', 'show version', 'show clock'], answer: 0, why: 'show interfaces trunk muestra información sobre los troncales.' },
    { q: '¿Para qué sirve la lista de VLAN permitidas de un troncal?', options: ['Para seleccionar qué VLAN pueden atravesarlo', 'Para asignar direcciones IP a los PC', 'Para cambiar el nombre del switch', 'Para eliminar la VLAN nativa automáticamente'], answer: 0, why: 'La lista allowed restringe las VLAN que pueden circular por el troncal.' },
    { q: 'En router-on-a-stick, ¿cómo se asocia una subinterfaz del router a la VLAN 20?', options: ['switchport mode access', 'encapsulation dot1Q 20', 'show vlan brief', 'switchport nonegotiate'], answer: 1, why: 'encapsulation dot1Q 20 vincula la subinterfaz al tráfico etiquetado de la VLAN 20.' },
    { q: 'Si se elimina una VLAN que tiene puertos asignados, ¿qué sucede con esos puertos?', options: ['Pasan automáticamente a la VLAN 1', 'Quedan asignados a una VLAN inexistente y pierden conectividad en ella', 'Se convierten en troncales', 'Se eliminan físicamente del switch'], answer: 1, why: 'Los puertos siguen asignados a esa VLAN; hay que recrearla o reasignarlos.' },
    { q: '¿Qué ocurre normalmente si dos puertos Cisco están ambos en dynamic auto?', options: ['Negocian un troncal', 'Se apagan ambos puertos', 'No negocian el troncal y funcionan como acceso', 'Cambian la VLAN nativa a 99'], answer: 2, why: 'En dynamic auto ambos esperan una propuesta de negociación.' },
    { q: 'En VTP, ¿qué hace normalmente un switch en modo cliente?', options: ['Aprende las VLAN de anuncios válidos del dominio', 'Crea VLAN libremente para todos los switches', 'Convierte todos los puertos en access', 'Enruta tráfico entre VLAN'], answer: 0, why: 'Un cliente VTP aprende la base de VLAN a través de anuncios válidos; no crea VLAN locales en ese modo.' }
  ];

  const form = document.getElementById('quiz-form');
  const container = document.getElementById('quiz-questions');
  const score = document.getElementById('quiz-score');

  questions.forEach((question, index) => {
    const field = document.createElement('fieldset');
    field.className = 'quiz-question';
    const legend = document.createElement('legend');
    legend.textContent = `${index + 1}. ${question.q}`;
    field.appendChild(legend);
    const options = document.createElement('div');
    options.className = 'quiz-options';
    question.options.forEach((option, choice) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question-${index}`;
      input.value = String(choice);
      const text = document.createElement('span');
      text.textContent = option;
      label.append(input, text);
      options.appendChild(label);
    });
    const feedback = document.createElement('p');
    feedback.className = 'quiz-feedback';
    field.append(options, feedback);
    container.appendChild(field);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    let correct = 0, unanswered = 0;
    questions.forEach((question, index) => {
      const field = container.children[index];
      const selected = field.querySelector('input:checked');
      const feedback = field.querySelector('.quiz-feedback');
      const isCorrect = selected && Number(selected.value) === question.answer;
      if (!selected) unanswered++;
      else if (isCorrect) correct++;
      feedback.className = 'quiz-feedback ' + (!selected ? 'unanswered' : isCorrect ? 'correct' : 'incorrect');
      feedback.textContent = `${!selected ? 'Sin responder.' : isCorrect ? 'Correcto.' : 'Incorrecto.'} Solución: ${question.options[question.answer]}. ${question.why}`;
    });
    score.textContent = `Resultado: ${correct} de ${questions.length} aciertos${unanswered ? ` · ${unanswered} sin responder` : ''}.`;
  });

  form.addEventListener('reset', () => {
    score.textContent = '';
    container.querySelectorAll('.quiz-feedback').forEach(feedback => {
      feedback.textContent = '';
      feedback.className = 'quiz-feedback';
    });
  });

  form.addEventListener('change', () => {
    if (!score.textContent) return;
    score.textContent = 'Respuestas modificadas. Vuelve a corregir el test.';
    container.querySelectorAll('.quiz-feedback').forEach(feedback => {
      feedback.textContent = '';
      feedback.className = 'quiz-feedback';
    });
  });
})();
