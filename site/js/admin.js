(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var K_LEADS = 'denise_leads_v1', K_HASH = 'denise_admin_hash_v1', K_SESSAO = 'denise_admin_ok', K_ABA = 'denise_admin_aba';

  var STATUS = [
    ['novo', 'Novo', '#9E4524'], ['contatado', 'Contatado', '#B07A12'], ['cotacao', 'Em cotação', '#3B6EA5'],
    ['fechado', 'Fechado', '#2F7D4F'], ['descartado', 'Descartado', '#8A8A8A']
  ];
  var PLANOS = {
    saude: 'Plano de saúde', dental: 'Plano dental', vida: 'Seguro de vida', auto: 'Seguro auto',
    viagem: 'Seguro viagem', pet: 'Plano pet', orientacao: 'Quer orientação'
  };
  var NOMES_ORIGEM = { instagram: 'Instagram', whatsapp: 'WhatsApp', google: 'Google', facebook: 'Facebook', email: 'E-mail', cartao: 'Cartão' };
  var ICO_ZAP = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>';
  var ICO_SETA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return n;
  }
  function icone(svg) { var t = document.createElement('template'); t.innerHTML = svg; return t.content.firstChild; } // só recebe SVG fixo, definido acima
  function lerJSON(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); return true; } catch (e) { return false; } }
  function lerTexto(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function aviso(msg) {
    var t = h('div', { class: 'aviso-toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------------- Acesso ---------------- */
  function cyrb(s) { // reserva para quando crypto.subtle não existe (ex.: abrir por file://)
    var a = 0xdeadbeef, b = 0x41c6ce57;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677); }
    a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
    b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
    return 'c:' + (4294967296 * (2097151 & b) + (a >>> 0)).toString(16);
  }
  function hash(txt) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode('denise|' + txt)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    return Promise.resolve(cyrb('denise|' + txt));
  }
  function hashEsperado() { return CFG.adminCodeHash || lerTexto(K_HASH); }

  function iniciarAcesso() {
    var criar = !hashEsperado();
    $('acesso').hidden = false;
    $('campo-confirma').hidden = !criar;
    if (criar) {
      $('acesso-titulo').textContent = 'Crie o código de acesso';
      $('acesso-texto').textContent = 'Primeiro acesso. Escolha um código com pelo menos 6 caracteres. Ele fica guardado só neste navegador.';
      $('acesso-btn').textContent = 'Criar código e entrar';
    }
    $('codigo').focus();
    $('form-acesso').addEventListener('submit', function (e) {
      e.preventDefault();
      var cod = $('codigo').value, erro = $('acesso-erro');
      erro.textContent = '';
      if (criar) {
        if (cod.length < 6) { erro.textContent = 'Use pelo menos 6 caracteres.'; return; }
        if (cod !== $('codigo2').value) { erro.textContent = 'Os dois códigos não são iguais.'; return; }
        hash(cod).then(function (hx) { gravar(K_HASH, hx); liberar(); });
      } else {
        hash(cod).then(function (hx) {
          if (hx === hashEsperado()) liberar();
          else { erro.textContent = 'Código incorreto.'; $('codigo').select(); }
        });
      }
    });
  }
  function liberar() {
    try { sessionStorage.setItem(K_SESSAO, '1'); } catch (e) { /* segue sem sessão */ }
    $('acesso').hidden = true;
    iniciarPainel();
  }

  /* ---------------- Dados ---------------- */
  var leads = [];
  function carregar() { var l = lerJSON(K_LEADS, []); leads = Array.isArray(l) ? l : []; }
  function salvar() { if (!gravar(K_LEADS, leads)) aviso('Não foi possível salvar neste navegador.'); }
  function txt(v, max) { return String(v == null ? '' : v).slice(0, max); }
  function limpar(l) {
    var d = new Date(l && l.criadoEm); var ok = STATUS.some(function (s) { return s[0] === l.status; });
    return {
      id: txt(l.id, 40) || uid(), criadoEm: isNaN(d) ? new Date().toISOString() : d.toISOString(),
      nome: txt(l.nome, 120), whatsapp: txt(l.whatsapp, 30), plano: txt(l.plano, 20),
      origem: txt(l.origem, 40) || 'importado', status: ok ? l.status : 'novo', nota: txt(l.nota, 1000)
    };
  }
  function mesclar(novos) {
    var ids = {}; leads.forEach(function (l) { ids[l.id] = true; });
    var n = 0;
    novos.forEach(function (x) { var l = limpar(x || {}); if (!ids[l.id]) { leads.push(l); ids[l.id] = true; n++; } });
    return n;
  }
  function ehExemplo(l) { return /^exemplo-/.test(l.id); }

  /* ---------------- Formatação ---------------- */
  var filtro = { q: '', status: '', plano: '' };
  var abertos = {}; // contatos com os detalhes abertos

  function fmtData(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  function fmtDataLonga(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function relativo(iso) {
    var d = new Date(iso); if (isNaN(d)) return '';
    var s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return 'agora';
    var m = Math.floor(s / 60); if (m < 60) return 'há ' + m + ' min';
    var hr = Math.floor(m / 60); if (hr < 24) return 'há ' + hr + ' h';
    var dd = Math.floor(hr / 24); if (dd === 1) return 'ontem'; if (dd < 7) return 'há ' + dd + ' dias';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  function iniciais(nome) {
    var p = String(nome || '').trim().split(/\s+/).filter(Boolean);
    return p.length ? (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase() : '?';
  }
  function rotuloOrigem(o) { // "instagram/bio" vira "via Instagram · bio"; o que vem do site direto não ganha rótulo
    if (!o || o === 'site' || o === 'exemplo' || o === 'importado') return '';
    var p = String(o).split('/');
    return 'via ' + (NOMES_ORIGEM[p[0]] || p[0]) + (p[1] ? ' · ' + p[1] : '');
  }
  function linkZap(l) {
    var d = String(l.whatsapp).replace(/\D/g, '');
    if (d.length <= 11) d = '55' + d;
    var interesse = PLANOS[l.plano] ? PLANOS[l.plano].toLowerCase() : 'seguros';
    var msg = 'Olá, ' + l.nome + '! Aqui é a Denise Macêdo, corretora. Vi seu contato sobre ' + interesse + ' e quero te ajudar.';
    return 'https://wa.me/' + d + '?text=' + encodeURIComponent(msg);
  }
  function corStatus(s) { var f = STATUS.filter(function (x) { return x[0] === s; })[0]; return f ? f[2] : '#8A8A8A'; }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }

  /* ---------------- Contatos: resumo e filtros ---------------- */
  var chips = {};

  function contagens() {
    var c = { '': leads.length };
    STATUS.forEach(function (s) { c[s[0]] = 0; });
    leads.forEach(function (l) { if (c[l.status] != null) c[l.status]++; });
    return c;
  }

  function atualizarResumo() {
    var c = contagens();
    Object.keys(chips).forEach(function (k) {
      chips[k].querySelector('b').textContent = c[k];
      chips[k].setAttribute('aria-pressed', String(filtro.status === k));
    });
    var selo = $('selo-novos'); selo.textContent = c.novo; selo.hidden = !c.novo;
    selo.title = plural(c.novo, 'contato novo', 'contatos novos');

    $('ct-sub').textContent = leads.length
      ? plural(leads.length, 'contato', 'contatos') + (c.novo ? ' · ' + plural(c.novo, 'novo', 'novos') + ' esperando resposta' : ' · todos já foram respondidos')
      : 'Quem preencher o formulário do site aparece aqui.';

    // Aviso do que precisa de ação: contatos novos, do mais antigo para o mais recente
    var novos = leads.filter(function (l) { return l.status === 'novo'; }).sort(function (a, b) { return a.criadoEm < b.criadoEm ? -1 : 1; });
    var at = $('atencao');
    at.hidden = !novos.length || filtro.status === 'novo';
    if (!at.hidden) {
      var t = $('atencao-texto'); t.textContent = '';
      t.appendChild(h('b', {}, plural(novos.length, 'contato novo', 'contatos novos')));
      t.appendChild(document.createTextNode(' esperando resposta. O mais antigo chegou ' + relativo(novos[0].criadoEm).replace(/^agora$/, 'agora mesmo') + '.'));
    }
    $('btn-apagar-exemplos').hidden = !leads.some(ehExemplo);
  }

  function filtrados() {
    var q = filtro.q.toLowerCase(), qd = filtro.q.replace(/\D/g, '');
    return leads.filter(function (l) {
      if (filtro.status && l.status !== filtro.status) return false;
      if (filtro.plano && l.plano !== filtro.plano) return false;
      if (!q) return true;
      return l.nome.toLowerCase().indexOf(q) > -1 || (qd && l.whatsapp.replace(/\D/g, '').indexOf(qd) > -1);
    }).sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; });
  }

  function copiarTexto(texto, msg) {
    var reserva = function () {
      var ta = h('textarea', { style: 'position:fixed;opacity:0' }, texto); document.body.appendChild(ta); ta.select();
      try { aviso(document.execCommand('copy') ? msg : 'Copie manualmente: ' + texto); } catch (e) { aviso('Copie manualmente: ' + texto); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { aviso(msg); }, reserva);
    else reserva();
  }

  /* ---------------- Contatos: lista ---------------- */
  function detalhe(l, aberto) {
    var nome = l.nome || 'contato';
    return h('div', { class: 'lead__detalhe', hidden: aberto ? null : '' },
      h('div', {},
        h('label', { for: 'nota-' + l.id }, 'Anotações'),
        h('textarea', { class: 'ctl', id: 'nota-' + l.id, placeholder: 'O que conversaram, próximo passo…', maxlength: '1000',
          oninput: function (e) { l.nota = e.target.value.slice(0, 1000); salvar(); } }, l.nota)),
      h('dl', {},
        h('div', {}, h('dt', {}, 'Recebido em'), h('dd', {}, fmtDataLonga(l.criadoEm))),
        h('div', {}, h('dt', {}, 'WhatsApp'), h('dd', {}, l.whatsapp)),
        h('div', {}, h('dt', {}, 'Origem'), h('dd', {}, rotuloOrigem(l.origem) || (l.origem === 'importado' ? 'Importado de backup' : 'Direto no site')))),
      h('div', { class: 'lead__fim' },
        h('button', { class: 'btn btn--fantasma btn--mini', type: 'button', onclick: function () { copiarTexto(l.whatsapp, 'Número copiado.'); } }, 'Copiar número'),
        h('button', { class: 'btn btn--perigo btn--mini', type: 'button', 'aria-label': 'Excluir ' + nome, onclick: function () {
          if (!confirm('Excluir o contato de ' + nome + '? Isso não pode ser desfeito.')) return;
          leads = leads.filter(function (x) { return x.id !== l.id; }); delete abertos[l.id]; salvar(); render();
        } }, 'Excluir contato')));
  }

  function linha(l) {
    var nome = l.nome || '(sem nome)', aberto = !!abertos[l.id];

    var sel = h('select', { class: 'ctl', 'aria-label': 'Status de ' + nome });
    STATUS.forEach(function (s) { var o = h('option', { value: s[0] }, s[1]); if (s[0] === l.status) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () {
      l.status = sel.value; salvar(); atualizarResumo(); renderLista();
      var novo = document.querySelector('[data-id="' + l.id + '"] .estado select'); // devolve o foco após redesenhar
      if (novo) novo.focus();
    });

    var det = detalhe(l, aberto);
    var bDet = h('button', { class: 'btn btn--fantasma btn--mini btn-det', type: 'button', 'aria-expanded': String(aberto), 'aria-label': 'Detalhes de ' + nome,
      onclick: function () {
        abertos[l.id] = !abertos[l.id]; det.hidden = !abertos[l.id]; bDet.setAttribute('aria-expanded', String(!!abertos[l.id]));
      } }, 'Detalhes', icone(ICO_SETA));

    var origem = rotuloOrigem(l.origem);
    return h('article', { class: 'lead', 'data-id': l.id, 'data-novo': l.status === 'novo' ? '1' : null },
      h('div', { class: 'lead__principal' },
        h('div', { class: 'lead__quem' },
          h('span', { class: 'ini', 'aria-hidden': 'true' }, iniciais(l.nome)),
          h('div', { style: 'min-width:0' },
            h('div', { class: 'lead__nome' }, nome),
            h('div', { class: 'lead__sub' }, l.whatsapp + (origem ? ' · ' + origem : '') + (ehExemplo(l) ? ' · exemplo' : '')))),
        h('div', { class: 'lead__plano' }, PLANOS[l.plano] || l.plano || '—'),
        h('div', { class: 'estado' }, h('i', { style: '--cor:' + corStatus(l.status), 'aria-hidden': 'true' }), sel),
        h('time', { class: 'lead__quando', datetime: l.criadoEm, title: fmtData(l.criadoEm) }, relativo(l.criadoEm)),
        h('div', { class: 'lead__acoes' },
          h('a', { class: 'btn btn--marca btn--mini btn-zap', href: linkZap(l), target: '_blank', rel: 'noopener', 'aria-label': 'Responder ' + nome + ' no WhatsApp' }, icone(ICO_ZAP), 'Responder'),
          bDet)),
      det);
  }

  function limparFiltros() {
    filtro.q = ''; filtro.status = ''; filtro.plano = '';
    $('busca').value = ''; $('f-plano').value = '';
    atualizarResumo(); renderLista();
  }

  function renderLista() {
    var alvo = $('lista'), lista = filtrados();
    alvo.textContent = '';
    $('total-lista').textContent = leads.length ? lista.length + ' de ' + plural(leads.length, 'contato', 'contatos') : '';
    if (!lista.length) {
      alvo.appendChild(leads.length
        ? h('div', { class: 'vazio' }, h('h2', {}, 'Nenhum contato com esse filtro'), h('p', { style: 'margin-bottom:16px' }, 'Limpe a busca ou escolha outro status para ver os demais.'),
            h('button', { class: 'btn btn--fantasma btn--mini', type: 'button', onclick: limparFiltros }, 'Limpar filtros'))
        : h('div', { class: 'vazio' }, h('h2', {}, 'Nenhum contato ainda'),
            h('p', {}, 'Quando alguém preencher o formulário do site, o contato aparece aqui. Para ver o painel preenchido, abra “Mais ações” e use “Carregar exemplos”.')));
      return;
    }
    lista.forEach(function (l) { alvo.appendChild(linha(l)); });
  }

  function render() { atualizarResumo(); renderLista(); }

  /* ---------------- Exportar / importar ---------------- */
  function baixar(nome, tipo, conteudo) {
    var url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    var a = h('a', { href: url, download: nome }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function celula(v) { // evita injeção de fórmula em planilhas
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  }
  function exportarCSV() {
    var cab = ['Data', 'Nome', 'WhatsApp', 'Interesse', 'Status', 'Nota', 'Origem'];
    var linhas = filtrados().map(function (l) {
      var st = STATUS.filter(function (s) { return s[0] === l.status; })[0];
      return [fmtData(l.criadoEm), l.nome, l.whatsapp, PLANOS[l.plano] || l.plano, st ? st[1] : l.status, l.nota, l.origem].map(celula).join(';');
    });
    baixar('contatos-denise.csv', 'text/csv;charset=utf-8', '﻿' + [cab.map(celula).join(';')].concat(linhas).join('\r\n'));
  }

  /* ---------------- Exemplos ---------------- */
  function exemplos() {
    var agora = Date.now(), h1 = 3600000, base = [
      ['Mariana Albuquerque', '(81) 99999-0001', 'saude', 'novo', 0.5, '', 'instagram/bio'],
      ['Rafael Teixeira', '(81) 99999-0002', 'auto', 'novo', 5, '', 'site'],
      ['Camila Duarte', '(81) 99999-0003', 'saude', 'contatado', 26, 'Quer incluir os dois filhos. Retornar na sexta.', 'instagram/stories'],
      ['Joana Pessoa', '(81) 99999-0004', 'viagem', 'cotacao', 52, 'Viagem para Lisboa em março. Cotação enviada.', 'google/perfil-google'],
      ['Paulo Henrique Lima', '(81) 99999-0005', 'vida', 'fechado', 120, 'Contratou. Renovação em 12 meses.', 'whatsapp/status'],
      ['Beatriz Cavalcanti', '(81) 99999-0006', 'orientacao', 'descartado', 200, 'Sem interesse no momento.', 'instagram/reels']
    ];
    var n = mesclar(base.map(function (b, i) {
      return { id: 'exemplo-' + i, criadoEm: new Date(agora - b[4] * h1).toISOString(), nome: b[0], whatsapp: b[1], plano: b[2], status: b[3], nota: b[5], origem: b[6] };
    }));
    salvar(); render(); aviso(n ? 'Exemplos carregados. Eles aparecem marcados como exemplo.' : 'Os exemplos já estão na lista.');
  }

  /* ---------------- Painel ---------------- */
  function fecharMenus(exceto) {
    document.querySelectorAll('.menu-acoes[open]').forEach(function (d) { if (d !== exceto) d.removeAttribute('open'); });
  }

  function iniciarPainel() {
    $('app').hidden = false;
    carregar();

    // Filtros por status (com contagem) e por interesse
    var area = $('chips');
    [['', 'Todos', null]].concat(STATUS).forEach(function (s) {
      var b = h('button', { class: 'chip', type: 'button', 'data-status': s[0], 'aria-pressed': String(s[0] === '') },
        s[2] ? h('i', { style: '--cor:' + s[2], 'aria-hidden': 'true' }) : null, s[1], h('b', {}, '0'));
      b.addEventListener('click', function () { filtro.status = s[0]; atualizarResumo(); renderLista(); });
      chips[s[0]] = b; area.appendChild(b);
    });
    var fp = $('f-plano');
    fp.appendChild(h('option', { value: '' }, 'Todos os interesses'));
    Object.keys(PLANOS).forEach(function (k) { fp.appendChild(h('option', { value: k }, PLANOS[k])); });
    $('busca').addEventListener('input', function (e) { filtro.q = e.target.value.trim(); renderLista(); });
    fp.addEventListener('change', function () { filtro.plano = fp.value; renderLista(); });
    $('atencao-btn').addEventListener('click', function () { filtro.status = 'novo'; atualizarResumo(); renderLista(); });

    // Menus "Mais ações": fecham ao clicar fora, em um item ou com Esc
    document.addEventListener('click', function (e) {
      var d = e.target.closest ? e.target.closest('.menu-acoes') : null;
      fecharMenus(d);
      if (d && e.target.closest('.menu-acoes__lista button')) setTimeout(function () { d.removeAttribute('open'); }, 0);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenus(null); });

    $('btn-csv').addEventListener('click', exportarCSV);
    $('btn-json').addEventListener('click', function () { baixar('backup-contatos-denise.json', 'application/json', JSON.stringify(leads, null, 2)); });
    $('btn-importar').addEventListener('click', function () { $('arquivo').click(); });
    $('arquivo').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { var arr = JSON.parse(r.result); if (!Array.isArray(arr)) throw 0; var n = mesclar(arr); salvar(); render(); aviso(plural(n, 'contato importado', 'contatos importados') + '.'); }
        catch (err) { aviso('Arquivo inválido. Use um backup JSON exportado por este painel.'); }
        e.target.value = '';
      };
      r.readAsText(f);
    });
    $('btn-exemplos').addEventListener('click', exemplos);
    $('btn-apagar-exemplos').addEventListener('click', function () { leads = leads.filter(function (l) { return !ehExemplo(l); }); salvar(); render(); });
    $('btn-limpar').addEventListener('click', function () {
      if (!leads.length) return;
      if (!confirm('Apagar TODOS os contatos deste painel? Faça um backup antes. Isso não pode ser desfeito.')) return;
      leads = []; abertos = {}; salvar(); render();
    });
    $('btn-sair').addEventListener('click', function () { try { sessionStorage.removeItem(K_SESSAO); } catch (e) { /* ok */ } location.reload(); });

    render();

    // Seções: Contatos | Acessos | Links
    var acessos = null, links = null;
    var abas = [['tab-contatos', 'aba-contatos', 'Contatos'], ['tab-acessos', 'aba-acessos', 'Acessos'], ['tab-links', 'aba-links', 'Links']];
    function abrirAba(idx) {
      abas.forEach(function (a, i) {
        $(a[0]).setAttribute('aria-selected', String(i === idx)); $(a[0]).tabIndex = i === idx ? 0 : -1; $(a[1]).hidden = i !== idx;
      });
      document.title = abas[idx][2] + ' – Painel – Denise Macêdo';
      if (idx === 1) {
        if (!acessos) acessos = window.PainelAcessos.iniciar({ h: h, $: $, lerJSON: lerJSON, gravar: gravar, lerTexto: lerTexto, aviso: aviso });
        else acessos.render();
      }
      if (idx === 2 && !links) links = window.PainelLinks.iniciar({ h: h, $: $, lerTexto: lerTexto, gravar: gravar, aviso: aviso });
      try { sessionStorage.setItem(K_ABA, String(idx)); } catch (e) { /* ok */ }
      window.scrollTo(0, 0);
    }
    abas.forEach(function (a, i) {
      $(a[0]).addEventListener('click', function () { abrirAba(i); });
      $(a[0]).addEventListener('keydown', function (e) {
        var passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!passo) return;
        e.preventDefault();
        var j = (i + passo + abas.length) % abas.length; abrirAba(j); $(abas[j][0]).focus();
      });
    });
    var ultima = 0; try { ultima = Number(sessionStorage.getItem(K_ABA)) || 0; } catch (e) { /* ok */ }
    if (ultima > 0 && ultima < abas.length) abrirAba(ultima);
  }

  var sessao = false; try { sessao = sessionStorage.getItem(K_SESSAO) === '1' && !!hashEsperado(); } catch (e) { /* ok */ }
  if (sessao) iniciarPainel(); else iniciarAcesso();
})();
