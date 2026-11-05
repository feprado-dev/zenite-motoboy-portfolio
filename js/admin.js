(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var K_DATA = 'zr_corridas', K_PIN = 'zr_pin', K_SESSION = 'zr_sessao';
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- armazenamento (com proteção para navegadores sem localStorage) ---------- */
  var mem = {};
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  function load() { try { return JSON.parse(get(K_DATA)) || []; } catch (e) { return []; } }
  function save(list) { set(K_DATA, JSON.stringify(list)); }
  var rides = load();

  /* ---------- PIN ---------- */
  function sha(s) {
    var enc = new TextEncoder().encode('zenite-real:' + s);
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest('SHA-256', enc).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 2166136261; for (var i = 0; i < enc.length; i++) { h ^= enc[i]; h = Math.imul(h, 16777619); }
    return Promise.resolve('f' + (h >>> 0).toString(16));
  }

  var gate = $('#gate'), app = $('#app'), gForm = $('#gateForm'), pin = $('#pin'), pin2 = $('#pin2'), gErr = $('#gateErr');
  var mode = 'login', fails = 0, lockUntil = 0;

  function showGate(m) {
    mode = m; app.hidden = true; gate.hidden = false; gErr.hidden = true; pin.value = pin2.value = '';
    var create = m === 'create' || m === 'change';
    $('#gateTitle').textContent = m === 'change' ? 'Trocar PIN' : create ? 'Crie o seu PIN' : 'Área do dono';
    $('#gateText').textContent = create ? 'Escolha um PIN de 4 a 12 números. Ele protege esta área neste aparelho.' : 'Digite o seu PIN para entrar.';
    $('#gateBtn').textContent = create ? 'Salvar PIN' : 'Entrar';
    pin2.hidden = !create; pin2.required = create;
    pin.autocomplete = create ? 'new-password' : 'current-password';
    setTimeout(function () { pin.focus(); }, 30);
  }
  function showApp() { gate.hidden = true; app.hidden = false; try { sessionStorage.setItem(K_SESSION, '1'); } catch (e) {} render(); }
  function err(t) { gErr.textContent = t; gErr.hidden = false; }

  gForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = pin.value.replace(/\D/g, '');
    if (mode === 'create' || mode === 'change') {
      if (v.length < 4) return err('Use pelo menos 4 números.');
      if (v !== pin2.value.replace(/\D/g, '')) return err('Os dois PINs não são iguais.');
      sha(v).then(function (h) { set(K_PIN, h); showApp(); });
      return;
    }
    if (Date.now() < lockUntil) return err('Muitas tentativas. Aguarde ' + Math.ceil((lockUntil - Date.now()) / 1000) + 's.');
    sha(v).then(function (h) {
      if (h === get(K_PIN)) { fails = 0; showApp(); }
      else { fails++; if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; err('Muitas tentativas. Aguarde 30s.'); } else err('PIN incorreto.'); pin.value = ''; }
    });
  });
  $('#logout').addEventListener('click', function () { try { sessionStorage.removeItem(K_SESSION); } catch (e) {} showGate('login'); });
  $('#chgPin').addEventListener('click', function () { showGate('change'); });

  /* ---------- utilidades ---------- */
  function pad(n) { return ('0' + n).slice(-2); }
  function nowLocal() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtData(q) { var d = new Date(q); return isNaN(d) ? '—' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function parseValor(s) { // "12,50" | "1.250,00" | "12.5"
    s = String(s).replace(/[^\d,.-]/g, '');
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s); return isNaN(n) ? 0 : Math.round(n * 100) / 100;
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- filtros ---------- */
  var periodo = 'hoje', busca = '';
  function inPeriod(r) {
    if (periodo === 'tudo') return true;
    var d = new Date(r.quando); if (isNaN(d)) return false;
    var ini = new Date(); ini.setHours(0, 0, 0, 0);
    if (periodo !== 'hoje') ini.setDate(ini.getDate() - (+periodo - 1));
    return d >= ini;
  }
  function filtered() {
    var b = norm(busca);
    return rides.filter(function (r) {
      return inPeriod(r) && (!b || norm(r.cliente + ' ' + r.origem + ' ' + r.destino + ' ' + r.servico + ' ' + r.obs).indexOf(b) > -1);
    }).sort(function (a, b2) { return a.quando < b2.quando ? 1 : -1; });
  }

  /* ---------- renderização ---------- */
  function render() {
    var list = filtered();
    var sum = list.reduce(function (s, r) { return s + r.valor; }, 0);
    var max = list.reduce(function (m, r) { return Math.max(m, r.valor); }, 0);
    $('#kCount').textContent = list.length;
    $('#kSum').textContent = brl.format(sum);
    $('#kAvg').textContent = brl.format(list.length ? sum / list.length : 0);
    $('#kMax').textContent = brl.format(max);
    $('#listCount').textContent = list.length ? '(' + list.length + ')' : '';

    var rows = $('#rows'); rows.textContent = '';
    list.forEach(function (r) {
      var tr = el('div', 'tr'); tr.setAttribute('role', 'row');
      tr.appendChild(el('span', '', fmtData(r.quando)));
      var c = el('span'); c.appendChild(el('b', '', r.cliente)); c.appendChild(el('small', '', r.servico + (r.obs ? ' · ' + r.obs : ''))); tr.appendChild(c);
      var t = el('span'); t.appendChild(document.createTextNode(r.origem));
      if (r.destino) { t.appendChild(el('span', 'arrow', ' → ')); t.appendChild(document.createTextNode(r.destino)); }
      tr.appendChild(t);
      tr.appendChild(el('span', 'val', brl.format(r.valor)));
      var a = el('span', 'act');
      var eb = el('button', 'ib', '✎'); eb.type = 'button'; eb.title = 'Editar'; eb.setAttribute('aria-label', 'Editar corrida de ' + r.cliente);
      eb.addEventListener('click', function () { edit(r.id); });
      var db = el('button', 'ib del', '✕'); db.type = 'button'; db.title = 'Excluir'; db.setAttribute('aria-label', 'Excluir corrida de ' + r.cliente);
      db.addEventListener('click', function () { if (confirm('Excluir a corrida de ' + r.cliente + '?')) { rides = rides.filter(function (x) { return x.id !== r.id; }); save(rides); render(); } });
      a.appendChild(eb); a.appendChild(db); tr.appendChild(a);
      rows.appendChild(tr);
    });
    $('#empty').hidden = list.length > 0;
    $('#tbl').hidden = list.length === 0;

    // endereços mais usados (origem e destino), considerando o período
    var cont = {}, nomes = {};
    list.forEach(function (r) {
      [r.origem, r.destino].forEach(function (e) { var k = norm(e); if (!k) return; cont[k] = (cont[k] || 0) + 1; nomes[k] = nomes[k] || e; });
    });
    var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; }).slice(0, 5);
    var ol = $('#topEnd'); ol.textContent = '';
    if (!top.length) ol.appendChild(el('li', 'muted', 'Sem dados ainda.'));
    top.forEach(function (k) { var li = el('li'); li.appendChild(el('span', '', nomes[k])); li.appendChild(el('em', '', cont[k] + '×')); ol.appendChild(li); });

    // por serviço
    var ps = {}; list.forEach(function (r) { ps[r.servico] = ps[r.servico] || { n: 0, v: 0 }; ps[r.servico].n++; ps[r.servico].v += r.valor; });
    var keys = Object.keys(ps).sort(function (a, b) { return ps[b].n - ps[a].n; });
    var mx = keys.length ? ps[keys[0]].n : 1, ul = $('#porServ'); ul.textContent = '';
    if (!keys.length) ul.appendChild(el('li', 'muted', 'Sem dados ainda.'));
    keys.forEach(function (k) {
      var li = el('li'), l = el('div', 'l'); l.appendChild(el('span', '', k)); l.appendChild(el('span', '', ps[k].n + ' · ' + brl.format(ps[k].v)));
      var t = el('div', 't'), i = el('i'); i.style.width = (ps[k].n / mx * 100) + '%'; t.appendChild(i);
      li.appendChild(l); li.appendChild(t); ul.appendChild(li);
    });

    // sugestões de endereço no formulário (todos os já usados)
    var dl = $('#dlEnd'); dl.textContent = ''; var seen = {};
    rides.forEach(function (r) { [r.origem, r.destino].forEach(function (e) { var k = norm(e); if (k && !seen[k]) { seen[k] = 1; var o = document.createElement('option'); o.value = e; dl.appendChild(o); } }); });
  }

  $$('#periodo button').forEach(function (b) {
    b.addEventListener('click', function () {
      periodo = b.getAttribute('data-p');
      $$('#periodo button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render();
    });
  });
  $('#busca').addEventListener('input', function (e) { busca = e.target.value; render(); });

  /* ---------- formulário ---------- */
  var f = { id: $('#rid'), quando: $('#fQuando'), cliente: $('#fCliente'), servico: $('#fServico'), valor: $('#fValor'), origem: $('#fOrigem'), destino: $('#fDestino'), obs: $('#fObs') };
  function resetForm() {
    $('#rideForm').reset(); f.id.value = ''; f.quando.value = nowLocal();
    $('#formTitle').textContent = 'Registrar corrida'; $('#saveBtn').textContent = 'Salvar corrida'; $('#cancelBtn').hidden = true;
  }
  function edit(id) {
    var r = rides.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    f.id.value = r.id; f.quando.value = r.quando; f.cliente.value = r.cliente; f.servico.value = r.servico;
    f.valor.value = String(r.valor).replace('.', ','); f.origem.value = r.origem; f.destino.value = r.destino; f.obs.value = r.obs;
    $('#formTitle').textContent = 'Editar corrida'; $('#saveBtn').textContent = 'Salvar alterações'; $('#cancelBtn').hidden = false;
    $('#rideForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $('#cancelBtn').addEventListener('click', resetForm);
  $('#rideForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var r = {
      id: f.id.value || uid(), quando: f.quando.value || nowLocal(), cliente: f.cliente.value.trim(), servico: f.servico.value,
      valor: parseValor(f.valor.value), origem: f.origem.value.trim(), destino: f.destino.value.trim(), obs: f.obs.value.trim()
    };
    var i = rides.map(function (x) { return x.id; }).indexOf(r.id);
    if (i > -1) rides[i] = r; else rides.push(r);
    save(rides); resetForm(); render();
  });

  // colar mensagem do WhatsApp gerada pelo site
  $('#pasteBtn').addEventListener('click', function () {
    var t = $('#pasteTxt').value;
    function pick(label) { var m = t.match(new RegExp('\\*' + label + ':\\*\\s*(.+)', 'i')); return m ? m[1].trim() : ''; }
    var nome = pick('Nome'), serv = pick('Servi[çc]o'), org = pick('Retirada/embarque'), dst = pick('Destino/entrega'), obs = pick('Observa[çc][õo]es');
    if (nome) f.cliente.value = nome;
    if (serv) { var ok = $$('option', f.servico).some(function (o) { return o.value === serv; }); f.servico.value = ok ? serv : 'Outro'; }
    if (org) f.origem.value = org;
    if (dst) f.destino.value = dst;
    if (obs) f.obs.value = obs;
    f.valor.focus();
  });

  /* ---------- backup / exportação ---------- */
  function msg(t) { var m = $('#dataMsg'); m.textContent = t; m.hidden = false; setTimeout(function () { m.hidden = true; }, 5000); }
  function download(nome, conteudo, tipo) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo })); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function stamp() { var d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }

  /* ---------- dados de exemplo (demonstração de portfólio) ---------- */
  var seedBtn = $('#seedDemo');
  if (seedBtn) seedBtn.addEventListener('click', function () {
    if (rides.length && !confirm('Isso adiciona 40 corridas de exemplo às que já existem. Continuar?')) return;
    var clientes = ['Padaria Central', 'Farmácia Vida', 'Mercado Bom Preço', 'Clínica Aurora', 'Ana Souza', 'Carlos Lima', 'Júlia Mendes', 'Papelaria Cores', 'Marcos Dias', 'Lívia Nunes'];
    var ruas = ['Rua das Entregas, 100', 'Av. Principal, 1200', 'Rua das Flores, 45', 'Praça da Matriz, 8', 'Rua do Comércio, 310', 'Av. dos Ipês, 77', 'Rua Nova, 22', 'Travessa Azul, 9'];
    var servicos = ['Delivery', 'Delivery', 'Passageiros', 'Passageiros', 'Compras', 'Serviços bancários', 'Coleta de documentos'];
    var valores = [8, 10, 12, 15, 15, 18, 22, 30];
    var obs = ['', '', '', 'Frágil', 'Ligar ao chegar', 'Entregar na portaria'];
    var seed = 7;
    function rnd(n) { seed = (seed * 9301 + 49297) % 233280; return Math.floor(seed / 233280 * n); }
    var novos = [];
    for (var i = 0; i < 40; i++) {
      var d = new Date(); d.setDate(d.getDate() - rnd(30)); d.setHours(8 + rnd(11), rnd(60), 0, 0);
      novos.push({ id: uid() + i, quando: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()),
        cliente: clientes[rnd(clientes.length)], servico: servicos[rnd(servicos.length)], origem: ruas[rnd(ruas.length)], destino: ruas[rnd(ruas.length)], valor: valores[rnd(valores.length)], obs: obs[rnd(obs.length)] });
    }
    rides = rides.concat(novos); save(rides); render(); msg('40 corridas de exemplo adicionadas. Use os filtros de período no topo.');
  });

  $('#expJson').addEventListener('click', function () { download('zenite-backup-' + stamp() + '.json', JSON.stringify(rides, null, 1), 'application/json'); msg('Backup baixado.'); });
  $('#expCsv').addEventListener('click', function () {
    function q(s) { s = String(s == null ? '' : s); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; } // evita fórmulas no Excel
    var linhas = [['Data', 'Cliente', 'Serviço', 'Origem', 'Destino', 'Valor', 'Observações'].map(q).join(';')];
    rides.slice().sort(function (a, b) { return a.quando < b.quando ? -1 : 1; }).forEach(function (r) {
      linhas.push([fmtData(r.quando), r.cliente, r.servico, r.origem, r.destino, String(r.valor).replace('.', ','), r.obs].map(q).join(';'));
    });
    download('zenite-corridas-' + stamp() + '.csv', '﻿' + linhas.join('\r\n'), 'text/csv;charset=utf-8'); msg('Planilha baixada.');
  });
  $('#impJson').addEventListener('change', function (e) {
    var file = e.target.files[0]; if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var dados = JSON.parse(rd.result);
        if (!Array.isArray(dados)) throw 0;
        var limpos = dados.filter(function (r) { return r && typeof r === 'object'; }).map(function (r) {
          return { id: String(r.id || uid()), quando: String(r.quando || nowLocal()), cliente: String(r.cliente || '').slice(0, 60), servico: String(r.servico || 'Outro'),
            valor: Number(r.valor) || 0, origem: String(r.origem || '').slice(0, 120), destino: String(r.destino || '').slice(0, 120), obs: String(r.obs || '').slice(0, 200) };
        });
        if (!confirm('Restaurar ' + limpos.length + ' corridas? Isso substitui os dados atuais.')) return;
        rides = limpos; save(rides); render(); msg('Backup restaurado.');
      } catch (x) { alert('Arquivo de backup inválido.'); }
      e.target.value = '';
    };
    rd.readAsText(file);
  });
  $('#wipe').addEventListener('click', function () {
    if (confirm('Apagar TODAS as corridas deste aparelho? Baixe um backup antes.') && confirm('Tem certeza? Esta ação não pode ser desfeita.')) { rides = []; save(rides); render(); msg('Todos os dados foram apagados.'); }
  });

  /* ---------- início ---------- */
  resetForm();
  var logado = false; try { logado = sessionStorage.getItem(K_SESSION) === '1'; } catch (e) {}
  if (!get(K_PIN)) showGate('create');
  else if (logado) showApp();
  else showGate('login');
})();
