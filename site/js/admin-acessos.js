/* Aba "Acessos" do painel: números por opção e leitura automática (insights). */
(function () {
  'use strict';

  var K_EVENTOS = 'denise_events_v1', K_NOTRACK = 'denise_no_track';
  var SECOES = [['produtos', 'O que eu cuido'], ['como-funciona', 'Como funciona'], ['por-que', 'Por que comigo'],
    ['depoimentos', 'Depoimentos'], ['duvidas', 'Dúvidas'], ['contato', 'Contato']];
  var BOTOES = {
    'zap-topo': 'WhatsApp no cabeçalho', 'zap-contato': 'WhatsApp na seção de contato', 'zap-barra': 'Barra fixa do celular',
    'zap-rodape': 'WhatsApp no rodapé', 'cotacao-hero': '“Quero minha cotação” (topo)', 'ver-produtos': '“Ver o que eu cuido” (topo)',
    'instagram': 'Instagram (rodapé)', 'menu-produtos': 'Menu: O que eu cuido', 'menu-como-funciona': 'Menu: Como funciona',
    'menu-duvidas': 'Menu: Dúvidas'
  };
  var PLANOS = {
    saude: 'Plano de saúde', dental: 'Plano dental', vida: 'Seguro de vida', auto: 'Seguro auto',
    viagem: 'Seguro viagem', pet: 'Plano pet', orientacao: 'Quer orientação'
  };
  var PERGUNTAS = ['Falar com você tem algum custo?', 'Preciso já saber qual plano eu quero?', 'Em quanto tempo recebo a cotação?',
    'Você atende só na sua cidade?', 'E na hora de usar o plano, como funciona?'];
  var DIA = 86400000;
  var CAMPANHAS_EX = { instagram: [['bio', 50], ['stories', 25], ['reels', 25]], whatsapp: [['status', 60], ['boas-vindas', 40]], google: [['perfil-google', 100]], facebook: [['grupo-recife', 100]] };

  function pct(a, b) { return b ? Math.round(a * 100 / b) : 0; }
  function nomeOrigem(f) { return f ? f.charAt(0).toUpperCase() + f.slice(1) : 'Direto'; }

  window.PainelAcessos = { iniciar: iniciar };

  function iniciar(ctx) {
    var h = ctx.h, $ = ctx.$;
    var eventos = [], dias = 30;

    function carregar() { var l = ctx.lerJSON(K_EVENTOS, []); eventos = Array.isArray(l) ? l : []; }
    function salvar() { if (!ctx.gravar(K_EVENTOS, eventos)) ctx.aviso('Não foi possível salvar neste navegador.'); }

    /* ---------- cálculo ---------- */
    function inicioPeriodo() {
      if (dias === 0) return 0;
      var d = new Date(); d.setHours(0, 0, 0, 0);
      return d.getTime() - (dias - 1) * DIA;
    }
    function contar(obj, k) { obj[k] = (obj[k] || 0) + 1; }
    function ordenar(obj) { return Object.keys(obj).map(function (k) { return [k, obj[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }

    function calcular(ini, fim) {
      var ev = eventos.filter(function (e) { return e.t >= ini && e.t < fim; });
      var info = {}, unicos = {}, M = {
        produtos: {}, camp: {}, botoes: {}, faq: {}, origem: {}, disp: {}, horas: [], funil: {}, zap: 0, zapBarra: 0, formInicio: {}, formEnvio: {}
      };
      var i; for (i = 0; i < 24; i++) M.horas.push(0);

      ev.forEach(function (e) {
        if (e.e === 'visita' && !info[e.s]) { info[e.s] = { f: e.f || 'direto', d: e.d || 'computador', c: e.o && e.o !== 'inicio' ? e.o : '' }; unicos[e.v] = 1; M.horas[new Date(e.t).getHours()]++; }
      });
      var contato = {};
      ev.forEach(function (e) {
        if (!info[e.s]) return;
        if (e.e === 'clique') {
          if (e.o.indexOf('produto:') === 0) { var p = e.o.slice(8); M.produtos[p] = M.produtos[p] || { c: 0, f: 0 }; M.produtos[p].c++; }
          else {
            contar(M.botoes, e.o);
            if (e.o.indexOf('zap-') === 0) { M.zap++; contato[e.s] = 1; if (e.o === 'zap-barra') M.zapBarra++; }
          }
        } else if (e.e === 'secao') {
          M.funil[e.o] = M.funil[e.o] || {}; M.funil[e.o][e.s] = 1;
        } else if (e.e === 'faq') { contar(M.faq, e.o); }
        else if (e.e === 'form-inicio') { M.formInicio[e.s] = 1; }
        else if (e.e === 'form-envio') {
          M.formEnvio[e.s] = 1; contato[e.s] = 1;
          M.produtos[e.o] = M.produtos[e.o] || { c: 0, f: 0 }; M.produtos[e.o].f++;
        }
      });
      var sessoes = Object.keys(info);
      M.visitas = sessoes.length;
      M.unicos = Object.keys(unicos).length;
      M.contato = Object.keys(contato).length;
      sessoes.forEach(function (s) {
        var o = M.origem[info[s].f] = M.origem[info[s].f] || { v: 0, c: 0 }; o.v++; if (contato[s]) o.c++;
        if (info[s].c) { var kc = info[s].f + '|' + info[s].c; var cc = M.camp[kc] = M.camp[kc] || { v: 0, c: 0 }; cc.v++; if (contato[s]) cc.c++; }
        var d = M.disp[info[s].d] = M.disp[info[s].d] || { v: 0, c: 0 }; d.v++; if (contato[s]) d.c++;
      });
      return M;
    }

    /* ---------- desenho ---------- */
    function negrito(txt) { // **trecho** vira <b>; tudo é inserido como texto (seguro)
      var f = document.createDocumentFragment();
      txt.split('**').forEach(function (parte, i) { f.appendChild(i % 2 ? h('b', {}, parte) : document.createTextNode(parte)); });
      return f;
    }
    function barras(alvo, linhas, max) {
      alvo.textContent = '';
      if (!linhas.length) { alvo.appendChild(h('p', { class: 'sem-dados' }, 'Sem dados no período.')); return; }
      max = max || Math.max.apply(null, linhas.map(function (l) { return l.val; })) || 1;
      linhas.forEach(function (l) {
        alvo.appendChild(h('div', { class: 'barra-linha' },
          h('span', { class: 'rot' }, l.rot),
          h('span', { class: 'val' }, l.txt, l.extra ? h('small', {}, l.extra) : null),
          h('div', { class: 'trilho' }, h('i', { style: '--p:' + Math.max(2, Math.round(l.val * 100 / max)) + '%' }))));
      });
    }
    function colunas(alvo, valores, rotulos) {
      alvo.textContent = '';
      var max = Math.max.apply(null, valores) || 1, pico = valores.indexOf(max);
      valores.forEach(function (v, i) {
        alvo.appendChild(h('span', { style: '--h:' + Math.round(v * 100 / max) + '%', class: v && i === pico ? 'pico' : '', title: rotulos[i] + ': ' + v }));
      });
    }

    function insights(M) {
      var ins = [], c = function (n, s, p) { return n + ' ' + (n === 1 ? s : p); };
      var periodo = dias === 1 ? 'hoje' : dias === 0 ? 'no total' : 'nos últimos ' + dias + ' dias';
      if (!M.visitas) return ['Ainda não há visitas ' + periodo + '. Quando o site receber acessos, a leitura aparece aqui.'];

      var cel = (M.disp.celular || { v: 0 }).v;
      ins.push('**' + c(M.visitas, 'visita', 'visitas') + '** de **' + c(M.unicos, 'pessoa', 'pessoas') + '** ' + periodo + '. **' + pct(cel, M.visitas) + '%** vieram do celular' +
        (pct(cel, M.visitas) >= 60 ? ', então a experiência no celular é a que mais importa.' : '.'));
      ins.push('**' + pct(M.contato, M.visitas) + '%** das visitas chegaram ao contato (clicaram no WhatsApp ou enviaram o formulário).' +
        (M.zapBarra ? ' A barra fixa do celular gerou **' + c(M.zapBarra, 'clique', 'cliques') + '**, ' + pct(M.zapBarra, M.zap) + '% de todos os cliques no WhatsApp.' : ''));

      // produtos
      var lista = Object.keys(M.produtos).map(function (k) { return [k, M.produtos[k].c + M.produtos[k].f]; }).sort(function (a, b) { return b[1] - a[1]; });
      var totalProd = lista.reduce(function (s, x) { return s + x[1]; }, 0);
      if (totalProd) {
        ins.push('**' + (PLANOS[lista[0][0]] || lista[0][0]) + '** é o mais procurado: ' + c(lista[0][1], 'interesse', 'interesses') + ' (' + pct(lista[0][1], totalProd) + '% do total em produtos).');
        var pos = lista.map(function (x) { return x[0]; }).indexOf('saude');
        if (pos > 0) ins.push('Plano de saúde, sua especialidade, está em **' + (pos + 1) + 'º lugar** no interesse. Vale reforçar esse produto no topo da página.');
        if (pos === -1) ins.push('**Ninguém pediu cotação de plano de saúde** no período, mesmo sendo a especialidade. Vale testar o texto do primeiro item da lista.');
      }

      // funil
      var alcance = SECOES.map(function (s) { return Object.keys(M.funil[s[0]] || {}).length; });
      var queda = null;
      for (var i = 0; i < alcance.length - 1; i++) {
        if (alcance[i] > 0) {
          var perda = pct(alcance[i] - alcance[i + 1], M.visitas);
          if (!queda || perda > queda.perda) queda = { de: i, perda: perda, fica: pct(alcance[i + 1], alcance[i]) };
        }
      }
      if (queda && queda.perda >= 8) {
        ins.push('A maior queda está entre **' + SECOES[queda.de][1] + '** e **' + SECOES[queda.de + 1][1] + '**: só ' + queda.fica + '% de quem chega numa seção segue para a próxima.');
      }

      // origem e aparelho
      var origens = Object.keys(M.origem).map(function (k) { return [k, M.origem[k]]; }).sort(function (a, b) { return b[1].v - a[1].v; });
      if (origens.length) {
        var topo = origens[0], txt = '**' + nomeOrigem(topo[0]) + '** traz mais visitas (' + pct(topo[1].v, M.visitas) + '%).';
        var boas = origens.filter(function (o) { return o[1].v >= 5; }).sort(function (a, b) { return pct(b[1].c, b[1].v) - pct(a[1].c, a[1].v); });
        if (boas.length > 1 && boas[0][0] !== topo[0] && pct(boas[0][1].c, boas[0][1].v) > pct(topo[1].c, topo[1].v)) {
          txt += ' Quem mais converte é **' + nomeOrigem(boas[0][0]) + '** (' + pct(boas[0][1].c, boas[0][1].v) + '% chegam ao contato).';
        }
        ins.push(txt);
      }
      var camps = Object.keys(M.camp).map(function (k) { return [k.split('|'), M.camp[k]]; }).sort(function (x, y) { return y[1].v - x[1].v; });
      if (camps.length) ins.push('O link que mais trouxe visitas foi **' + nomeOrigem(camps[0][0][0]) + ' · ' + camps[0][0][1] + '** (' + c(camps[0][1].v, 'visita', 'visitas') + ', ' + pct(camps[0][1].c, camps[0][1].v) + '% chegaram ao contato).');
      var pc = M.disp.computador, ce = M.disp.celular;
      if (pc && ce && pc.v >= 5 && ce.v >= 5) {
        var a = pct(ce.c, ce.v), b = pct(pc.c, pc.v);
        if (Math.abs(a - b) >= 5) ins.push('A taxa de contato é **' + (a > b ? 'maior no celular' : 'maior no computador') + '** (' + (a > b ? a + '% contra ' + b : b + '% contra ' + a) + '%).');
      }

      // formulário
      var ini = Object.keys(M.formInicio).length, env = Object.keys(M.formEnvio).length;
      if (ini >= 3) ins.push('**' + c(ini, 'pessoa começou', 'pessoas começaram') + '** o formulário e ' + env + ' enviaram: **' + pct(ini - Math.min(env, ini), ini) + '%** desistiram no meio. Menos campos ou o botão direto do WhatsApp podem ajudar.');

      // horário e dúvidas
      var max = Math.max.apply(null, M.horas);
      if (M.visitas >= 10 && max > 0) { var hp = M.horas.indexOf(max); ins.push('O horário de pico é entre **' + hp + 'h e ' + ((hp + 1) % 24) + 'h** (' + c(max, 'visita', 'visitas') + '). É um bom momento para postar e responder rápido.'); }
      var faq = ordenar(M.faq);
      if (faq.length) ins.push('A dúvida mais aberta é **“' + faq[0][0] + '”** (' + c(faq[0][1], 'vez', 'vezes') + '). Considere responder isso mais acima na página.');
      var bots = ordenar(M.botoes).filter(function (x) { return x[0].indexOf('menu-') !== 0; });
      if (bots.length) ins.push('O botão mais clicado é **' + (BOTOES[bots[0][0]] || bots[0][0]) + '** (' + c(bots[0][1], 'clique', 'cliques') + ').');

      return ins.slice(0, 9);
    }

    function render() {
      var ini = inicioPeriodo(), M = calcular(ini, Infinity), P = null;
      if (dias >= 7) P = calcular(ini - (Date.now() - ini), ini); // período anterior, com a mesma duração

      // Compara com o período anterior (só quando há base suficiente para não enganar)
      function mudanca(atual, antes, minimo, pontos) {
        if (!P || antes < minimo) return null;
        var v = pontos ? atual - antes : Math.round((atual - antes) * 100 / antes);
        return h('span', { class: 'delta ' + (v > 0 ? 'delta--up' : v < 0 ? 'delta--down' : 'delta--igual') },
          (v > 0 ? '▲ ' : v < 0 ? '▼ ' : '= ') + Math.abs(v) + (pontos ? ' pp' : '%'));
      }
      function nota(id, delta, detalhe) {
        var el = $(id); el.textContent = '';
        if (delta) { el.appendChild(delta); el.appendChild(document.createTextNode(' vs. período anterior')); el.appendChild(h('br')); }
        el.appendChild(document.createTextNode(detalhe));
      }
      var conv = pct(M.contato, M.visitas);
      $('ac-visitas').textContent = M.visitas;
      nota('ac-visitas-nota', mudanca(M.visitas, P ? P.visitas : 0, 5), M.visitas ? pct((M.disp.celular || { v: 0 }).v, M.visitas) + '% pelo celular' : 'sem visitas no período');
      $('ac-unicos').textContent = M.unicos;
      nota('ac-unicos-nota', mudanca(M.unicos, P ? P.unicos : 0, 5), 'pessoas diferentes');
      $('ac-conversao').textContent = conv + '%';
      nota('ac-conversao-nota', P && P.visitas >= 10 ? mudanca(conv, pct(P.contato, P.visitas), 0, true) : null, M.contato + ' de ' + M.visitas + ' visitas');
      $('ac-zap').textContent = M.zap;
      nota('ac-zap-nota', mudanca(M.zap, P ? P.zap : 0, 5), 'em todos os botões');

      var am = $('ac-amostra');
      am.hidden = !(M.visitas > 0 && M.visitas < 30);
      am.textContent = 'Poucos dados ainda (' + M.visitas + ' visitas). Leia como indicação, não como conclusão.';
      var ol = $('ac-insights'); ol.textContent = '';
      insights(M).forEach(function (t) { ol.appendChild(h('li', {}, negrito(t))); });

      barras($('ac-produtos'), Object.keys(PLANOS).map(function (k) { var p = M.produtos[k] || { c: 0, f: 0 };
        return { rot: PLANOS[k], val: p.c + p.f, txt: String(p.c + p.f), extra: p.c + ' cliques · ' + p.f + ' pelo formulário' }; })
        .filter(function (l) { return l.val > 0; }).sort(function (a, b) { return b.val - a.val; }));

      barras($('ac-funil'), [{ rot: 'Topo da página', val: M.visitas, txt: M.visitas ? '100%' : '0%', extra: '(' + M.visitas + ')' }].concat(
        SECOES.map(function (s) { var n = Object.keys(M.funil[s[0]] || {}).length; return { rot: s[1], val: n, txt: pct(n, M.visitas) + '%', extra: '(' + n + ')' }; })), M.visitas || 1);

      barras($('ac-botoes'), ordenar(M.botoes).slice(0, 8).map(function (x) { return { rot: BOTOES[x[0]] || x[0], val: x[1], txt: String(x[1]) }; }));
      barras($('ac-faq'), ordenar(M.faq).slice(0, 6).map(function (x) { return { rot: x[0], val: x[1], txt: String(x[1]) }; }));
      barras($('ac-origem'), Object.keys(M.origem).map(function (k) { var o = M.origem[k];
        return { rot: nomeOrigem(k), val: o.v, txt: String(o.v), extra: pct(o.c, o.v) + '% contato' }; }).sort(function (a, b) { return b.val - a.val; }).slice(0, 7));
      barras($('ac-campanhas'), Object.keys(M.camp).map(function (k) { var o = M.camp[k], p = k.split('|');
        return { rot: nomeOrigem(p[0]) + ' · ' + p[1], val: o.v, txt: String(o.v), extra: pct(o.c, o.v) + '% contato' }; }).sort(function (x, y) { return y.val - x.val; }).slice(0, 8));
      if (!Object.keys(M.camp).length) { $('ac-campanhas').textContent = ''; $('ac-campanhas').appendChild(h('p', { class: 'sem-dados' }, 'Nenhuma visita veio de link rastreado ainda. Use os links da aba “Links” na bio e nas divulgações.')); }
      barras($('ac-disp'), Object.keys(M.disp).map(function (k) { var o = M.disp[k];
        return { rot: nomeOrigem(k), val: o.v, txt: pct(o.v, M.visitas) + '%', extra: pct(o.c, o.v) + '% contato' }; }).sort(function (a, b) { return b.val - a.val; }));

      // visitas por dia (últimos dias, independente do filtro "Hoje")
      var n = dias === 0 ? 30 : Math.max(dias, 7), hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      var porDia = [], rot = [], k;
      for (k = 0; k < n; k++) porDia.push(0);
      var vistos = {};
      eventos.forEach(function (e) {
        if (e.e !== 'visita' || vistos[e.s]) return; vistos[e.s] = 1;
        var idx = n - 1 - Math.floor((hoje.getTime() - new Date(new Date(e.t).setHours(0, 0, 0, 0)).getTime()) / DIA);
        if (idx >= 0 && idx < n) porDia[idx]++;
      });
      for (k = 0; k < n; k++) { var d = new Date(hoje.getTime() - (n - 1 - k) * DIA); rot.push(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2)); }
      colunas($('ac-dias'), porDia, rot);
      var eixo = $('ac-dias-eixo'); eixo.textContent = '';
      [0, Math.floor((n - 1) / 2), n - 1].forEach(function (i) { eixo.appendChild(h('span', {}, rot[i])); });

      var hr = []; for (k = 0; k < 24; k++) hr.push(k + 'h');
      colunas($('ac-horas'), M.horas, hr);

      var temEx = eventos.some(function (e) { return e.x; });
      $('ac-apagar-exemplos').hidden = !temEx;
      var av = $('ac-aviso'); av.textContent = '';
      av.hidden = !temEx;
      if (temEx) av.appendChild(negrito('**Os números abaixo incluem dados de exemplo.** Use “Apagar exemplos” para ver só os acessos reais.'));
    }

    /* ---------- exemplos ---------- */
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function sorteio(r, pares) { var tot = pares.reduce(function (a, p) { return a + p[1]; }, 0), x = r() * tot; for (var i = 0; i < pares.length; i++) { x -= pares[i][1]; if (x <= 0) return pares[i][0]; } return pares[0][0]; }

    function gerarExemplos() {
      var r = rng(20261118), ev = [], base = new Date(); base.setHours(0, 0, 0, 0); base = base.getTime();
      var horas = [[6, 1], [7, 2], [8, 3], [9, 4], [10, 4], [11, 5], [12, 7], [13, 5], [14, 4], [15, 4], [16, 4], [17, 5], [18, 6], [19, 8], [20, 11], [21, 10], [22, 6], [23, 2], [0, 1], [1, 1]];
      var produtos = [['saude', 38], ['dental', 14], ['vida', 14], ['auto', 16], ['viagem', 10], ['pet', 8]];
      var passo = [0.8, 0.7, 0.75, 0.8, 0.9, 0.85];
      for (var dia = 29; dia >= 0; dia--) {
        var n = Math.round(5 + (30 - dia) * 0.18 + r() * 7);
        for (var i = 0; i < n; i++) {
          var t = base - dia * DIA + sorteio(r, horas) * 3600000 + Math.floor(r() * 3600000);
          if (t > Date.now()) continue;
          var disp = sorteio(r, [['celular', 72], ['computador', 23], ['tablet', 5]]);
          var f = sorteio(r, [['instagram', 52], ['direto', 22], ['google', 12], ['whatsapp', 9], ['facebook', 5]]);
          var camp = ''; if (CAMPANHAS_EX[f] && r() < 0.85) camp = sorteio(r, CAMPANHAS_EX[f]);
          var s = 'x' + dia + '-' + i, v = 'xv' + Math.floor(r() * 220);
          var add = function (e, o) { t += Math.floor(2000 + r() * 40000); ev.push({ t: t, s: s, v: v, e: e, o: o, d: disp, f: f, x: 1 }); };
          add('visita', camp);
          var vistas = 0;
          for (var k = 0; k < SECOES.length; k++) { if (r() < passo[k]) { add('secao', SECOES[k][0]); vistas++; } else break; }
          if (r() < 0.05) add('clique', 'menu-produtos');
          if (r() < 0.1) add('clique', 'cotacao-hero');
          if (vistas >= 1 && r() < 0.42) { add('clique', 'produto:' + sorteio(r, produtos)); if (r() < 0.1) add('clique', 'produto:' + sorteio(r, produtos)); }
          if (vistas >= 5 && r() < 0.55) add('faq', PERGUNTAS[Math.floor(r() * PERGUNTAS.length)]);
          var chance = (vistas >= 6 ? 0.4 : vistas >= 3 ? 0.12 : 0.05) * (f === 'instagram' ? 1.25 : 1);
          if (r() < chance) {
            if (disp === 'celular' && r() < 0.4) add('clique', 'zap-barra');
            else add('clique', sorteio(r, [['zap-topo', 30], ['zap-contato', vistas >= 6 ? 50 : 5], ['zap-rodape', 6]]));
          }
          if (vistas >= 6 && r() < 0.34) { add('form-inicio', ''); if (r() < 0.5) add('form-envio', sorteio(r, produtos)); }
        }
      }
      return ev;
    }

    /* ---------- ações ---------- */
    function notrack() { try { return localStorage.getItem(K_NOTRACK) === '1'; } catch (e) { return false; } }
    function pintarNotrack() {
      var b = $('ac-notrack'), on = notrack();
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Minhas visitas não são contadas (ligado)' : 'Não contar minhas visitas neste aparelho';
    }

    carregar();
    document.querySelectorAll('.segmentado button').forEach(function (b) {
      b.addEventListener('click', function () {
        dias = Number(b.getAttribute('data-dias'));
        document.querySelectorAll('.segmentado button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
    });
    $('ac-exemplos').addEventListener('click', function () {
      eventos = eventos.filter(function (e) { return !e.x; }).concat(gerarExemplos()); salvar(); render();
      ctx.aviso('Exemplos carregados (30 dias). Eles não são dados reais.');
    });
    $('ac-apagar-exemplos').addEventListener('click', function () { eventos = eventos.filter(function (e) { return !e.x; }); salvar(); render(); });
    $('ac-apagar').addEventListener('click', function () {
      if (!eventos.length) return;
      if (!confirm('Apagar todos os dados de acesso guardados neste painel?')) return;
      eventos = []; salvar(); render();
    });
    $('ac-notrack').addEventListener('click', function () {
      try { if (notrack()) localStorage.removeItem(K_NOTRACK); else localStorage.setItem(K_NOTRACK, '1'); } catch (e) { ctx.aviso('Não foi possível salvar essa opção.'); }
      pintarNotrack();
    });
    pintarNotrack();
    render();
    return { render: function () { carregar(); render(); } };
  }
})();
