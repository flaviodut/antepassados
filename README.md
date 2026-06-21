[![Netlify Status](https://api.netlify.com/api/v1/badges/249d38d2-4c8b-4bb1-beb0-b89b7b67b668/deploy-status)](https://app.netlify.com/projects/meus-antepassados/deploys)

# Antepassados

Sítio/blog dedicado às minhas descobertas genealógicas e histórias familiares.

## Stack

Este sítio é gerado com [Eleventy](https://www.11ty.dev/) (templates em Nunjucks e Markdown), usando [Luxon](https://moment.github.io/luxon/) para formatação de datas em português.

## Estrutura

```
src/
  _data/        dados globais (site, categorias reservadas)
  _includes/    partials e layouts (Nunjucks)
  posts/        posts do blog (Markdown)
  assets/       css, js, imagens e arquivos enviados nos posts
  categorias.md, index.njk, sitemap.njk, feed.njk, ...
eleventy.config.js  configuração do Eleventy (filtros, shortcodes, coleções)
```

## Desenvolvimento

Requer Node.js (versão definida em `.nvmrc`).

```bash
npm install
npm run serve   # build com servidor local e reload automático
npm run build   # build de produção, gera o site em ./_site
npm run debug   # build com logs de debug do Eleventy
```

## License

The theme is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
