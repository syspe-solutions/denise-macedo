(function () {
  'use strict';

  var WHATSAPP = '5581985645355';
  var PLANOS = {
    saude: 'plano de saúde', dental: 'plano dental', vida: 'seguro de vida',
    auto: 'seguro auto', viagem: 'seguro viagem', pet: 'plano pet',
    orientacao: 'uma orientação (ainda não sei qual produto)'
  };

  var form = document.getElementById('form-contato');
  var nome = document.getElementById('campo-nome');
  var zap = document.getElementById('campo-zap');
  var plano = document.getElementById('campo-plano');

  // Máscara de telefone: (00) 00000-0000
  zap.addEventListener('input', function () {
    var d = zap.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 10) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    else if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    else if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    else if (d.length) out = '(' + d;
    zap.value = out;
  });

  // Botões "Pedir cotação" dos cards já selecionam o produto no formulário
  document.querySelectorAll('[data-plano]').forEach(function (a) {
    a.addEventListener('click', function () { plano.value = a.getAttribute('data-plano'); });
  });

  // Origem da visita (links com utm_source), definida em analytics.js
  var NOMES_ORIGEM = { instagram: 'Instagram', whatsapp: 'WhatsApp', google: 'Google', facebook: 'Facebook', email: 'e-mail', cartao: 'cartão de visita' };
  function origemAtual() { return window.DeniseOrigem || { fonte: 'direto', campanha: '' }; }
  function origemDoLead() {
    var o = origemAtual();
    if (!o.fonte || o.fonte === 'direto') return 'site';
    return (o.fonte + (o.campanha ? '/' + o.campanha : '')).slice(0, 40);
  }
  function sufixoOrigem() {
    var o = origemAtual();
    if (!o.fonte || o.fonte === 'direto') return '';
    return ' (Vim pelo ' + (NOMES_ORIGEM[o.fonte] || o.fonte) + '.)';
  }
  // Os botões de WhatsApp também avisam a Denise de onde a pessoa veio
  (function () {
    var suf = sufixoOrigem(); if (!suf) return;
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
      try {
        var u = new URL(a.href), t = u.searchParams.get('text');
        if (t) { u.searchParams.set('text', t + suf); a.href = u.toString(); }
      } catch (e) { /* mantém o link */ }
    });
  })();

  // Registra o contato para o painel (admin.html), neste navegador.
  function registrarLead(lead) {
    try {
      var k = 'denise_leads_v1';
      var lista = JSON.parse(localStorage.getItem(k) || '[]');
      lista.push(lead);
      localStorage.setItem(k, JSON.stringify(lista));
    } catch (err) { /* armazenamento indisponível */ }
  }

  // O formulário registra o contato e abre o WhatsApp com a mensagem pronta
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalido = null;
    [nome, zap, plano].forEach(function (c) {
      var ok = c.value.trim() !== '' && (c !== zap || c.value.replace(/\D/g, '').length >= 10);
      c.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !invalido) invalido = c;
    });
    if (invalido) { invalido.focus(); return; }

    registrarLead({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      criadoEm: new Date().toISOString(),
      nome: nome.value.trim(),
      whatsapp: zap.value,
      plano: plano.value,
      origem: origemDoLead(),
      status: 'novo',
      nota: ''
    });

    if (window.DeniseTrack) window.DeniseTrack.evento('form-envio', plano.value);

    var msg = 'Olá, Denise! Meu nome é ' + nome.value.trim() +
      ' e tenho interesse em ' + (PLANOS[plano.value] || plano.value) +
      '. Meu WhatsApp: ' + zap.value + '.' + sufixoOrigem();
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  [nome, zap, plano].forEach(function (c) {
    c.addEventListener('input', function () { c.removeAttribute('aria-invalid'); });
  });

  // Barra fixa de WhatsApp: aparece depois do topo e some ao chegar no contato
  var bar = document.getElementById('barra-zap');
  var hero = document.querySelector('.hero');
  var contato = document.getElementById('contato');
  if (bar && 'IntersectionObserver' in window) {
    var heroOut = false, contatoIn = false;
    var update = function () { bar.classList.toggle('is-visible', heroOut && !contatoIn); };
    new IntersectionObserver(function (en) { heroOut = !en[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (en) { contatoIn = en[0].isIntersecting; update(); }).observe(contato);
  } else if (bar) {
    bar.classList.add('is-visible');
  }

  // FAQ: abre um por vez
  var itens = document.querySelectorAll('.faq details');
  itens.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) itens.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
