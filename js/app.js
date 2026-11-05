(function () {
  'use strict';
  var C = window.MOTOTAXI;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- dados vindos de ../js/config.js ---------- */
  function fmt(num) { var n = String(num).replace(/\D/g, ''); return n.slice(0, -4) + '-' + n.slice(-4); }
  function waUrl(msg) { return 'https://wa.me/55' + C.ddd + C.whatsapp + '?text=' + encodeURIComponent(msg); }
  function telUrl(t) { return 'tel:+55' + C.ddd + t.numero; }
  var textos = {
    whatsapp: fmt(C.whatsapp), prefixo: C.telefone.prefixo, numeroFixo: fmt(C.telefone.numero),
    telefone: C.telefone.prefixo + ' ' + fmt(C.telefone.numero),
    telefoneAlt: C.telefoneAlt.prefixo + ' ' + fmt(C.telefoneAlt.numero),
    endereco: C.endereco, referencia: C.referencia
  };
  $$('[data-text]').forEach(function (el) { var v = textos[el.getAttribute('data-text')]; if (v) el.textContent = v; });
  $$('[data-wa]').forEach(function (a) { a.href = waUrl(C.mensagemPadrao); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-tel]').forEach(function (a) { a.href = telUrl(C.telefone); });
  var alt = $('[data-tel-alt]');
  if (alt && C.telefoneAlt.ativo) { alt.href = telUrl(C.telefoneAlt); alt.hidden = false; }
  var mapa = $('[data-map]');
  if (mapa) mapa.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(C.endereco);

  /* ---------- modo demonstração: aviso no lugar de abrir o WhatsApp/telefone ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  var tt;
  function aviso(t) { toast.textContent = t; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 4200); }
  if (C.demo) {
    $$('[data-wa]').forEach(function (a) { a.removeAttribute('target'); a.addEventListener('click', function (e) { e.preventDefault(); aviso('Demonstração: aqui o WhatsApp abriria com a mensagem pronta.'); }); });
    $$('[data-tel],[data-tel-alt]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); aviso('Demonstração: aqui o telefone discaria para a empresa.'); }); });
  }
  $('#ano').textContent = new Date().getFullYear();

  /* ---------- número de contato: ondula e acompanha o cursor/toque ---------- */
  var mega = $('.mega');
  if (mega && !reduce) {
    var txt = $('[data-text]', mega), val = txt.textContent;
    mega.setAttribute('aria-label', 'Chamar no WhatsApp: ' + val);
    txt.className = 'txt'; txt.setAttribute('aria-hidden', 'true'); txt.textContent = '';
    val.split('').forEach(function (c, k) {
      var ch = document.createElement('span');
      ch.className = 'ch'; ch.style.setProperty('--i', k); ch.textContent = c; txt.appendChild(ch);
    });
    var waving = false;
    function wave() {
      if (waving) return; waving = true; mega.classList.add('wave');
      setTimeout(function () { mega.classList.remove('wave'); waving = false; }, 520 + val.length * 38);
    }
    mega.addEventListener('pointerenter', wave);
    mega.addEventListener('pointerdown', wave);          // toque no celular
    mega.addEventListener('pointermove', function (e) {
      var r = mega.getBoundingClientRect();
      txt.style.translate = (((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(1) + 'px ' + (((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(1) + 'px';
    });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (n) { mega.addEventListener(n, function () { txt.style.translate = ''; }); });
  }

  /* ---------- relógio ---------- */
  function tick() {
    var d = new Date(), t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    $$('[data-clock]').forEach(function (el) { el.textContent = t; });
  }
  tick(); setInterval(tick, 20000);

  /* ---------- pedido -> WhatsApp ---------- */
  var form = $('#pedido'), fb = $('#fb'), fbLink = $('#fbLink');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form;
    var linhas = [
      'Olá, ' + C.nome + '! Gostaria de solicitar um serviço.', '',
      '*Nome:* ' + f.nome.value.trim(),
      '*Serviço:* ' + f.servico.value,
      '*Retirada/embarque:* ' + f.origem.value.trim()
    ];
    if (f.destino.value.trim()) linhas.push('*Destino/entrega:* ' + f.destino.value.trim());
    var url = waUrl(linhas.join('\n'));
    if (C.demo) { fb.hidden = false; fb.innerHTML = '<b>Demonstração:</b> o WhatsApp abriria com esta mensagem pronta:<br><br>' + linhas.join('<br>').replace(/\*/g, '').replace(/<(?!br>)/g, '&lt;'); return; }
    fbLink.href = url; fb.hidden = false;
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  });
  $$('[data-pick]').forEach(function (b) { // "Pedir" nos cartões escolhe o serviço e leva ao formulário
    b.addEventListener('click', function () {
      $('#' + b.getAttribute('data-pick')).checked = true;
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { form.origem.focus({ preventScroll: true }); }, 450);
    });
  });

  /* ---------- barra de leitura + logo que acompanha o mouse ---------- */
  var bar = $('#bar'), tk = false;
  function prog() {
    tk = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(prog); } }, { passive: true });
  prog();
  if (fine && !reduce) {
    // logo do formulário acompanha o mouse
    var lg = $('.deck > .logo-card');
    $('.deck').addEventListener('pointermove', function (e) {
      var r = lg.getBoundingClientRect();
      lg.style.transform = 'perspective(600px) rotateY(' + (((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1) + 'deg) rotateX(' + ((0.5 - (e.clientY - r.top) / r.height) * 14).toFixed(1) + 'deg)';
    });
    $('.deck').addEventListener('pointerleave', function () { lg.style.transform = ''; });
  }

  /* ---------- rolagem: vídeo escurece e fumaça flutua; menu fica sólido ---------- */
  var topbar = $('#top'), tk3 = false;
  function onScroll3() {
    tk3 = false;
    var y = window.scrollY, vh = window.innerHeight, root = document.documentElement.style;
    root.setProperty('--py', (y * 0.14).toFixed(1));
    root.setProperty('--dk', Math.max(0, Math.min(0.78, y / (vh * 0.8) * 0.78)).toFixed(3));
    topbar.classList.toggle('solid-bar', y > 40);
    if (!reduce) { var r = $('#cidade').getBoundingClientRect(), cb = $('#cityBg'); if (r.bottom > 0 && r.top < vh) cb.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.14).toFixed(1) + 'px'); }
  }
  window.addEventListener('scroll', function () { if (!tk3) { tk3 = true; requestAnimationFrame(onScroll3); } }, { passive: true });
  onScroll3();

  /* ---------- capa em vídeo (modelo Elite): imagem na hora, vídeo entra com fade, fumaça só após o load ---------- */
  var leve = (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || '')));
  function ligar(vid, atraso) {
    if (!vid || reduce || leve) return;
    vid.muted = true; vid.defaultMuted = true;
    var tryPlay = function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
    var mostrar = function () { vid.classList.add('on'); };
    vid.addEventListener('playing', mostrar, { once: true });
    if (!vid.paused && vid.readyState > 2) mostrar();
    setTimeout(tryPlay, atraso);
    ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { if (vid.paused) tryPlay(); }, { once: true, passive: true });
    });
  }
  ligar($('#bgv'), 0);
  var depois = function () { ligar($('#smk'), 600); };
  if (document.readyState === 'complete') depois(); else window.addEventListener('load', depois, { once: true });

  /* ---------- revelar ao rolar ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el, k) { el.style.setProperty('--d', (k % 4) * 0.08 + 's'); io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }
})();
