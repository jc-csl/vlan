'use strict';
/* ===== Escena 1: un switch y un cable -> 3 VLAN / 3 subinterfaces ===== */
const VL = [
  { id: 10, name: 'VENTAS', c: COL.v10, net: '192.168.10.0/24', gw: '192.168.10.1', ports: 'f0/1-16', sub: 'g0/0.10' },
  { id: 20, name: 'ADMIN', c: COL.v20, net: '192.168.20.0/24', gw: '192.168.20.1', ports: 'f0/17-32', sub: 'g0/0.20' },
  { id: 30, name: 'INVITADOS', c: COL.v30, net: '192.168.30.0/24', gw: '192.168.30.1', ports: 'f0/33-48', sub: 'g0/0.30' }
];

SCENES.concept = {
  steps: [
    {
      t: 'Punto de partida: sin VLAN',
      h: 'Un router, <b>un cable</b>, un switch de 48 puertos y 9 PCs. Sin VLAN todos los puertos están en la <b>VLAN 1</b>: <b>una sola red</b> (192.168.1.0/24) y <b>un solo dominio de broadcast</b>. Todo el mundo ve a todo el mundo.',
      async run(c, A) { c.clear(); }
    },
    {
      t: 'SIN VLAN: el broadcast de PC1 llega a todos',
      h: 'PC1 lanza un <b>broadcast</b> (p. ej. un ARP a <code>FF:FF:FF:FF:FF:FF</code>). El switch lo <b>inunda por todos los puertos</b>: lo reciben los <b>otros 8 PCs</b> y también el <b>router</b>, aunque no sea para ellos. Todo el switch es <b>un único dominio de broadcast</b>.',
      async run(c, A) { await c.bcast(false, A); }
    },
    {
      t: 'Creamos 3 VLAN y repartimos los puertos',
      h: 'Dividimos el switch en 3 "módulos" de 16 puertos y asignamos cada uno a una VLAN:<br><code>vlan 10</code> · <code>interface range f0/1-16</code> · <code>switchport access vlan 10</code> (y lo mismo con 20 y 30).<br>Físicamente sigue siendo <b>un único switch</b>; es la configuración la que "pinta" los puertos.',
      async run(c, A) {
        c.clear();
        c.st.col = 1;
        c.paint();
        await A.sleep(700);
      }
    },
    {
      t: 'CON VLAN: el mismo broadcast de PC1 solo afecta a su red',
      h: 'PC1 repite <b>exactamente el mismo broadcast</b>. Ahora el switch solo lo reenvía por los puertos de la <b>VLAN 10</b>: lo reciben <b>PC2 y PC3</b>. En los puertos de las VLAN 20 y 30 se <b>filtra</b>. Al router llega por el troncal con la etiqueta VLAN 10 (a <code>g0/0.10</code>) y <b>no lo reenvía</b> a otras VLAN. El broadcast queda confinado en su <b>red local</b>.',
      async run(c, A) { await c.bcast(true, A); }
    },
    {
      t: 'Un switch físico → 3 switches lógicos',
      h: 'Cada VLAN se comporta como <b>un switch independiente</b>: sus puertos no se ven con los de las otras VLAN, ni siquiera comparten broadcast. Es como si hubieras comprado 3 switches de 16 puertos… pero pagando solo uno.',
      async run(c, A) {
        c.clear();
        await A.tween(0, 1, 1400, v => { c.st.tSw = v; c.render(); });
      }
    },
    {
      t: 'Un cable → 3 cables lógicos (subinterfaces)',
      h: 'Para que cada VLAN llegue al router solo hay <b>un cable físico</b> y <b>una interfaz</b> (g0/0). Se configura como <b>troncal 802.1Q</b> y la interfaz se "desdobla" en <b>3 subinterfaces</b>: <code>g0/0.10</code>, <code>g0/0.20</code>, <code>g0/0.30</code>. Dentro del mismo cable viajan las 3 VLAN, cada una identificada con su etiqueta. A esto se le llama <b>router-on-a-stick</b>.',
      async run(c, A) {
        await A.tween(0, 1, 1500, v => { c.st.tRt = v; c.render(); });
      }
    },
    {
      t: 'Tres redes IP distintas',
      h: 'Cada subinterfaz tiene <b>la IP de la puerta de enlace</b> de su VLAN. Cada VLAN = <b>una subred distinta</b>: 192.168.10.0/24, 192.168.20.0/24 y 192.168.30.0/24. Los PCs usan como gateway la IP de su subinterfaz (.1). Para hablar entre VLAN, el tráfico pasa por el router.',
      async run(c, A) {
        c.st.ipShow = 1;
        await A.tween(0, 1, 900, v => { c.st.ip = v; c.render(); });
      }
    },
    {
      t: '¿Y por fuera? Lo físico no ha cambiado',
      h: 'Si miras el rack sigue habiendo <b>un switch y un cable</b>. Las VLAN son <b>lógicas</b>: viven en la configuración. Pulsa <i>Anterior</i> para volver a ver la vista lógica y compara ambas vistas.',
      async run(c, A) {
        await Promise.all([
          A.tween(c.st.tSw, 0, 1500, v => { c.st.tSw = v; c.render(); }),
          A.tween(c.st.tRt, 0, 1500, v => { c.st.tRt = v; c.render(); })
        ]);
      }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    const st = { tSw: 0, tRt: 0, col: 0, ip: 0, ipShow: 0 };
    const physX = [110, 370, 630], logX = [40, 370, 700], MW = 260;
    const rpx = [380, 500, 620];
    const gCab = S('g', {}, svg), gMod = S('g', {}, svg), gPc = S('g', {}, svg), gRt = S('g', {}, svg), gLb = S('g', {}, svg);

    // router
    S('rect', { x: 330, y: 20, width: 340, height: 100, rx: 10, class: 'dev' }, gRt);
    S('text', { x: 500, y: 42, class: 't', 'text-anchor': 'middle' }, gRt, 'ROUTER R1');
    const rGray = S('rect', { x: 490, y: 114, width: 20, height: 10, rx: 2 }, gRt); rGray.style.fill = '#64748b';
    const rSingle = S('text', { x: 500, y: 82, class: 't', 'text-anchor': 'middle' }, gRt, 'Gi0/0');
    const rSingle2 = S('text', { x: 500, y: 99, class: 't tm xs', 'text-anchor': 'middle' }, gRt, '1 interfaz · 1 cable');
    const rPorts = [], rNames = [], rIps = [];
    VL.forEach((v, i) => {
      const p = S('rect', { x: -10, y: 114, width: 20, height: 10, rx: 2 }, gRt); p.style.fill = v.c;
      rPorts.push(p);
      rNames.push(S('text', { x: rpx[i], y: 80, class: 't mono sm', 'text-anchor': 'middle' }, gRt, v.sub));
      rNames[i].style.fill = v.c;
      rIps.push(S('text', { x: rpx[i], y: 97, class: 't tm mono xs', 'text-anchor': 'middle' }, gRt, v.gw + '/24'));
    });

    // cables
    const tube = link(gCab, 500, 124, 500, 300, '#64748b', 12);
    const tubeLbl = S('text', { x: 514, y: 170, class: 't tm sm halo' }, gLb, '1 solo cable físico');
    const cabs = VL.map(v => link(gCab, 500, 124, 500, 300, v.c, 4));
    const cabLbls = VL.map((v, i) => {
      const t = S('text', { class: 't sm halo', 'text-anchor': 'middle' }, gLb, 'VLAN ' + v.id);
      t.style.fill = v.c; return t;
    });

    // switch físico (marco) + módulos
    const outline = S('rect', { x: 96, y: 290, width: 808, height: 100, rx: 12, class: 'dev' }, gMod);
    const outT = S('text', { x: 108, y: 284, class: 't tm sm' }, gLb, 'Switch 2960-48 · 1 solo equipo físico');
    const gi = S('text', { x: 510, y: 286, class: 't tm xs' }, gLb, 'Gi0/1 (troncal)');
    const mods = VL.map((v, i) => {
      const g = S('g', {}, gMod);
      S('rect', { x: 0, y: 300, width: MW, height: 78, rx: 8, class: 'dev' }, g);
      S('text', { x: 130, y: 315, class: 't tm mono xs', 'text-anchor': 'middle' }, g, v.ports);
      const ports = [];
      for (let r = 0; r < 2; r++) for (let q = 0; q < 8; q++) {
        const p = S('rect', { x: 21 + q * 28, y: 322 + r * 20, width: 22, height: 14, rx: 2, class: 'port' }, g);
        ports.push(p);
      }
      const lbl = S('text', { x: 130, y: 373, class: 't sm', 'text-anchor': 'middle' }, g, `VLAN ${v.id} · ${v.name}`);
      lbl.style.fill = v.c; lbl.style.opacity = 0;
      return { g, ports, lbl };
    });

    // PCs
    const dx = [-85, 0, 85];
    const pcs = [], pcCab = [];
    VL.forEach((v, i) => dx.forEach((d, j) => {
      pcCab.push(link(gCab, 0, 378, 0, 440, '#64748b', 2.5));
      const p = pc(gPc, 0, 470, 'PC' + (i * 3 + j + 1), `${v.gw.slice(0, -1)}${11 + j}`);
      p.ipT.style.opacity = 0; p.ipT.style.fontSize = '9.5px';
      pcs.push({ p, i, j });
    }));

    // pastillas de red
    const single = S('g', {}, gLb);
    S('rect', { x: 250, y: 530, width: 500, height: 26, rx: 13, class: 'pill' }, single);
    S('text', { x: 500, y: 548, class: 't sm', 'text-anchor': 'middle' }, single, '192.168.1.0/24 · 1 red · 1 dominio de broadcast');
    const pills = VL.map(v => {
      const g = S('g', {}, gLb);
      const r = S('rect', { x: -125, y: 530, width: 250, height: 26, rx: 13, class: 'pill' }, g); r.style.stroke = v.c;
      const t = S('text', { x: 0, y: 548, class: 't sm', 'text-anchor': 'middle' }, g, `${v.net} · GW .1`);
      t.style.fill = v.c; g.style.opacity = 0;
      return g;
    });

    function cx(i) { return lerp(physX[i], logX[i], st.tSw) + MW / 2; }
    function render() {
      const { tSw, tRt, ip } = st;
      outline.style.opacity = 1 - tSw; outT.style.opacity = 1 - tSw;
      gi.style.opacity = 1 - tRt;
      mods.forEach((m, i) => m.g.setAttribute('transform', `translate(${lerp(physX[i], logX[i], tSw)},0)`));
      pcs.forEach(({ p, i, j }, k) => {
        const x = cx(i) + dx[j];
        p.pos(x, 470);
        pcCab[k].setAttribute('x1', x); pcCab[k].setAttribute('x2', x);
      });
      tube.style.opacity = 1 - .6 * tRt;
      tubeLbl.style.opacity = 1;
      rGray.style.opacity = 1 - tRt; rSingle.style.opacity = 1 - tRt; rSingle2.style.opacity = 1 - tRt;
      VL.forEach((v, i) => {
        const sx = lerp(500, rpx[i], tRt);
        rPorts[i].setAttribute('x', sx - 10); rPorts[i].style.opacity = tRt;
        rNames[i].style.opacity = tRt; rIps[i].style.opacity = tRt * ip;
        const ex = lerp(500, cx(i), tRt);
        cabs[i].setAttribute('x1', sx); cabs[i].setAttribute('x2', ex);
        cabs[i].style.opacity = tRt;
        const mx = (sx + ex) / 2;
        cabLbls[i].setAttribute('x', i === 1 ? 530 : mx); cabLbls[i].setAttribute('y', i === 1 ? 232 : 214);
        cabLbls[i].style.opacity = tRt;
        pills[i].setAttribute('transform', `translate(${cx(i)},0)`);
        pills[i].style.opacity = ip;
      });
      single.style.opacity = (1 - Math.min(1, tSw * 3)) * (1 - ip) * (st.col ? 0 : 1);
      pcs.forEach(({ p }) => { p.ipT.style.opacity = ip; });
    }

    // anotaciones del broadcast (marcas, contador) que se limpian en cada paso
    const marks = [];
    const result = S('text', { x: 850, y: 60, class: 't halo', 'text-anchor': 'middle' }, gLb, '');
    const result2 = S('text', { x: 850, y: 80, class: 't tm xs halo', 'text-anchor': 'middle' }, gLb, '');
    function clear() {
      marks.splice(0).forEach(m => m.remove());
      pcs.forEach(({ p }) => { p.halo.style.opacity = 0; });
      result.textContent = ''; result2.textContent = '';
    }
    async function bcast(vlan, A) {
      clear();
      const col = vlan ? VL[0].c : COL.v1, SY = 384, src = 0;
      const sx = pcs[src].p.g.transform.baseVal[0].matrix.e;
      const px = k => pcs[k].p.g.transform.baseVal[0].matrix.e;
      const up = packet(svg, col);
      await A.move(up.g, [[sx, 440], [sx, SY]], 500);
      up.remove();
      let got = 0;
      const jobs = pcs.map(({ p, i }, k) => (async () => {
        if (k === src) return;
        const same = !vlan || i === 0;
        const pk = packet(svg, col);
        await A.move(pk.g, same ? [[sx, SY], [px(k), SY], [px(k), 440]] : [[sx, SY], [px(k), SY], [px(k), 412]], 900);
        pk.remove();
        if (same) { got++; p.halo.style.stroke = COL.ok; p.halo.style.opacity = 1; }
        else {
          marks.push(S('text', { x: px(k), y: 416, class: 'xmark', 'text-anchor': 'middle' }, svg, '✕'));
        }
      })());
      jobs.push((async () => {
        const pk = packet(svg, col);
        await A.move(pk.g, [[sx, SY], [500, SY], [500, 300], [500, 130]], 1500);
        if (vlan) await pk.tag(A, 10, VL[0].c);
        await A.sleep(vlan ? 500 : 0);
        pk.remove();
        marks.push(S('rect', { x: 330, y: 20, width: 340, height: 100, rx: 10, fill: 'none', stroke: vlan ? COL.v10 : COL.bad, 'stroke-width': 3 }, svg));
      })());
      await Promise.all(jobs);
      result.textContent = vlan ? `Reciben: ${got} PCs de su VLAN` : `Reciben: ${got} PCs + el router`;
      result.style.fill = vlan ? COL.ok : COL.bad;
      result2.textContent = vlan ? 'Los otros 6 PCs no se enteran' : 'Todos procesan un mensaje ajeno';
    }
    function paint() {
      mods.forEach((m, i) => {
        m.ports.forEach(p => { p.style.fill = VL[i].c; });
        m.lbl.style.opacity = 1;
      });
      pcs.forEach(({ p, i }) => p.color(VL[i].c));
      render();
    }
    render();
    return { st, render, paint, clear, bcast };
  }
};

/* ===== Escena 2: dominio de broadcast ===== */
SCENES.broadcast = {
  steps: [
    {
      t: 'Sin VLAN: un solo dominio de broadcast',
      h: 'PC1 lanza un <b>broadcast</b> (por ejemplo un ARP "¿quién tiene la IP x.x.x.x?" a <code>FF:FF:FF:FF:FF:FF</code>). El switch lo <b>inunda por todos los puertos</b>: lo reciben los 5 demás equipos, lo necesiten o no.',
      async run(c, A) { await c.bcast(0); }
    },
    {
      t: 'Asignamos cada PC a su VLAN',
      h: 'Ahora los puertos pertenecen a VLAN 10, 20 o 30 (colores). Cada VLAN pasa a ser <b>su propia red IP</b>. PC1 y PC4 están en la VLAN 10, PC2 y PC5 en la 20, PC3 y PC6 en la 30.',
      async run(c, A) { c.clear(); c.assign(); await A.sleep(600); }
    },
    {
      t: 'Con VLAN: el broadcast se queda en su VLAN',
      h: 'PC1 repite el broadcast. El switch solo lo envía a los puertos de la <b>VLAN 10</b>: lo recibe solo PC4. En los demás puertos se <b>filtra</b>. Los broadcasts ya no molestan a todos → menos tráfico, más rendimiento y más seguridad.',
      async run(c, A) { c.clear(); await c.bcast(0); }
    },
    {
      t: 'Entre VLAN no hay comunicación directa',
      h: 'Si PC1 (VLAN 10) intenta enviar una trama a PC2 (VLAN 20), el switch la <b>descarta</b>: son redes lógicamente separadas. Para unirlas hace falta un dispositivo de <b>capa 3</b> (router o switch multicapa) → siguiente animación.',
      async run(c, A) { c.clear(); await c.unicastFail(0, 1); }
    }
  ],
  build(stage, A) {
    const svg = svgStage(stage);
    const X = [110, 270, 430, 590, 750, 910];
    const vl = [10, 20, 30, 10, 20, 30];
    const st = { vlan: false };
    S('rect', { x: 60, y: 100, width: 880, height: 60, rx: 10, class: 'dev' }, svg);
    S('text', { x: 500, y: 136, class: 't tm', 'text-anchor': 'middle' }, svg, 'SWITCH');
    S('text', { x: 500, y: 40, class: 't lg', 'text-anchor': 'middle' }, svg, 'Broadcast: mensaje dirigido a TODOS los equipos del dominio');
    const pcs = X.map((x, i) => {
      const cab = link(svg, x, 160, x, 298, '#64748b', 3);
      const band = S('rect', { x: x - 14, y: 150, width: 28, height: 10, rx: 2 }, svg); band.style.fill = '#64748b';
      const p = pc(svg, x, 330, 'PC' + (i + 1), '192.168.1.' + (11 + i));
      return { p, band, cab };
    });
    const counter = S('text', { x: 500, y: 470, class: 't lg', 'text-anchor': 'middle' }, svg, '');
    const marks = [];
    const note = S('text', { x: 500, y: 515, class: 't tm', 'text-anchor': 'middle' }, svg, '');
    const vcol = i => (st.vlan ? VCOL[vl[i]] : COL.v1);

    const o = {
      st,
      clear() {
        marks.splice(0).forEach(m => m.remove());
        pcs.forEach(({ p }) => { p.halo.style.opacity = 0; });
        counter.textContent = ''; note.textContent = '';
      },
      assign() {
        st.vlan = true;
        pcs.forEach(({ p, band }, i) => { p.color(VCOL[vl[i]]); band.style.fill = VCOL[vl[i]]; p.ipT.textContent = `192.168.${vl[i]}.${11 + (i > 2 ? 1 : 0)}`; });
      },
      async bcast(s) {
        o.clear();
        const src = packet(svg, vcol(s));
        await A.move(src.g, [[X[s], 296], [X[s], 130]]);
        src.remove();
        let got = 0;
        await Promise.all(pcs.map((_, j) => (async () => {
          if (j === s) return;
          const same = !st.vlan || vl[j] === vl[s];
          const p = packet(svg, vcol(s));
          const pts = [[X[s], 130], [X[j], 130], [X[j], 160]];
          if (same) pts.push([X[j], 296]);
          await A.move(p.g, pts);
          p.remove();
          if (same) { got++; pcs[j].p.halo.style.opacity = 1; pcs[j].p.halo.style.stroke = COL.ok; }
          else {
            const x = S('text', { x: X[j], y: 215, class: 'xmark', 'text-anchor': 'middle' }, svg, '✕');
            const l = S('text', { x: X[j], y: 236, class: 't xs bad', 'text-anchor': 'middle' }, svg, 'filtrado');
            marks.push(x, l);
          }
        })()));
        counter.textContent = `Reciben el broadcast: ${got} de 5 equipos`;
        counter.style.fill = got === 5 ? COL.bad : COL.ok;
        note.textContent = got === 5 ? 'Todos procesan un mensaje que no es para ellos.' : 'Solo reciben los de la misma VLAN.';
      },
      async unicastFail(s, d) {
        o.clear();
        const p = packet(svg, vcol(s));
        await A.move(p.g, [[X[s], 296], [X[s], 130], [lerp(X[s], X[d], .5), 130]]);
        p.remove();
        marks.push(S('text', { x: lerp(X[s], X[d], .5), y: 133, class: 'xmark', 'text-anchor': 'middle' }, svg, '✕'));
        marks.push(S('text', { x: lerp(X[s], X[d], .5), y: 195, class: 't sm bad', 'text-anchor': 'middle' }, svg, 'VLAN 10 ≠ VLAN 20: no se reenvía'));
        pcs[d].p.halo.style.opacity = 1; pcs[d].p.halo.style.stroke = COL.bad;
        counter.textContent = 'PC2 no recibe nada';
        counter.style.fill = COL.bad;
        note.textContent = 'Solo un router (capa 3) puede llevar tráfico de una VLAN a otra.';
      }
    };
    return o;
  }
};
