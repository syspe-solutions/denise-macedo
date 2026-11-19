---
name: design-autoral
description: Use em qualquer trabalho visual deste projeto (landing page, seção, componente, paleta, tipografia, CSS). Evita o visual genérico de IA e a montagem padrão de componentes (cards iguais, ícone em quadrado, pílulas, hero centralizado). Obriga a definir um plano de design específico do assunto antes de escrever código.
---

# Design autoral

Objetivo: cada página deve parecer desenhada para **este** cliente e **este** assunto, e não gerada a partir de um molde. Se o resultado serviria para qualquer outra corretora, clínica ou startup trocando só o texto, o trabalho não terminou.

Ordem de precedência: 1) o que o usuário pediu, 2) o sistema de design que já existe no projeto, 3) estas regras. Se o usuário pedir explicitamente um dos padrões proibidos abaixo, siga o pedido dele.

## 1. Antes de escrever código: plano de design (obrigatório)

Escreva no topo do CSS, como comentário e tokens, e não na resposta:

1. **Assunto, público e tarefa única da página.** Uma frase cada.
2. **Um detalhe que só este assunto tem**, usado como conteúdo e não como enfeite. Exemplos para seguros: termos de ofício (carência, franquia, capital segurado, sinistro), campos de apólice, número SUSEP, prazos reais, a cidade e o jeito de falar do cliente.
3. **Conceito de layout em uma linha** (ex.: "a página é uma pasta de apólice: índice em linhas, ficha de dados, selos").
4. **Cor:** 4 a 6 tokens nomeados. Um neutro com viés de matiz (nunca cinza puro), uma tinta escura, **uma** cor ousada usada em poucos pontos, uma cor de apoio.
5. **Tipografia:** 3 papéis. Display com personalidade, texto, utilitária (mono ou condensada) para rótulos e dados.
6. **Onde está a ousadia.** Escolha um único lugar para correr um risco visual real. O resto fica quieto.

Releia o plano contra o assunto. Se alguma parte for o que você faria para qualquer página parecida, troque antes de construir.

## 2. Combinações de IA proibidas por padrão

- Creme/bege (#F4F1EA e vizinhos) + serifada de display (Fraunces, Playfair, Cormorant, Instrument Serif) + terracota.
- Quase preto + um único toque verde-ácido ou vermelhão.
- Gradiente roxo→azul sobre branco.
- Inter, Roboto, Space Grotesk ou system-ui como "escolha segura" de fonte principal.
- Verde-azulado escuro + creme + dourado como "elegância".
- Filetes finos em jornal com colunas densas quando o assunto não é editorial.

## 3. Montagem de componentes proibida por padrão

Estes são os arranjos que o Claude Code e modelos parecidos produzem sem pensar:

- Hero centralizado com selo em pílula, título, subtítulo e dois botões lado a lado.
- Grade de 3 ou 6 cards idênticos, com o mesmo raio, borda e sombra em tudo.
- Ícone dentro de quadrado arredondado com cor suave, acima do título do card.
- Raio grande (`rounded-xl`/20px+) em tudo, botões e etiquetas em pílula.
- Barra ou trilho colorido na lateral de um card arredondado.
- Numeração decorativa 01/02/03 em coisas que não são uma sequência real.
- Emoji como marcador de seção.
- Faixa de "estatísticas" com números grandes sem número real para mostrar.
- Tudo centralizado, tudo com o mesmo espaçamento vertical, todas as seções com o mesmo desenho.
- Depoimentos em três cards iguais com aspas em ícone.
- FAQ em caixas arredondadas separadas.

Alternativas a considerar: índice em linhas com régua, tabela/ficha com rótulos em mono, colunas separadas por filete, composição assimétrica, texto grande alinhado à esquerda, recorte de foto com forma própria, seções com desenhos diferentes entre si, raio pequeno ou zero, sombras duras em poucos elementos.

## 4. Regras de execução

- **Cards são exceção.** Borda, fundo e sombra marcam um objeto separado. Use em um elemento que precise disso, não em todos.
- **Hierarquia por escala e peso**, não por caixa. Títulos com `text-wrap: balance`, texto corrido entre 60 e 70 caracteres.
- **Estrutura é informação.** Número, rótulo ou divisor só entra se codificar algo verdadeiro (ordem real, categoria real).
- **Movimento:** um momento orquestrado no máximo, mais hovers úteis. Respeitar `prefers-reduced-motion`.
- **Conteúdo real.** Nada de lorem ipsum. Quando o dado não existe, manter o marcador `[ASSIM]` visível em vez de inventar número ou depoimento.
- **Mobile primeiro de verdade:** viewport meta, gutter mínimo de 16px, nada com largura mínima maior que a tela, nenhuma rolagem horizontal da página. Para listas longas, prefira um desenho compacto (linhas) a empilhar cards altos.
- **Acessibilidade:** contraste mínimo 4,5:1 no texto (calcular, não estimar), `:focus-visible` visível, alvos de toque de 44px ou mais, campos com `label`.
- **Desempenho:** imagens em WebP/AVIF com `width` e `height`, fontes com `preconnect` e `display=swap`, sem framework para uma página estática.
- **Texto da interface:** direto, na voz de quem fala com o cliente. Evitar construções do tipo "não é X, é Y" e frases de efeito vazias.

## 5. Checklist de saída (responder mentalmente antes de entregar)

- [ ] Existe um detalhe visual ou de conteúdo que só este assunto teria?
- [ ] A página evita todas as combinações da seção 2 e todos os arranjos da seção 3?
- [ ] Há pelo menos duas seções com desenho diferente entre si?
- [ ] A ousadia está em um só lugar?
- [ ] Contraste calculado, foco visível, 320px sem corte, sem rolagem horizontal?
- [ ] O plano de design está escrito no topo do CSS e o código o segue?

Entregue com no máximo uma frase sobre a direção visual. Os valores (hex, nomes de fonte) ficam no código.
