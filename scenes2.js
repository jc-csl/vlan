'use strict';
/* ===== Escena 3: etiquetado access -> troncal -> access ===== */
SCENES.tagging = {
  steps: [
    {
      t: 'Escenario',
      h: 'PC-A y PC-B están en la <b>VLAN 10</b>; PC-C y PC-D en la <b>VLAN 20</b>. Los cables a los PCs son <b>puertos ACCESS</b> (una sola VLAN). El cable entre switches es un <b>TRONCAL</b> (todas las VLAN). Abajo, la <b>lupa</b> muestra qué lleva la trama en cada tramo.',
      async run(c, A) { c.lens.loc('Lupa: aquí verás la trama en cada tramo del recorrido', COL.mute); c.note('', 410); }
    },
    {
      t: 'PC-A envía una trama normal (sin etiqueta)',
      h: 'El PC <b>no sabe nada de VLAN</b>: genera una trama Ethernet normal. Por el cable de <b>acceso</b> las tramas viajan <b>sin etiqueta</b>.',
      async run(c, A) {
        c.reset();
        c.lens.loc('Cable de ACCESO · PC-A → SW1 · trama SIN etiqueta', COL.ink);
        c.note('El puerto access esconde las VLAN al equipo final.', 410);
        await A.move(c.p.g, [[122, 115], [290, 115], [290, 170]]);
      }
    },
    {
      t: 'SW1 añade la etiqueta (access → troncal)',
      h: 'La trama entra por <code>Fa0/1</code>, que es <b>access VLAN 10</b>. Como va a salir por un troncal, el switch <b>inserta 4 bytes 802.1Q</b> (VID = 10) entre la MAC origen y el campo Tipo y recalcula el FCS.',
      async run(c, A) {
        c.hl(0, true);
        c.lens.loc('Dentro de SW1 · puerto access VLAN 10 → troncal: SE AÑADE la etiqueta', COL.v10);
        c.note('Regla: la VLAN de la etiqueta = la VLAN configurada en el puerto de entrada.', 410);
        await Promise.all([c.p.tag(A, 10, COL.v10), c.lens.addTag(A, 10, COL.v10)]);
        c.hl(0, false);
      }
    },
    {
      t: 'Por el troncal viaja con etiqueta',
      h: 'En el cable <b>troncal</b> las tramas llevan su etiqueta 802.1Q: así el otro switch sabe <b>a qué VLAN pertenece</b> cada trama aunque comparten el mismo cable.',
      async run(c, A) {
        c.lens.loc('TRONCAL · SW1 → SW2 · trama CON etiqueta (VID 10)', COL.v10);
        c.note('', 410);
        await A.move(c.p.g, [[290, 170], [710, 170]]);
      }
    },
    {
      t: 'SW2 lee la etiqueta y la quita (troncal → access)',
      h: 'SW2 lee <b>VID = 10</b> y solo reenvía la trama por puertos de la VLAN 10 (<code>Fa0/1</code>). Como ese puerto es <b>access</b>, <b>quita la etiqueta</b> antes de sacar la trama. <code>Fa0/2</code> (VLAN 20) no la recibe.',
      async run(c, A) {
        c.hl(1, true);
        c.lens.loc('Dentro de SW2 · troncal → puerto access VLAN 10: SE QUITA la etiqueta', COL.v10);
        await Promise.all([c.p.tag(A, null), c.lens.removeTag(A)]);
        c.hl(1, false);
      }
    },
    {
      t: 'PC-B recibe la trama original',
      h: 'PC-B recibe exactamente la trama que envió PC-A, sin etiqueta. PC-D (VLAN 20) no ha visto nada. <b>El etiquetado es transparente para los PCs</b>.',
      async run(c, A) {
        c.lens.loc('Cable de ACCESO · SW2 → PC-B · trama SIN etiqueta', COL.ink);
        c.note('Entrada: añade etiqueta · Salida: la quita.', 410);
        await A.move(c.p.g, [[710, 170], [710, 115], [896, 115]]);
        c.pcs.B.halo.style.opacity = 1; c.pcs.B.halo.style.stroke = COL.ok;
        c.p.remove();
      }
    },
    {
      t: 'Dos VLAN a la vez por el mismo cable',
      h: 'PC-C (VLAN 20) y PC-A (VLAN 10) envían a la vez. En el troncal viajan <b>mezcladas</b>, pero cada trama lleva <b>su etiqueta</b> (azul = 10, verde = 20), así que cada una acaba solo en su VLAN.',
      async run(c, A) {
        c.reset(); c.note('', 410);
        c.lens.loc('Trama VLAN 10 en el troncal', COL.v10); c.lens.setTag(10);
        c.lens2.loc('Trama VLAN 20 en el troncal (el mismo cable, a la vez)', COL.v20); c.lens2.setTag(20);
        c.lens2.show(true);
        const run = async (y, vid, delay, dstY, pcKey) => {
          await A.sleep(delay);
          const p = packet(c.svg, VCOL[vid]);
          await A.move(p.g, [[122, y], [290, y], [290, 170]], 700);
          await p.tag(A, vid, VCOL[vid]);
          await A.move(p.g, [[290, 170], [710, 170]], 1400);
          await p.tag(A, null);
          await A.move(p.g, [[710, 170], [710, dstY], [896, dstY]], 700);
          c.pcs[pcKey].halo.style.opacity = 1; c.pcs[pcKey].halo.style.stroke = VCOL[vid];
          p.remove();
        };
        await Promise.all([run(115, 10, 0, 115, 'B'), run(225, 20, 400, 225, 'D')]);
        c.note('Mismo troncal, mismas tramas mezcladas: la etiqueta mantiene las VLAN separadas.', 530);
      }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    const pcs = {
      A: pc(svg, 80, 130, 'PC-A', '192.168.10.11', COL.v10),
      C: pc(svg, 80, 240, 'PC-C', '192.168.20.11', COL.v20),
      B: pc(svg, 920, 130, 'PC-B', '192.168.10.12', COL.v10),
      D: pc(svg, 920, 240, 'PC-D', '192.168.20.12', COL.v20)
    };
    // cables
    link(svg, 102, 115, 220, 115, COL.v10, 4); link(svg, 102, 225, 220, 225, COL.v20, 4);
    link(svg, 780, 115, 898, 115, COL.v10, 4); link(svg, 780, 225, 898, 225, COL.v20, 4);
    link(svg, 360, 170, 640, 170, '#64748b', 12);
    const sws = [220, 640].map((x, k) => {
      S('rect', { x, y: 85, width: 140, height: 160, rx: 10, class: 'dev' }, svg);
      S('text', { x: x + 70, y: 108, class: 't lg', 'text-anchor': 'middle' }, svg, 'SW' + (k + 1));
      const rows = ['Fa0/1 → VLAN 10', 'Fa0/2 → VLAN 20', 'Gi0/1 → troncal'].map((s, i) => {
        const t = S('text', { x: x + 70, y: 205, class: 't mono xs', 'text-anchor': 'middle' }, svg, s);
        t.setAttribute('y', 205 + i * 18);
        t.style.fill = i < 2 ? VCOL[(i + 1) * 10] : COL.mute;
        return t;
      });
      return rows;
    });
    S('text', { x: 500, y: 150, class: 't sm', 'text-anchor': 'middle' }, svg, 'TRONCAL 802.1Q');
    S('text', { x: 500, y: 196, class: 't tm xs', 'text-anchor': 'middle' }, svg, 'Gi0/1 ↔ Gi0/1 · todas las VLAN');
    [[112, 107, COL.v10, 'Fa0/1 access'], [112, 217, COL.v20, 'Fa0/2 access']].forEach(a => {
      const t = S('text', { x: a[0], y: a[1], class: 't xs' }, svg, a[3]); t.style.fill = a[2];
    });
    [[788, 107, COL.v10, 'Fa0/1 access'], [788, 217, COL.v20, 'Fa0/2 access']].forEach(a => {
      const t = S('text', { x: a[0], y: a[1], class: 't xs' }, svg, a[3]); t.style.fill = a[2];
    });
    S('line', { x1: 0, y1: 292, x2: 1000, y2: 292, class: 'sep' }, svg);
    const lens = frameLens(svg, 340);
    const lens2 = frameLens(svg, 440); lens2.show(false);
    lens.loc('', COL.ink);
    const noteT = S('text', { x: 500, y: 410, class: 't tm', 'text-anchor': 'middle' }, svg, '');
    const o = {
      svg, pcs, lens, lens2, p: null,
      reset() {
        Object.values(pcs).forEach(p => { p.halo.style.opacity = 0; });
        if (o.p) o.p.remove();
        o.p = packet(svg, COL.v10);
        lens.setTag(null); lens2.setTag(null); lens2.show(false);
      },
      hl(k, on) { sws[k].forEach((t, i) => { if (i === 0) t.style.fill = on ? '#fff' : COL.v10; t.style.fontWeight = on && i === 0 ? 800 : ''; }); },
      note(text, y) { noteT.textContent = text; noteT.setAttribute('y', y); }
    };
    o.p = packet(svg, COL.v10);
    return o;
  }
};

/* ===== Escena 4: estructura de la etiqueta 802.1Q ===== */
SCENES.dot1q = {
  steps: [
    {
      t: 'Trama Ethernet normal',
      h: 'Una trama Ethernet clásica: <b>MAC destino (6 B)</b>, <b>MAC origen (6 B)</b>, <b>Tipo (2 B)</b> —p. ej. 0x0800 = IPv4—, <b>Datos</b> y <b>FCS (4 B)</b>. No hay ningún campo que diga a qué VLAN pertenece.',
      async run(c, A) { c.lens.loc('Trama Ethernet sin etiquetar', COL.ink); c.zoom(0); }
    },
    {
      t: 'Se abre un hueco de 4 bytes',
      h: 'El switch abre un hueco de <b>4 bytes</b> justo <b>después de la MAC origen</b> y antes del campo Tipo. Por eso la trama crece de 1518 a <b>1522 bytes</b> como máximo.',
      async run(c, A) {
        c.lens.loc('Se abre hueco tras la MAC origen…', COL.warn);
        await A.tween(0, .5, 600, v => { c.lens.st.tagW = v; c.lens.st.col = '#334155'; c.lens.st.txt = ''; c.redraw(); });
      }
    },
    {
      t: 'Se inserta la etiqueta (4 bytes = 32 bits)',
      h: 'Aparece la etiqueta <b>802.1Q</b>. El <b>FCS se recalcula</b> porque la trama ha cambiado. Vamos a abrirla con la lupa: son 32 bits divididos en 4 campos.',
      async run(c, A) {
        c.lens.loc('Etiqueta 802.1Q insertada · el FCS se recalcula', COL.v10);
        c.lens.st.col = COL.v10; c.lens.st.txt = 'VLAN 10';
        await c.lens.addTag(A, 10, COL.v10);
        await c.zoom(1, A);
      }
    },
    {
      t: 'TPID: "soy una trama 802.1Q" (16 bits)',
      h: '<b>TPID</b> (Tag Protocol ID) = <code>0x8100</code>. Ocupa el mismo sitio donde antes iba el campo Tipo, así que quien lee la trama sabe que a continuación viene una etiqueta VLAN.',
      async run(c, A) { await c.seg(0, A); }
    },
    {
      t: 'PCP y DEI: prioridad (3 + 1 bits)',
      h: '<b>PCP</b> (3 bits, 0–7) es la <b>prioridad CoS</b> para QoS —la voz suele usar 5—. <b>DEI</b> (1 bit; antes llamado CFI) indica si la trama puede descartarse en caso de congestión. Normalmente ambos valen 0.',
      async run(c, A) { await c.seg(1, A); }
    },
    {
      t: 'VID: el número de VLAN (12 bits)',
      h: '<b>VID</b> = identificador de VLAN. En el ejemplo <code>000000001010</code> = <b>10</b>. 12 bits dan 4096 valores, pero 0 y 4095 están reservados: se usan <b>1–4094</b> (normal: 1–1005, extendido: 1006–4094).',
      async run(c, A) { await c.seg(3, A); }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    S('text', { x: 500, y: 30, class: 't lg', 'text-anchor': 'middle' }, svg, 'Cómo es la etiqueta IEEE 802.1Q');
    const lens = frameLens(svg, 110);
    // zoom de 32 bits
    const zg = S('g', {}, svg); zg.style.opacity = 0;
    const BW = 28, X0 = 52, ZY = 300;
    const bits = '1000000100000000' + '000' + '0' + '000000001010';
    const segs = [
      { a: 0, n: 16, c: '#6366f1', l: 'TPID · 16 bits', v: '= 0x8100' },
      { a: 16, n: 3, c: '#ec4899', l: 'PCP · 3', v: 'prioridad 0' },
      { a: 19, n: 1, c: '#f97316', l: 'DEI · 1', v: '0' },
      { a: 20, n: 12, c: COL.v10, l: 'VID · 12 bits', v: '= VLAN 10' }
    ];
    // conectores desde la etiqueta hasta la barra de bits
    const conn = S('path', { class: 'conn' }, zg);
    S('text', { x: 500, y: ZY - 50, class: 't sm tm', 'text-anchor': 'middle' }, zg, 'La etiqueta ampliada: 32 bits (4 bytes)');
    const gs = segs.map(s => {
      const g = S('g', {}, zg);
      const r = S('rect', { x: X0 + s.a * BW, y: ZY, width: s.n * BW, height: 44, rx: 4, class: 'fld' }, g);
      r.style.fill = s.c; r.style.opacity = .35;
      for (let k = 0; k < s.n; k++) {
        S('text', { x: X0 + (s.a + k) * BW + BW / 2, y: ZY + 28, class: 't mono', 'text-anchor': 'middle' }, g, bits[s.a + k]);
      }
      const l = S('text', { x: X0 + (s.a + s.n / 2) * BW, y: ZY + 66, class: 't sm', 'text-anchor': 'middle' }, g, s.l); l.style.fill = s.c;
      const v = S('text', { x: X0 + (s.a + s.n / 2) * BW, y: ZY + 83, class: 't tm xs', 'text-anchor': 'middle' }, g, s.v);
      g.style.opacity = 0;
      return { g, r };
    });
    const hexT = S('text', { x: X0 + 8 * BW, y: ZY - 4, class: 't tm xs mono', 'text-anchor': 'middle' }, zg, '1000 0001 0000 0000');
    hexT.style.opacity = 0;
    const o = {
      lens,
      redraw() { lens.render(); },
      async zoom(on, A) {
        if (!on) { zg.style.opacity = 0; gs.forEach(s => s.g.style.opacity = 0); return; }
        const x0 = 500 - (100 + 100 + 100 + 70 + 190 + 84) / 2 + 200, x1 = x0 + 100;
        conn.setAttribute('d', `M${x0},154 L${X0},${ZY - 20} L${X0 + 32 * BW},${ZY - 20} L${x1},154 Z`);
        await A.tween(0, 1, 600, v => { zg.style.opacity = v; });
      },
      async seg(i, A) {
        gs.forEach((s, k) => { s.g.style.opacity = k <= i ? 1 : 0; s.r.style.opacity = k === i ? .8 : .3; });
        if (i === 1) { gs[2].g.style.opacity = 1; gs[2].r.style.opacity = .8; }
        if (i === 0) { hexT.style.opacity = 1; } else hexT.style.opacity = 0;
        await A.sleep(500);
      }
    };
    return o;
  }
};

/* ===== Escena 5: troncal, VLAN nativa y VLAN permitidas ===== */
SCENES.trunk = {
  steps: [
    {
      t: 'Un troncal = un cable, muchas VLAN',
      h: 'El enlace entre dos switches (o switch–router) se configura como <b>troncal</b>: <code>switchport mode trunk</code>. Por defecto transporta <b>todas las VLAN</b> y las tramas van <b>etiquetadas</b> (802.1Q), con una excepción: la <b>VLAN nativa</b>.',
      async run(c, A) { c.lens.loc('Lupa de la trama en el troncal', COL.mute); }
    },
    {
      t: 'Tramas etiquetadas: VLAN 10, 20 y 30',
      h: 'Tres tramas de tres VLAN salen por el troncal, cada una con su etiqueta 802.1Q. El switch receptor reparte cada trama a la VLAN que indica su etiqueta.',
      async run(c, A) {
        c.clear();
        await Promise.all([10, 20, 30].map((v, i) => c.send(v, i * 600, true)));
      }
    },
    {
      t: 'VLAN nativa: la única SIN etiqueta',
      h: 'La <b>VLAN nativa</b> (aquí la 99) es la VLAN cuyas tramas viajan <b>sin etiqueta</b> por el troncal. Al recibir una trama sin etiqueta, el switch la asigna a <b>su</b> VLAN nativa. Por eso <b>ambos extremos deben tener la misma</b>.',
      async run(c, A) {
        c.clear();
        c.lens.loc('Trama de la VLAN nativa 99: SIN etiqueta en el troncal', COL.v99); c.lens.setTag(null);
        await c.send(99, 0, false);
        c.badge('→ VLAN 99 (nativa)', COL.v99);
      }
    },
    {
      t: '⚠ Native VLAN distinta en cada extremo',
      h: 'Si SW1 usa nativa 99 pero SW2 usa nativa 1, la trama sin etiqueta de la VLAN 99 <b>cae en la VLAN 1</b> de SW2: se mezclan VLAN que debían estar separadas (fallo y riesgo de seguridad). IOS lo avisa con <code>%CDP-4-NATIVE_VLAN_MISMATCH</code>.',
      async run(c, A) {
        c.clear();
        c.setNative(2, 1);
        c.lens.loc('Trama sin etiqueta de VLAN 99… ¿en qué VLAN acaba?', COL.bad);
        await c.send(99, 0, false);
        c.last.color(COL.v1);
        c.badge('⚠ cae en VLAN 1: mismatch', COL.bad);
      }
    },
    {
      t: 'Solución y VLAN permitidas (allowed vlan)',
      h: 'Se arregla con <code>switchport trunk native vlan 99</code> en <b>ambos</b> lados. Además <code>switchport trunk allowed vlan 10,20,99</code> limita qué VLAN pueden cruzar el troncal: una trama de la VLAN 30 se <b>descarta</b> en el puerto troncal.',
      async run(c, A) {
        c.clear();
        c.setNative(2, 99); c.setAllowed('10,20,99');
        c.lens.loc('VLAN 30 no está en la lista "allowed" del troncal', COL.bad); c.lens.setTag(30);
        await Promise.all([c.send(10, 0, true), c.send(30, 500, true, true)]);
      }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    link(svg, 230, 170, 770, 170, '#64748b', 12);
    S('text', { x: 500, y: 140, class: 't sm', 'text-anchor': 'middle' }, svg, 'TRONCAL 802.1Q');
    const info = {};
    [[90, 'SW1'], [770, 'SW2']].forEach(([x, name], k) => {
      S('rect', { x, y: 80, width: 140, height: 180, rx: 10, class: 'dev' }, svg);
      S('text', { x: x + 70, y: 106, class: 't lg', 'text-anchor': 'middle' }, svg, name);
      S('text', { x: x + 70, y: 134, class: 't tm mono xs', 'text-anchor': 'middle' }, svg, 'Gi0/1: trunk');
      info[k + 1] = {
        nat: S('text', { x: x + 70, y: 156, class: 't mono xs', 'text-anchor': 'middle' }, svg, 'native: 99'),
        alw: S('text', { x: x + 70, y: 178, class: 't tm mono xs', 'text-anchor': 'middle' }, svg, 'allowed: todas')
      };
      info[k + 1].nat.style.fill = COL.v99;
    });
    S('line', { x1: 0, y1: 292, x2: 1000, y2: 292, class: 'sep' }, svg);
    const lens = frameLens(svg, 350);
    const badgeT = S('text', { x: 840, y: 290 - 8, class: 't sm', 'text-anchor': 'middle' }, svg, '');
    badgeT.setAttribute('y', 215);
    const o = {
      lens, last: null,
      clear() { badgeT.textContent = ''; if (o.last) o.last.remove(); o.xs.splice(0).forEach(x => x.remove()); },
      xs: [],
      setNative(k, v) { info[k].nat.textContent = 'native: ' + v; info[k].nat.style.fill = v === 99 ? COL.v99 : COL.bad; },
      setAllowed(s) { info[1].alw.textContent = 'allowed: ' + s; info[2].alw.textContent = 'allowed: ' + s; info[1].alw.style.fill = COL.ok; info[2].alw.style.fill = COL.ok; },
      badge(t, c) { badgeT.textContent = t; badgeT.style.fill = c; },
      async send(vid, delay, tagged, blocked) {
        await A.sleep(delay);
        const p = packet(svg, VCOL[vid]); o.last = p;
        p.pos(230, 170);
        if (tagged) { o.lens.setTag(vid, VCOL[vid]); await p.tag(A, vid, VCOL[vid]); }
        if (blocked) {
          await A.move(p.g, [[230, 170], [300, 170]], 500);
          o.xs.push(S('text', { x: 300, y: 178, class: 'xmark', 'text-anchor': 'middle' }, svg, '✕'));
          p.remove();
          return;
        }
        await A.move(p.g, [[230, 170], [770, 170]], 1600);
        if (tagged) { await p.tag(A, null); p.remove(); }
      }
    };
    return o;
  }
};

/* ===== Escena 6: router-on-a-stick ===== */
SCENES.rtr = {
  steps: [
    {
      t: 'El problema: dos VLAN, dos redes',
      h: 'PC-A (VLAN 10, 192.168.10.11) quiere hablar con PC-B (VLAN 20, 192.168.20.22). Son <b>redes distintas</b>, y el switch no reenvía entre VLAN. Necesitan un <b>router</b>. Con un único cable (troncal) y dos subinterfaces basta: <b>router-on-a-stick</b> ("router en un palo").',
      async run(c, A) { c.set({}); }
    },
    {
      t: 'PC-A envía la trama a su gateway',
      h: 'PC-A compara el destino con su máscara: está <b>fuera de su red</b>, así que envía el paquete al <b>gateway</b> 192.168.10.1. En la trama Ethernet, la <b>MAC destino es la del router</b>, pero la <b>IP destino sigue siendo la de PC-B</b>.',
      async run(c, A) {
        c.reset();
        c.set({ dst: 'MAC R1', src: 'MAC PC-A', tag: null, sip: '192.168.10.11', dip: '192.168.20.22', ttl: '128' }, 'Cable de ACCESO · PC-A → SW');
        await A.move(c.p.g, [[200, 296], [420, 215], [500, 192]]);
      }
    },
    {
      t: 'SW etiqueta (VLAN 10) y envía por el troncal',
      h: 'El switch pone la etiqueta <b>VLAN 10</b> (puerto access VLAN 10) y manda la trama por el troncal al router (<code>G0/0</code>).',
      async run(c, A) {
        c.set({ tag: 10 }, 'TRONCAL · SW → R1 · etiquetada VLAN 10');
        await Promise.all([c.p.tag(A, 10, COL.v10)]);
        await A.move(c.p.g, [[500, 192], [500, 120], [500, 80]]);
      }
    },
    {
      t: 'El router mira la etiqueta y enruta',
      h: 'La etiqueta 10 coincide con <code>encapsulation dot1Q 10</code> → la trama entra por la subinterfaz <b>g0/0.10</b>. El router <b>descarta la cabecera Ethernet</b>, mira la IP destino (192.168.20.22) en la tabla de rutas → red conectada a <b>g0/0.20</b>, y baja el TTL en 1.',
      async run(c, A) {
        c.row(0, true);
        c.set({ tag: null, dst: '(se descarta)', src: '(se descarta)', ttl: '127' }, 'Dentro del router · entra por g0/0.10');
        await c.p.tag(A, null);
        await A.sleep(900);
        c.row(0, false); c.row(1, true);
        await A.sleep(900);
      }
    },
    {
      t: 'El router reescribe la capa 2 y sale por g0/0.20',
      h: 'El router construye una <b>trama nueva</b>: MAC origen = R1, MAC destino = PC-B, etiqueta <b>VLAN 20</b>. La <b>IP no cambia</b> (solo el TTL). La trama sale por el <b>mismo cable físico</b> pero por la subinterfaz g0/0.20.',
      async run(c, A) {
        c.set({ dst: 'MAC PC-B', src: 'MAC R1', tag: 20, sip: '192.168.10.11', dip: '192.168.20.22', ttl: '127' }, 'TRONCAL · R1 → SW · etiquetada VLAN 20');
        c.p.color(COL.v20);
        await c.p.tag(A, 20, COL.v20);
        await A.move(c.p.g, [[500, 80], [500, 120], [500, 192]]);
      }
    },
    {
      t: 'El switch quita la etiqueta y entrega a PC-B',
      h: 'SW lee VID = 20, quita la etiqueta y envía la trama por el puerto <b>access VLAN 20</b> a PC-B. En un ping verías <b>TTL=127</b>: pista de que hubo <b>un salto de router</b> (128 − 1).',
      async run(c, A) {
        c.row(1, false);
        await c.p.tag(A, null);
        c.set({ tag: null }, 'Cable de ACCESO · SW → PC-B · sin etiqueta');
        await A.move(c.p.g, [[500, 192], [580, 215], [800, 296]]);
        c.pcB.halo.style.opacity = 1; c.pcB.halo.style.stroke = COL.ok;
        c.p.remove();
      }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    S('rect', { x: 330, y: 20, width: 340, height: 90, rx: 10, class: 'dev' }, svg);
    S('text', { x: 500, y: 40, class: 't', 'text-anchor': 'middle' }, svg, 'ROUTER R1');
    const s1 = S('text', { x: 346, y: 65, class: 't mono xs' }, svg, 'g0/0.10 · 192.168.10.1'); s1.style.fill = COL.v10;
    const s2 = S('text', { x: 346, y: 85, class: 't mono xs' }, svg, 'g0/0.20 · 192.168.20.1'); s2.style.fill = COL.v20;
    const s1b = S('text', { x: 536, y: 65, class: 't mono xs' }, svg, 'dot1Q 10'); s1b.style.fill = COL.v10;
    const s2b = S('text', { x: 536, y: 85, class: 't mono xs' }, svg, 'dot1Q 20'); s2b.style.fill = COL.v20;
    const gp = S('rect', { x: 490, y: 108, width: 20, height: 10, rx: 2 }, svg); gp.style.fill = '#64748b';
    link(svg, 500, 118, 500, 170, '#64748b', 12);
    S('text', { x: 516, y: 152, class: 't tm xs' }, svg, '1 solo cable (troncal G0/0 ↔ Gi0/1)');
    // tabla de rutas
    S('rect', { x: 700, y: 20, width: 285, height: 90, rx: 8, class: 'dev' }, svg);
    S('text', { x: 712, y: 40, class: 't tm xs' }, svg, 'Tabla de rutas de R1');
    const rows = ['C 192.168.10.0/24 → g0/0.10', 'C 192.168.20.0/24 → g0/0.20'].map((s, i) => {
      const r = S('rect', { x: 706, y: 50 + i * 24, width: 273, height: 20, rx: 4, class: 'rowhl' }, svg); r.style.opacity = 0;
      const t = S('text', { x: 714, y: 64 + i * 24, class: 't mono xs' }, svg, s); t.style.fill = VCOL[(i + 1) * 10];
      return r;
    });
    // switch
    S('rect', { x: 360, y: 170, width: 280, height: 45, rx: 10, class: 'dev' }, svg);
    S('text', { x: 500, y: 200, class: 't', 'text-anchor': 'middle' }, svg, 'SWITCH');
    link(svg, 200, 298, 420, 215, COL.v10, 4); link(svg, 800, 298, 580, 215, COL.v20, 4);
    const pcA = pc(svg, 200, 330, 'PC-A', '192.168.10.11', COL.v10);
    const pcB = pc(svg, 800, 330, 'PC-B', '192.168.20.22', COL.v20);
    S('text', { x: 200, y: 384, class: 't tm xs', 'text-anchor': 'middle' }, svg, 'GW 192.168.10.1');
    S('text', { x: 800, y: 384, class: 't tm xs', 'text-anchor': 'middle' }, svg, 'GW 192.168.20.1');
    S('line', { x1: 0, y1: 396, x2: 1000, y2: 396, class: 'sep' }, svg);
    // panel de campos
    const locT = S('text', { x: 500, y: 418, class: 't sm', 'text-anchor': 'middle' }, svg, '');
    const fx = { dst: 150, src: 400, tag: 650 }, fy = 428;
    const fld = {};
    const mk = (k, lbl, x, y, w) => {
      const r = S('rect', { x, y, width: w, height: 40, rx: 5, class: 'fld' }, svg);
      S('text', { x: x + 8, y: y + 13, class: 't tm xs' }, svg, lbl);
      const v = S('text', { x: x + w / 2, y: y + 32, class: 't mono sm', 'text-anchor': 'middle' }, svg, '');
      fld[k] = { r, v };
    };
    mk('dst', 'MAC destino', 150, 428, 230); mk('src', 'MAC origen', 400, 428, 230); mk('tag', 'Etiqueta 802.1Q', 650, 428, 230);
    mk('sip', 'IP origen', 150, 490, 230); mk('dip', 'IP destino', 400, 490, 230); mk('ttl', 'TTL', 650, 490, 230);
    S('text', { x: 20, y: 452, class: 't tm xs' }, svg, 'CAPA 2');
    S('text', { x: 20, y: 514, class: 't tm xs' }, svg, 'CAPA 3');
    const cur = {};
    const o = {
      p: packet(svg, COL.v10), pcB,
      reset() { pcB.halo.style.opacity = 0; if (o.p) o.p.remove(); o.p = packet(svg, COL.v10); },
      row(i, on) { rows[i].style.opacity = on ? .35 : 0; rows[i].style.fill = VCOL[(i + 1) * 10]; },
      set(v, loc) {
        Object.assign(cur, v);
        if (loc !== undefined) locT.textContent = loc;
        for (const k in fld) {
          let val = cur[k];
          if (k === 'tag') val = cur.tag ? 'VLAN ' + cur.tag : '— sin etiqueta —';
          if (val === undefined) val = '';
          if (fld[k].v.textContent !== String(val) && v[k] !== undefined) {
            fld[k].r.style.stroke = COL.warn; fld[k].r.style.strokeWidth = 3;
            setTimeout(() => { fld[k].r.style.stroke = ''; fld[k].r.style.strokeWidth = ''; }, 1200);
          }
          fld[k].v.textContent = val;
          fld[k].v.style.fill = k === 'tag' && cur.tag ? VCOL[cur.tag] : '';
        }
      }
    };
    return o;
  }
};
