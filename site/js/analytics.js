/* Medição de acessos anônima (sem cookies, sem nome, sem telefone).
   Registra: visita, seções vistas, cliques em botões/produtos, dúvidas abertas e uso do formulário.
   Os dados ficam só neste navegador e aparecem na aba "Acessos" do painel (admin.html). */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var K_EVENTOS = 'denise_events_v1';

  // Origem da visita (utm_source / utm_campaign, ou o site de onde a pessoa veio).
  // Guardada na sessão para não se perder ao navegar (ex.: ir à política de privacidade e voltar).
  function limpo(v, n) { return String(v || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, n); }
  function descobrirOrigem() {
    try { var salvo = JSON.parse(sessionStorage.getItem('denise_origem') || 'null'); if (salvo && salvo.f) return salvo; } catch (e) { /* calcula */ }
    var p = null; try { p = new URLSearchParams(location.search); } catch (e) { /* sem query */ }
    var f = p ? limpo(p.get('utm_source'), 30) : '';
    var c = p ? limpo(p.get('utm_campaign'), 30) : '';
    if (!f) {
      var host = '';
      try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) { /* sem referrer */ }
      if (!host || host === location.hostname) f = 'direto';
      else if (/instagram\.com$/.test(host)) f = 'instagram';
      else if (/(^|\.)google\./.test(host)) f = 'google';
      else if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(host)) f = 'whatsapp';
      else if (/(facebook\.com|fb\.com)$/.test(host)) f = 'facebook';
      else f = limpo(host, 30) || 'direto';
    }
    var o = { f: f, c: c };
    try { sessionStorage.setItem('denise_origem', JSON.stringify(o)); } catch (e) { /* ok */ }
    return o;
  }
  var ORIGEM = descobrirOrigem(), FONTE = ORIGEM.f, CAMPANHA = ORIGEM.c;
  window.DeniseOrigem = { fonte: FONTE, campanha: CAMPANHA }; // usado também pelo formulário, mesmo sem medição

  // Quem usa o painel pode pedir para não contar as próprias visitas neste aparelho
  try { if (localStorage.getItem('denise_no_track') === '1') return; } catch (e) { /* segue */ }
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  function rnd() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  function id(store, chave) {
    try { var v = store.getItem(chave); if (!v) { v = rnd(); store.setItem(chave, v); } return v; }
    catch (e) { return window['__' + chave] || (window['__' + chave] = rnd()); }
  }
  var V = id(localStorage, 'denise_v');   // visitante (aleatório, não identifica a pessoa)
  var S = id(sessionStorage, 'denise_s'); // sessão (uma aba aberta)

  var largura = window.innerWidth || 1024;
  var DISPOSITIVO = largura <= 767 ? 'celular' : (largura <= 1024 ? 'tablet' : 'computador');


  var fila = [], timer = null;

  function enviar(itens) {
    if (!itens.length) return;
    try {
      var atual = JSON.parse(localStorage.getItem(K_EVENTOS) || '[]');
      if (!Array.isArray(atual)) atual = [];
      atual = atual.concat(itens);
      if (atual.length > 8000) atual = atual.slice(atual.length - 8000);
      localStorage.setItem(K_EVENTOS, JSON.stringify(atual));
    } catch (e) { /* armazenamento indisponível */ }
  }
  function descarregar() { clearTimeout(timer); timer = null; var l = fila; fila = []; enviar(l); }
  function evento(tipo, opcao) {
    fila.push({ t: Date.now(), s: S, v: V, e: tipo, o: String(opcao == null ? '' : opcao).slice(0, 80), d: DISPOSITIVO, f: FONTE });
    if (!timer) timer = setTimeout(descarregar, 4000);
  }
  window.addEventListener('pagehide', descarregar);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') descarregar(); });

  // 1) Visita (uma vez por sessão)
  var jaContou = false;
  try { jaContou = sessionStorage.getItem('denise_vis') === '1'; sessionStorage.setItem('denise_vis', '1'); } catch (e) { /* conta de novo */ }
  if (!jaContou) evento('visita', CAMPANHA);

  // 2) Cliques: qualquer elemento com data-track ou data-plano
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-track],[data-plano]');
    if (!el) return;
    evento('clique', el.getAttribute('data-track') || ('produto:' + el.getAttribute('data-plano')));
  }, true);

  // 3) Seções vistas (primeira vez na sessão)
  var vistas = {};
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting && !vistas[i.target.id]) { vistas[i.target.id] = 1; evento('secao', i.target.id); obs.unobserve(i.target); }
      });
    }, { threshold: 0.15 });
    ['produtos', 'como-funciona', 'por-que', 'depoimentos', 'duvidas', 'contato'].forEach(function (sid) {
      var n = document.getElementById(sid); if (n) obs.observe(n);
    });
  }

  // 4) Dúvidas abertas
  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) { var s = d.querySelector('summary'); evento('faq', s ? s.textContent.trim() : ''); }
    });
  });

  // 5) Formulário: início do preenchimento (uma vez por sessão)
  var iniciou = false, form = document.getElementById('form-contato');
  if (form) form.addEventListener('focusin', function () { if (!iniciou) { iniciou = true; evento('form-inicio', ''); } });

  // O script.js chama isto quando o formulário é enviado
  window.DeniseTrack = { evento: function (t, o) { evento(t, o); descarregar(); } };
})();
