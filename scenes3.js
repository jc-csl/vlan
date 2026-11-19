'use strict';
/* ===== Escena 7: comandos Cisco (terminal animado) ===== */
const CFG = {
  vlans: { dev: 'S1', lines: [
    { p: 'S1>', c: 'enable', cfg: 1 },
    { p: 'S1#', c: 'configure terminal', cfg: 1 },
    { p: 'S1(config)#', c: 'vlan 10', n: 'Crea la VLAN 10', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'name VENTAS', n: 'Nombre descriptivo', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'vlan 20', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'name ADMIN', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'vlan 30', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'name INVITADOS', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'vlan 99', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'name NATIVA', n: 'VLAN sin usuarios, para la nativa', cfg: 1 },
    { p: 'S1(config-vlan)#', c: 'exit', cfg: 1 }
  ] },
  access: { dev: 'S1', lines: [
    { p: 'S1(config)#', c: 'interface range fastEthernet 0/1 - 16', n: 'Los 16 puertos del "módulo" 1', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport mode access', n: 'Puerto de acceso (1 sola VLAN)', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport access vlan 10', n: 'Pertenece a la VLAN 10', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'exit', cfg: 1 },
    { p: 'S1(config)#', c: 'interface range fastEthernet 0/17 - 32', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport mode access', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport access vlan 20', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'exit', cfg: 1 },
    { p: 'S1(config)#', c: 'interface range fastEthernet 0/33 - 48', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport mode access', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'switchport access vlan 30', cfg: 1 },
    { p: 'S1(config-if-range)#', c: 'exit', cfg: 1 }
  ] },
  trunk: { dev: 'S1', lines: [
    { p: 'S1(config)#', c: 'interface gigabitEthernet 0/1', n: 'El puerto que va al router', cfg: 1 },
    { p: 'S1(config-if)#', c: 'description TRONCAL hacia R1 G0/0', cfg: 1 },
    { p: 'S1(config-if)#', c: 'switchport mode trunk', n: 'Troncal permanente (etiquetado 802.1Q)', cfg: 1 },
    { p: 'S1(config-if)#', c: 'switchport trunk native vlan 99', n: 'VLAN nativa = 99 (igual en el router)', cfg: 1 },
    { p: 'S1(config-if)#', c: 'switchport trunk allowed vlan 10,20,30,99', n: 'Solo estas VLAN cruzan el troncal', cfg: 1 },
    { p: 'S1(config-if)#', c: 'switchport nonegotiate', n: 'Desactiva DTP en este puerto', cfg: 1 },
    { p: 'S1(config-if)#', c: 'end', cfg: 1 },
    { p: 'S1#', c: 'copy running-config startup-config', n: 'Guardar la configuración', cfg: 1 }
  ] },
  router: { dev: 'R1', lines: [
    { p: 'R1>', c: 'enable', cfg: 1 },
    { p: 'R1#', c: 'configure terminal', cfg: 1 },
    { p: 'R1(config)#', c: 'interface gigabitEthernet 0/0', n: 'La interfaz FÍSICA: 1 sola', cfg: 1 },
    { p: 'R1(config-if)#', c: 'no shutdown', n: 'Sin IP; solo se enciende', cfg: 1 },
    { p: 'R1(config-if)#', c: 'exit', cfg: 1 },
    { p: 'R1(config)#', c: 'interface gigabitEthernet 0/0.10', n: 'Subinterfaz 1 (.10 = VLAN 10 por convención)', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 10', n: 'Atiende las tramas con etiqueta 10', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'ip address 192.168.10.1 255.255.255.0', n: 'Gateway de la VLAN 10', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'exit', cfg: 1 },
    { p: 'R1(config)#', c: 'interface gigabitEthernet 0/0.20', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 20', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'ip address 192.168.20.1 255.255.255.0', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'exit', cfg: 1 },
    { p: 'R1(config)#', c: 'interface gigabitEthernet 0/0.30', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 30', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'ip address 192.168.30.1 255.255.255.0', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'exit', cfg: 1 },
    { p: 'R1(config)#', c: 'interface gigabitEthernet 0/0.99', n: 'Para la VLAN nativa (sin IP)', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 99 native', n: '"native" = tramas SIN etiqueta', cfg: 1 },
    { p: 'R1(config-subif)#', c: 'end', cfg: 1 },
    { p: 'R1#', c: 'copy running-config startup-config', cfg: 1 }
  ] },
  verify: { dev: 'S1', lines: [
    { p: 'S1#', c: 'show vlan brief' },
    { o: 'VLAN Name                 Status    Ports' },
    { o: '---- -------------------- --------- ------------------------------' },
    { o: '1    default              active    Gi0/2' },
    { o: '10   VENTAS               active    Fa0/1, Fa0/2, … Fa0/16' },
    { o: '20   ADMIN                active    Fa0/17, … Fa0/32' },
    { o: '30   INVITADOS            active    Fa0/33, … Fa0/48' },
    { o: '99   NATIVA               active' },
    { p: 'S1#', c: 'show interfaces trunk' },
    { o: 'Port   Mode   Encapsulation  Status     Native vlan' },
    { o: 'Gi0/1  on     802.1q         trunking   99' },
    { o: 'Port   Vlans allowed on trunk' },
    { o: 'Gi0/1  10,20,30,99' },
    { p: 'R1#', c: 'show ip interface brief' },
    { o: 'Interface              IP-Address     OK? Method Status  Protocol' },
    { o: 'GigabitEthernet0/0     unassigned     YES unset  up      up' },
    { o: 'GigabitEthernet0/0.10  192.168.10.1   YES manual up      up' },
    { o: 'GigabitEthernet0/0.20  192.168.20.1   YES manual up      up' },
    { o: 'GigabitEthernet0/0.30  192.168.30.1   YES manual up      up' },
    { p: 'R1#', c: 'show ip route' },
    { o: 'C  192.168.10.0/24 is directly connected, GigabitEthernet0/0.10' },
    { o: 'C  192.168.20.0/24 is directly connected, GigabitEthernet0/0.20' },
    { o: 'C  192.168.30.0/24 is directly connected, GigabitEthernet0/0.30' }
  ] },
  pcs: { dev: 'PC', lines: [
    { o: 'PC1 (VLAN 10) → IP 192.168.10.11 · Máscara 255.255.255.0 · Gateway 192.168.10.1', hi: 1 },
    { o: 'PC17 (VLAN 20) → IP 192.168.20.22 · Máscara 255.255.255.0 · Gateway 192.168.20.1', hi: 1 },
    { o: 'PC40 (VLAN 30) → IP 192.168.30.33 · Máscara 255.255.255.0 · Gateway 192.168.30.1', hi: 1 },
    { p: 'PC1>', c: 'ping 192.168.20.22', n: 'Desde VLAN 10 a VLAN 20' },
    { o: 'Reply from 192.168.20.22: bytes=32 time<1ms TTL=127' },
    { o: '→ TTL 127 = 128 − 1: ha atravesado 1 router' }
  ] }
};

function cfgText(keys) {
  return keys.flatMap(k => CFG[k].lines.filter(l => l.cfg).map(l => l.c)).join('\n');
}

SCENES.cmds = {
  steps: [
    {
      t: 'Switch 1/4 · Crear las VLAN',
      h: 'Las VLAN se crean en el switch con <code>vlan N</code> y se les da un <b>nombre descriptivo</b>. Se guardan en <code>flash:vlan.dat</code>.',
      async run(c, A) { c.clear(); await c.type('S1 — consola del switch', 'vlans', A); }
    },
    {
      t: 'Switch 2/4 · Puertos de acceso (los "módulos")',
      h: '<code>interface range</code> configura varios puertos a la vez. <code>switchport mode access</code> + <code>switchport access vlan N</code> deja cada grupo de 16 puertos en su VLAN. <b>Aquí es donde "troceas" el switch.</b>',
      async run(c, A) { await c.type(null, 'access', A); }
    },
    {
      t: 'Switch 3/4 · El troncal hacia el router',
      h: 'El puerto que va al router es <b>un solo cable para las 3 VLAN</b>: <code>switchport mode trunk</code>. Fija la VLAN nativa y las VLAN permitidas; <code>nonegotiate</code> apaga la negociación DTP. <i>En switches antiguos (p. ej. 3560) hay que poner antes <code>switchport trunk encapsulation dot1q</code>.</i>',
      async run(c, A) { await c.type(null, 'trunk', A); }
    },
    {
      t: 'Router · Subinterfaces (1 interfaz → 3)',
      h: 'En la interfaz física <b>solo</b> <code>no shutdown</code> (sin IP). Luego una <b>subinterfaz por VLAN</b>: <code>encapsulation dot1Q N</code> (qué etiqueta atiende) + la <b>IP del gateway</b>. Para la nativa: <code>encapsulation dot1Q 99 native</code>.',
      async run(c, A) { await c.type('R1 — consola del router', 'router', A); }
    },
    {
      t: 'Comprobar que funciona',
      h: 'Con <code>show vlan brief</code> ves qué puertos están en cada VLAN; con <code>show interfaces trunk</code>, el troncal y su VLAN nativa; en el router, <code>show ip interface brief</code> y <code>show ip route</code>.',
      async run(c, A) { await c.type('Comprobaciones', 'verify', A); }
    },
    {
      t: 'Configurar los PCs y probar',
      h: 'Cada PC necesita IP de <b>su</b> VLAN, máscara y <b>gateway = IP de su subinterfaz</b>. Un ping entre VLAN con <b>TTL = 127</b> confirma que pasa por el router.',
      async run(c, A) { await c.type('Equipos finales', 'pcs', A); }
    }
  ],
  build(stage, A) {
    const wrap = document.createElement('div'); wrap.className = 'termwrap'; stage.appendChild(wrap);
    wrap.innerHTML = '<div class="termhead"><i></i><i></i><i></i><span>Terminal</span></div><div class="term"></div>';
    const term = wrap.querySelector('.term');
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return {
      clear() { term.innerHTML = ''; },
      async type(sep, key, A) {
        if (sep) { const d = document.createElement('div'); d.className = 'sep2'; d.textContent = '── ' + sep + ' ──'; term.appendChild(d); }
        for (const l of CFG[key].lines) {
          const row = document.createElement('div'); row.className = 'ln';
          term.appendChild(row);
          if (l.o !== undefined) {
            row.innerHTML = `<span class="out${l.hi ? ' hi' : ''}">${esc(l.o)}</span>`;
          } else {
            row.innerHTML = `<span class="pr">${esc(l.p)}</span> <span class="cmd"></span>`;
            const cmd = row.querySelector('.cmd');
            if (A.fast) cmd.textContent = l.c;
            else for (let i = 1; i <= l.c.length; i++) { cmd.textContent = l.c.slice(0, i); await A.sleep(11); }
            if (l.n) { const n = document.createElement('span'); n.className = 'note'; n.textContent = '! ' + l.n; row.appendChild(n); }
          }
          term.scrollTop = term.scrollHeight;
          if (!A.fast) await A.sleep(l.o !== undefined ? 60 : 180);
        }
      }
    };
  }
};

/* ===== Bloques de configuración copiables ===== */
function initCopyBlocks() {
  const defs = [
    ['cfg-sw', 'Switch S1', ['vlans', 'access', 'trunk']],
    ['cfg-rt', 'Router R1', ['router']]
  ];
  defs.forEach(([id, title, keys]) => {
    const el = document.getElementById(id); if (!el) return;
    const txt = cfgText(keys);
    el.innerHTML = `<div class="cfghead"><b>${title}</b><button class="copy">📋 Copiar</button></div><pre></pre>`;
    el.querySelector('pre').textContent = txt;
    const b = el.querySelector('.copy');
    b.onclick = async () => {
      try { await navigator.clipboard.writeText(txt); } catch (e) {
        const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      b.textContent = '✔ Copiado'; setTimeout(() => b.textContent = '📋 Copiar', 1500);
    };
  });
}
document.addEventListener('DOMContentLoaded', initCopyBlocks);
