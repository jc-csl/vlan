'use strict';
/* ===== Motor de animaciones paso a paso + componentes SVG ===== */
const NS = 'http://www.w3.org/2000/svg';
const COL = {
  v1: '#94a3b8', v10: '#3b82f6', v20: '#22c55e', v30: '#f59e0b', v99: '#a855f7',
  bad: '#ef4444', ok: '#22c55e', warn: '#fbbf24', ink: '#e6edf7', mute: '#93a4bd',
  dev: '#1b2740', line: '#64748b', bg: '#0b1220'
};
const VCOL = { 1: COL.v1, 10: COL.v10, 20: COL.v20, 30: COL.v30, 99: COL.v99 };

function S(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
  if (text !== undefined) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
const lerp = (a, b, t) => a + (b - a) * t;
const ease = p => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/* ---------- Animador (por reproductor) ---------- */
class Anim {
  constructor(player) { this.p = player; this.fast = false; }
  sleep(ms) {
    return this.fast ? Promise.resolve() : new Promise(r => setTimeout(r, ms / this.p.speed));
  }
  tween(from, to, ms, fn, linear) {
    return new Promise(res => {
      if (this.fast || ms <= 0) { fn(to); return res(); }
      const t0 = performance.now(), d = ms / this.p.speed;
      const f = now => {
        const p = Math.min(1, (now - t0) / d);
        fn(lerp(from, to, linear ? p : ease(p)));
        p < 1 ? requestAnimationFrame(f) : res();
      };
      requestAnimationFrame(f);
    });
  }
  /* mueve un <g> a lo largo de una poligonal */
  move(node, pts, ms) {
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(d); total += d;
    }
    const pos = u => {
      let d = u * total;
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i] || i === seg.length - 1) {
          const t = seg[i] ? Math.min(1, d / seg[i]) : 1;
          return [lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t)];
        }
        d -= seg[i];
      }
    };
    return this.tween(0, 1, ms || total * 3.4, u => {
      const [x, y] = pos(u);
      node.setAttribute('transform', `translate(${x},${y})`);
    }, true);
  }
  fade(node, to, ms) {
    const from = parseFloat(node.style.opacity === '' ? 1 : node.style.opacity);
    return this.tween(from, to, ms === undefined ? 400 : ms, v => { node.style.opacity = v; });
  }
}

/* ---------- Reproductor ---------- */
class Player {
  constructor(root, scene) {
    this.root = root; this.scene = scene; this.speed = 1;
    this.cur = -1; this.busy = false; this.auto = false; this.gen = 0;
    root.classList.add('player');
    root.innerHTML = `
      <div class="stage"></div>
      <div class="ctrl">
        <button data-a="reset" title="Reiniciar">⏮ Reiniciar</button>
        <button data-a="prev" title="Paso anterior">◀ Anterior</button>
        <button data-a="next" class="primary" title="Siguiente paso">Siguiente ▶</button>
        <button data-a="auto" title="Reproducir todo seguido">⏯ Auto</button>
        <span class="dots"></span>
        <label class="spd">Velocidad
          <select><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select>
        </label>
      </div>
      <div class="caption"><div class="stepno"></div><h4></h4><div class="txt"></div></div>`;
    this.stage = root.querySelector('.stage');
    this.btn = {};
    root.querySelectorAll('button[data-a]').forEach(b => this.btn[b.dataset.a] = b);
    this.dotsEl = root.querySelector('.dots');
    scene.steps.forEach((s, i) => {
      const d = document.createElement('button');
      d.className = 'dot'; d.title = s.t; d.textContent = i + 1;
      d.onclick = () => this.goto(i);
      this.dotsEl.appendChild(d);
    });
    this.btn.reset.onclick = () => this.restart();
    this.btn.prev.onclick = () => { if (!this.busy && this.cur > 0) this.goto(this.cur - 1); };
    this.btn.next.onclick = () => { if (!this.busy && this.cur < this.last) this.goto(this.cur + 1); };
    this.btn.auto.onclick = () => this.toggleAuto();
    root.querySelector('select').onchange = e => { this.speed = parseFloat(e.target.value); };
    this.restart();
  }
  get last() { return this.scene.steps.length - 1; }
  async restart() {
    this.gen++; this.auto = false; this.busy = false;
    this.stage.innerHTML = '';
    this.A = new Anim(this);
    this.ctx = this.scene.build(this.stage, this.A);
    this.cur = -1;
    await this.runStep(0, true);
  }
  cap(i) {
    const s = this.scene.steps[i], c = this.root.querySelector('.caption');
    c.querySelector('.stepno').textContent = `Paso ${i + 1} de ${this.scene.steps.length}`;
    c.querySelector('h4').textContent = s.t;
    c.querySelector('.txt').innerHTML = s.h;
  }
  ui() {
    this.btn.prev.disabled = this.busy || this.cur <= 0;
    this.btn.next.disabled = this.busy || this.cur >= this.last;
    this.btn.auto.classList.toggle('on', this.auto);
    this.dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('act', i === this.cur);
      d.classList.toggle('done', i < this.cur);
      d.disabled = this.busy;
    });
  }
  async runStep(i, fast) {
    const g = this.gen;
    this.busy = true; this.A.fast = fast; this.cap(i); this.ui();
    try { await this.scene.steps[i].run(this.ctx, this.A); } catch (e) { console.error(e); }
    if (g !== this.gen) return;
    this.cur = i; this.A.fast = false; this.busy = false; this.ui();
  }
  async goto(n) {
    if (this.busy) return;
    if (n <= this.cur) {
      this.gen++; this.stage.innerHTML = ''; this.A = new Anim(this);
      this.ctx = this.scene.build(this.stage, this.A); this.cur = -1;
      const g = this.gen;
      for (let i = 0; i <= n; i++) { await this.runStep(i, true); if (g !== this.gen) return; }
    } else {
      const g = this.gen;
      for (let i = this.cur + 1; i <= n; i++) { await this.runStep(i, i < n); if (g !== this.gen) return; }
    }
  }
  async toggleAuto() {
    if (this.auto) { this.auto = false; this.ui(); return; }
    if (this.busy) return;
    this.auto = true;
    if (this.cur >= this.last) { await this.restart(); this.auto = true; }
    const g = this.gen;
    while (this.auto && this.cur < this.last) {
      await new Promise(r => setTimeout(r, 900 / this.speed));
      if (!this.auto || g !== this.gen) break;
      await this.goto(this.cur + 1);
      if (g !== this.gen) return;
    }
    this.auto = false; this.ui();
  }
}

/* ---------- Componentes SVG ---------- */
function svgStage(stage, w, h) {
  return S('svg', { viewBox: `0 0 ${w || 1000} ${h || 560}`, class: 'svg', preserveAspectRatio: 'xMidYMid meet' }, stage);
}

function pc(p, x, y, name, ip, color) {
  const g = S('g', { transform: `translate(${x},${y})` }, p);
  const halo = S('circle', { cx: 0, cy: -15, r: 34, class: 'halo' }, g);
  const scr = S('rect', { x: -22, y: -30, width: 44, height: 30, rx: 4, class: 'dev' }, g);
  scr.style.stroke = color || COL.v1; scr.style.strokeWidth = 3;
  S('rect', { x: -5, y: 0, width: 10, height: 6, fill: '#64748b' }, g);
  S('rect', { x: -16, y: 6, width: 32, height: 4, rx: 2, fill: '#64748b' }, g);
  const nameT = S('text', { x: 0, y: 26, class: 't', 'text-anchor': 'middle' }, g, name);
  const ipT = S('text', { x: 0, y: 40, class: 't tm mono xs', 'text-anchor': 'middle' }, g, ip || '');
  return {
    g, scr, halo, nameT, ipT,
    color(c) { scr.style.stroke = c; },
    pos(nx, ny) { g.setAttribute('transform', `translate(${nx},${ny})`); }
  };
}

function link(p, x1, y1, x2, y2, color, w) {
  const l = S('line', { x1, y1, x2, y2 }, p);
  l.style.stroke = color || COL.line; l.style.strokeWidth = w || 3; l.style.strokeLinecap = 'round';
  return l;
}

/* paquete (sobre) con "chip" de etiqueta 802.1Q */
function packet(parent, color) {
  const g = S('g', { transform: 'translate(-200,-200)' }, parent);
  const body = S('rect', { x: -17, y: -10, width: 34, height: 20, rx: 3, class: 'pkt' }, g);
  body.style.fill = color || COL.v1;
  S('path', { d: 'M-17,-10 L0,3 L17,-10', class: 'pktflap' }, g);
  const chipG = S('g', {}, g);
  const chipR = S('rect', { x: -27, y: -9, width: 54, height: 18, rx: 9, class: 'chip' }, chipG);
  const chipT = S('text', { x: 0, y: 4, 'text-anchor': 'middle', class: 'chiptxt' }, chipG, '');
  const o = {
    g, body, chipS: 0,
    pos(x, y) { g.setAttribute('transform', `translate(${x},${y})`); },
    color(c) { body.style.fill = c; },
    chip(s) { chipG.setAttribute('transform', `translate(0,-26) scale(${Math.max(s, .001)})`); },
    async tag(A, vid, col) {
      if (vid == null) {
        if (o.chipS > 0) await A.tween(o.chipS, 0, 350, s => { o.chipS = s; o.chip(s); });
        return;
      }
      chipR.style.fill = col || VCOL[vid]; chipT.textContent = 'VLAN ' + vid;
      await A.tween(0, 1, 400, s => { o.chipS = s; o.chip(s); });
    },
    remove() { g.remove(); }
  };
  o.chip(0);
  return o;
}

/* "lupa": barra de campos de una trama Ethernet con hueco para la etiqueta */
function frameLens(parent, y) {
  const g = S('g', {}, parent);
  const W = { dst: 100, src: 100, type: 70, data: 190, fcs: 84 };
  const TW = 100, h = 44;
  const st = { tagW: 0, col: COL.v10, txt: 'VLAN 10', fcs: 0 };
  const title = S('text', { x: 500, y: y - 14, class: 't sm', 'text-anchor': 'middle' }, g, '');
  const mk = (k, lbl) => {
    const r = S('rect', { y, height: h, rx: 4, class: 'fld' }, g);
    const t = S('text', { y: y + h / 2 + 4, 'text-anchor': 'middle', class: 't xs' }, g, lbl);
    return { k, r, t };
  };
  const F = {
    dst: mk('dst', 'MAC destino'), src: mk('src', 'MAC origen'), tag: mk('tag', ''),
    type: mk('type', 'Tipo'), data: mk('data', 'Datos (IP…)'), fcs: mk('fcs', 'FCS')
  };
  const t1 = S('text', { y: y + 19, 'text-anchor': 'middle', class: 'tagtxt' }, g, '802.1Q');
  const t2 = S('text', { y: y + 34, 'text-anchor': 'middle', class: 'tagtxt' }, g, '');
  const order = ['dst', 'src', 'tag', 'type', 'data', 'fcs'];
  function render() {
    const tw = st.tagW * TW;
    const tot = W.dst + W.src + tw + W.type + W.data + W.fcs;
    let x = 500 - tot / 2;
    order.forEach(k => {
      const w = k === 'tag' ? tw : W[k], f = F[k];
      f.r.setAttribute('x', x); f.r.setAttribute('width', Math.max(w, 0));
      f.t.setAttribute('x', x + w / 2);
      if (k === 'tag') {
        f.r.style.fill = st.col; f.r.style.opacity = st.tagW > .02 ? 1 : 0;
        const o = Math.max(0, (st.tagW - .6) / .4);
        t1.setAttribute('x', x + w / 2); t2.setAttribute('x', x + w / 2);
        t1.style.opacity = o; t2.style.opacity = o; t2.textContent = st.txt;
      }
      if (k === 'fcs') {
        f.r.style.stroke = st.fcs > .02 ? COL.warn : ''; f.r.style.strokeWidth = 1 + 2.5 * st.fcs;
        f.t.textContent = st.fcs > .3 ? 'FCS ↻' : 'FCS';
      }
      x += w;
    });
  }
  const o = {
    g, st, render,
    loc(text, color) { title.textContent = text; title.style.fill = color || COL.ink; },
    setTag(vid, col) { st.col = col || VCOL[vid]; st.txt = vid == null ? '' : 'VLAN ' + vid; st.tagW = vid == null ? 0 : 1; render(); },
    async addTag(A, vid, col) {
      st.col = col || VCOL[vid]; st.txt = 'VLAN ' + vid;
      await A.tween(st.tagW, 1, 700, v => { st.tagW = v; render(); });
      await A.tween(1, 0, 900, v => { st.fcs = v; render(); });
    },
    async removeTag(A) {
      await A.tween(st.tagW, 0, 700, v => { st.tagW = v; render(); });
      await A.tween(1, 0, 900, v => { st.fcs = v; render(); });
    },
    show(on) { g.style.opacity = on ? 1 : 0; }
  };
  render();
  return o;
}

const SCENES = {};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-scene]').forEach(el => {
    const sc = SCENES[el.dataset.scene];
    if (sc) new Player(el, sc); else console.warn('Escena no encontrada', el.dataset.scene);
  });
});
