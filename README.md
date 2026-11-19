# Denise Macêdo · Planos de saúde e seguros

Landing page e painel da corretora Denise Macêdo (Recife). É um **MVP de interface**: HTML, CSS e JavaScript puros, sem build e sem servidor. Todo o conteúdo (SUSEP, CNPJ, depoimentos, seguradoras) é **fictício**, listado em [`docs/conteudo-ficticio.md`](docs/conteudo-ficticio.md).

## Estrutura

```
.
├── site/                       Tudo o que é publicado no GitHub Pages
│   ├── index.html              Landing page
│   ├── admin.html              Painel (contatos, acessos e links rastreados)
│   ├── privacidade.html        Política de privacidade (modelo)
│   ├── assets/                 Foto da Denise e imagem de compartilhamento
│   ├── css/
│   │   ├── styles.css          Estilos do site (tokens e plano de design no topo)
│   │   └── admin.css           Estilos do painel
│   └── js/
│       ├── config.js           Configuração (código de acesso do painel)
│       ├── script.js           Formulário, WhatsApp, FAQ e barra fixa
│       ├── analytics.js        Medição de acessos anônima e origem (utm)
│       ├── admin.js            Painel: acesso, contatos, abas
│       ├── admin-acessos.js    Painel: acessos e insights
│       └── admin-links.js      Painel: gerador de links rastreados
├── docs/                       Documentação interna (não é publicada)
├── design/mockup-original/     Mockup exportado do design, só como referência
├── .claude/skills/             Regras de design usadas nos trabalhos visuais
├── .github/workflows/          Publicação automática no GitHub Pages
├── CLAUDE.md                   Convenções do projeto para o Claude Code
└── README.md
```

## Rodar localmente

```bash
python3 -m http.server 8000 --directory site
# abra http://localhost:8000
```

Use um servidor local (e não abrir o arquivo direto) para a criptografia do código do painel e os links funcionarem como no ar.

## Publicar no GitHub Pages (organização `syspe-solutions`)

O site publicado fica em https://syspe-solutions.github.io/denise-macedo/

1. O código vai para a branch `main` do repositório `syspe-solutions/denise-macedo`.
2. Em **Settings → Pages → Build and deployment**, a origem é **GitHub Actions** (já configurado).
3. A cada push na `main`, o workflow `Publicar no GitHub Pages` publica a pasta `site/`. O endereço aparece na aba **Actions** e em **Settings → Pages**.

Endereços possíveis:

- Repositório comum, por exemplo `denise`: `https://syspe-solutions.github.io/denise/`
- Repositório chamado `syspe-solutions.github.io`: `https://syspe-solutions.github.io/`
- Domínio próprio: crie o arquivo `site/CNAME` com o domínio (ex.: `www.seudominio.com.br`), aponte o DNS e marque **Enforce HTTPS** em Settings → Pages.

Todos os caminhos do site são relativos, então funciona igual em qualquer um desses endereços. O workflow troca o `__SITE_URL__` do `og:image` pelo endereço real durante a publicação.

Repositórios privados só publicam no Pages em alguns planos pagos da organização.

## Cuidados

- O site tem `noindex` (não aparece no Google) enquanto o conteúdo for fictício. Remova a tag `robots` do `site/index.html` ao publicar com dados reais.
- `admin.html` fica acessível a quem souber o endereço. O código de acesso só esconde a tela e os dados ficam no navegador de quem usa (localStorage). Não coloque dados reais de clientes nele sem proteger a página (ex.: Cloudflare Access) e sem um servidor.
- Contatos e acessos não saem do navegador: não há integração com planilha nem servidor.
