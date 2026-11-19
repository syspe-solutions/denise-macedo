# Avaliação da landing page: Denise Macêdo, Saúde & Seguros

Arquivo analisado: `design/mockup-original/Main.dc.html`. A análise foi feita lendo o código, conferindo a foto e calculando o contraste das cores. Não foram tirados prints em navegador, então os problemas de responsividade vêm da leitura do CSS, não de testes em aparelhos.

## Nota geral: 7,0 / 10

| Critério | Nota | Resumo |
|---|---|---|
| Identidade visual | **8,5** | A paleta verde e areia com terracota e a combinação das fontes Fraunces e Inter passam confiança e um tom acolhedor. É uma página com cara própria. |
| Texto e estrutura de venda | **8,0** | Os cards começam pela dor do cliente ("Bateu o carro. E agora?"), o "Como funciona" tem 3 passos e o FAQ responde objeções reais. |
| Hierarquia e ritmo | **6,5** | O topo tem elementos demais e a parte final da página fica monótona. |
| Responsividade | **5,0** | Tem um problema grave e alguns bugs de layout. |
| Acessibilidade | **6,0** | Vários textos e campos com contraste baixo, e nenhum estilo de foco. |
| Conversão | **6,0** | Os botões levam a destinos diferentes do que prometem e falta acesso fixo ao WhatsApp. |
| Desempenho e SEO | **5,0** | A foto é pesada e falta a prévia de link para compartilhar. |

---

## 🔴 Problemas críticos

**1. Falta a tag de viewport (o principal problema da página)**
O `<head>` (`Main.dc.html:3-9`) não tem `<meta name="viewport" content="width=device-width, initial-scale=1">`. Sem ela, o celular desenha a página com 980px de largura e depois encolhe tudo. O texto fica minúsculo e todo o trabalho com `clamp()`, `flex-wrap` e `auto-fit` deixa de funcionar. Como o público provavelmente vem do Instagram, ou seja, quase todo pelo celular, essa é a correção mais urgente.

**2. O círculo atrás da foto vira oval no celular**
Em `Main.dc.html:56`, o círculo tem `width: 450px; height: 450px; max-width: 94%; aspect-ratio: 1/1`. Quando a tela é estreita, a largura diminui, mas a altura fixa de 450px continua valendo e passa por cima do `aspect-ratio`. Em uma tela de 360px, o círculo fica com cerca de 300×450px.
→ Correção: trocar `height: 450px` por `height: auto`.

**3. Os cards transbordam em telas de 320px**
Em `Main.dc.html:81` e `:268`, as grades usam `minmax(290px, 1fr)`. Com margens laterais de 20px, sobram só 280px de espaço, e o `overflow-x: hidden` do container corta a borda direita dos cards.
→ Correção: `minmax(min(290px, 100%), 1fr)`. Vale o mesmo para as grades de 270px e 150px.

**4. Os botões não fazem o que dizem**
- O botão "Falar no WhatsApp" do cabeçalho (`:32`) leva ao formulário, não ao WhatsApp. O cliente que já decidiu conversar encontra um passo a mais.
- O formulário (`:429`) só mostra "Recebi seu contato" e não envia nada. Na prática, todo contato feito por ele é perdido.

→ Sugestão: fazer o formulário abrir `wa.me/5581985645355?text=` com uma mensagem já preenchida, do tipo "Olá, sou {nome}, tenho interesse em {plano}". Assim não é preciso ter servidor e o contato cai direto no canal que a Denise já usa.

---

## 🟠 Responsividade e experiência no celular

5. **Cabeçalho:** no celular, os 3 links e o botão quebram em 2 ou 3 linhas e ocupam cerca de 150px. Além disso, o cabeçalho não acompanha a rolagem.
   → Sugestão: esconder os links abaixo de 768px e deixar só a marca e o botão de WhatsApp, ou usar um menu hambúrguer. Vale também um cabeçalho fixo e compacto.

6. **Falta um botão de WhatsApp sempre visível.** Em corretoras, é o elemento que mais gera conversão. No celular, uma barra fixa no rodapé da tela com "Chamar no WhatsApp" resolve, já que a página é longa.

7. **O topo da página é longo no celular.** Antes da foto aparecem a etiqueta SUSEP, um título de 17 palavras, um parágrafo, o slogan, 2 botões e uma frase de apoio. A foto, que é o principal elemento de confiança para uma corretora autônoma, só aparece depois de rolar mais ou menos uma tela e meia.
   → Sugestões: no celular, mostrar a foto antes do texto (com `order: -1` e altura menor) ou usar um avatar redondo ao lado do nome. Encurtar o título, por exemplo: "Tranquilidade e proteção para você e sua família". Tirar ou rebaixar o slogan "Protegendo o que importa.", que disputa atenção com o título.

8. **Seis cards empilhados viram uma rolagem enorme no celular.** Cada card tem cerca de 300px de altura.
   → Sugestão: no celular, usar um carrossel horizontal com `scroll-snap`, ou uma lista compacta com ícone, título e seta, deixando só o card de plano de saúde (a especialidade) em tamanho grande.

9. **A faixa de seguradoras** com 5 itens centralizados quebra de forma irregular, por exemplo 2 + 2 + 1.
   → Sugestão: uma grade de 3 colunas, ou uma faixa com rolagem automática e os logos reais em tons de cinza.

---

## 🟡 Hierarquia e ritmo visual

10. **Fundos repetidos:** depois da seção escura "Como funciona", as seções "Por que comigo", depoimentos, FAQ e contato usam todas o mesmo fundo bege, e três delas têm `padding-top: 0`. Elas se misturam.
    → Sugestão: dar um fundo branco ou verde-claro (`#E3EFE9`) a toda a faixa de depoimentos para criar uma pausa visual.

11. **O destaque de "Minha especialidade" é fraco.** Hoje o card se diferencia só pela borda e pela etiqueta.
    → Sugestão: fazer esse card ocupar 2 colunas no desktop (`grid-column: span 2`), com fundo verde-escuro ou uma imagem, para que a especialidade fique evidente.

12. **Tudo é estático.** Como os estilos estão escritos direto nos elementos, não existe efeito de hover em botões e cards, nem animação ao abrir o FAQ.
    → Sugestão: passar os estilos para classes CSS e adicionar `:hover` (cards subindo levemente com sombra, botões escurecendo), uma transição no acordeão e `scroll-behavior: smooth`.

13. **Os números de destaque fazem pouco efeito.** "6 tipos de proteção" não impressiona e os outros três ainda são `[N]`. Se não houver números fortes, é melhor trocar por selos: SUSEP, avaliação no Google, "atendimento desde 20XX".

14. **Erro de concordância** em `:267`: "O que dizem quem já está protegido" deveria ser "O que dizem os clientes que já estão protegidos" ou "Quem já está protegido conta".

---

## 🟡 Acessibilidade e contraste (calculados pelos critérios WCAG AA)

| Elemento | Contraste | Mínimo exigido |
|---|---|---|
| Rótulos `#64807D` sobre o fundo bege (12–14px) | **3,79:1** ❌ | 4,5:1 |
| Nomes das seguradoras `#A79C8C` sobre branco | **2,70:1** ❌ | 4,5:1 |
| Borda dos campos do formulário `#456E6A` sobre `#1C3E3C` | **2,05:1** ❌ | 3:1 |
| Cor de destaque `#9E4524` sobre o fundo bege | 5,61:1 ✅ | — |
| Texto branco sobre o botão terracota | 6,31:1 ✅ | — |

- Escurecer `#64807D` para algo perto de `#56706D` e clarear a borda dos campos para cerca de `#6E9690`.
- Não há nenhum estilo de foco (`:focus-visible`) para quem navega pelo teclado.
- O formulário não tem campos obrigatórios (`required`), não formata o telefone e o seletor não tem uma opção inicial "Selecione…".
- O link "Política de privacidade" aponta para `#politica`, que não existe. Como a página coleta dados pessoais, essa política é exigida pela LGPD.

---

## 🟡 Desempenho e compartilhamento

- **A foto é um PNG de 700 KB.** Convertida para WebP ou AVIF, com cerca de 600px de largura, deve ficar entre 60 e 90 KB. Também vale adicionar `width` e `height` na tag para a página não "pular" enquanto carrega, e `fetchpriority="high"`.
- **A prévia de link (Open Graph) não existe**, nem a meta description. Quando alguém compartilhar o link no WhatsApp ou no Instagram, não vai aparecer foto nem título. Para esse público, isso pesa muito.
- Falta o favicon e o `preconnect` para `fonts.gstatic.com` com `crossorigin`.
- O React e o `support.js` só servem para a ferramenta de design. Em produção, a página deve ser HTML e CSS puros, com um pouco de JavaScript para o FAQ.

---

## Prioridade sugerida

1. Adicionar a tag de viewport e corrigir o círculo e o `minmax` (cerca de 10 minutos, maior impacto)
2. Fazer o formulário e os botões levarem direto ao WhatsApp, e adicionar o botão fixo no celular
3. Simplificar o cabeçalho no celular e reorganizar o topo (foto e título)
4. Ajustar o contraste e o foco, e criar a política de privacidade
5. Otimizar a foto e adicionar a prévia de link e o favicon
6. Mexer no ritmo visual (fundos, card de destaque, efeitos de hover)
7. Preencher os textos provisórios ([N], [PRAZO], [SEGURADORA], depoimentos). Hoje são a maior lacuna de credibilidade da página.
