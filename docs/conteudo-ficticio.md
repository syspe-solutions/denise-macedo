# Conteúdo fictício (MVP frontend)

Este site é um MVP de interface, sem dados reais. Tudo abaixo é inventado e precisa ser trocado antes de publicar de verdade. A página mostra avisos de demonstração (rodapé e seção de depoimentos) que também devem sair.

| O quê | Valor fictício | Onde está |
|---|---|---|
| Registro SUSEP | `SUSEP 202600000` | `index.html` (carimbo da foto, ficha, rodapé) e `privacidade.html` |
| CNPJ | `00.000.000/0001-00` | `index.html` (ficha e rodapé) e `privacidade.html` |
| E-mail | `contato@denisemacedo.example` | `index.html` (contato) e `privacidade.html` |
| Prazo de resposta | `2 horas úteis` | `index.html` (topo, ficha, FAQ) |
| Seguradoras | Aurora Saúde, Maré Seguros, Farol Vida, Ipê Proteção, Atlântica Mútua | `index.html` (faixa de seguradoras) |
| Depoimentos | 3 textos, com Camila R., Rafael T. e Beatriz C. | `index.html` (seção de depoimentos) |
| Remuneração (FAQ) | texto sobre comissão da seguradora | `index.html` (FAQ) |
| Endereço da imagem de compartilhamento | `__SITE_URL__` (trocado no deploy pelo endereço do GitHub Pages) | `index.html` (`og:image`) |
| Política de privacidade | data, prazo de 24 meses e local dos dados | `privacidade.html` |
| Dados de exemplo do painel | contatos e 30 dias de acessos | botão "Carregar exemplos" em `admin.html` (marcados como exemplo) |

Já são reais e não precisam trocar: o WhatsApp (81) 98564-5355 e o Instagram @denisemcmacedo, que vieram do mockup original.

O site sai com `noindex` (não aparece no Google) enquanto o conteúdo for fictício. Para abrir quando houver dados reais, ligue a chave `INDEXAR_SITE` do repositório e rode o workflow de novo (comandos no README, seção "Abrir o site para o Google"). O `canonical` e a imagem de compartilhamento já usam o endereço real do Pages, e mudam sozinhos com um domínio próprio. Os arquivos de `docs/` não são publicados: só a pasta `site/` vai para o GitHub Pages.
