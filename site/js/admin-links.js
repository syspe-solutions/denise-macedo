/* Aba "Links": gera links com utm_source / utm_medium / utm_campaign para divulgação. */
(function () {
  'use strict';

  var K_BASE = 'denise_base_url';
  // [rótulo, descrição, utm_source, utm_medium, utm_campaign]
  var PRONTOS = [
    ['Instagram · Link da bio', 'Para o perfil @denisemcmacedo', 'instagram', 'bio', 'bio'],
    ['Instagram · Stories', 'Adesivo de link nos stories', 'instagram', 'stories', 'stories'],
    ['Instagram · Reels', 'Link na legenda ou nos comentários', 'instagram', 'reels', 'reels'],
    ['WhatsApp · Status', 'Link no status e nas listas de transmissão', 'whatsapp', 'status', 'status'],
    ['WhatsApp · Boas-vindas', 'Mensagem automática do WhatsApp Business', 'whatsapp', 'mensagem', 'boas-vindas'],
    ['Google · Perfil da empresa', 'Botão de site no Google Meu Negócio', 'google', 'perfil', 'perfil-google'],
    ['Facebook · Grupos e página', 'Divulgação em grupos de Recife', 'facebook', 'grupo', 'grupo-recife'],
    ['E-mail · Assinatura', 'Rodapé dos e-mails da Denise', 'email', 'assinatura', 'assinatura'],
    ['Cartão de visita · QR code', 'Link que vira o QR do cartão', 'cartao', 'qr', 'cartao-visita']
  ];

  window.PainelLinks = { iniciar: iniciar };

  function limpo(v) { return String(v || '').toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30); }

  function iniciar(ctx) {
    var h = ctx.h, $ = ctx.$;
    var base = $('lk-base');
    var salvo = ctx.lerTexto(K_BASE);
    try { base.value = salvo || new URL('index.html', location.href).href; } catch (e) { base.value = salvo; }

    function baseValida() {
      var erro = $('lk-base-erro'); erro.textContent = '';
      try {
        var u = new URL(base.value.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'file:') throw 0;
        return u;
      } catch (e) { erro.textContent = 'Digite o endereço completo do site, começando com https://'; return null; }
    }
    function montar(fonte, meio, campanha) {
      var u = baseValida(); if (!u) return '';
      u.searchParams.set('utm_source', limpo(fonte) || 'outro');
      if (limpo(meio)) u.searchParams.set('utm_medium', limpo(meio)); else u.searchParams.delete('utm_medium');
      if (limpo(campanha)) u.searchParams.set('utm_campaign', limpo(campanha)); else u.searchParams.delete('utm_campaign');
      return u.toString();
    }
    function copiar(campo) {
      var texto = campo.value;
      if (!texto) { ctx.aviso('Corrija o endereço do site primeiro.'); return; }
      var reserva = function () {
        campo.select();
        try { ctx.aviso(document.execCommand('copy') ? 'Link copiado.' : 'Selecione o link e copie com Ctrl+C.'); }
        catch (e) { ctx.aviso('Selecione o link e copie com Ctrl+C.'); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { ctx.aviso('Link copiado.'); }, reserva);
      else reserva();
    }

    var linhas = [];
    var lista = $('lk-prontos');
    PRONTOS.forEach(function (p, i) {
      var campo = h('input', { class: 'ctl', type: 'text', readonly: '', id: 'lk-pronto-' + i, 'aria-label': 'Link: ' + p[0] });
      lista.appendChild(h('div', { class: 'link-linha' },
        h('div', { class: 'rot' }, h('b', {}, p[0]), h('span', {}, p[1])),
        campo,
        h('button', { class: 'btn btn--fantasma btn--mini', type: 'button', onclick: function () { copiar(campo); } }, 'Copiar')));
      linhas.push([campo, p]);
    });

    function atualizar() {
      var ok = !!baseValida();
      if (ok) ctx.gravar(K_BASE, base.value.trim());
      linhas.forEach(function (l) { l[0].value = montar(l[1][2], l[1][3], l[1][4]); });
      var f = $('lk-fonte').value;
      $('lk-outra-box').hidden = f !== '__outro';
      $('lk-saida').value = montar(f === '__outro' ? $('lk-outra').value : f, $('lk-meio').value, $('lk-campanha').value);
    }

    ['lk-base', 'lk-fonte', 'lk-outra', 'lk-meio', 'lk-campanha'].forEach(function (id) {
      $(id).addEventListener('input', atualizar); $(id).addEventListener('change', atualizar);
    });
    $('lk-copiar').addEventListener('click', function () { copiar($('lk-saida')); });
    atualizar();
    return {};
  }
})();
