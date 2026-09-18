# Next.js on Netlify Platform Starter

[Live Demo](https://nextjs-platform-starter.netlify.app/)

A modern starter based on Next.js 16 (App Router), Tailwind, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blob Store).

In this site, Netlify Core Primitives are used both implictly for running Next.js features (e.g. Route Handlers, image optimization via `next/image`, and more) and also explicitly by the user code.

Implicit usage means you're using any Next.js functionality and everything "just works" when deployed - all the plumbing is done for you. Explicit usage is framework-agnostic and typically provides more features than what Next.js exposes.

## Deploying to Netlify

Click the button below to deploy this template to your Netlify account.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/next-platform-starter)

## Developing Locally

1. Clone this repository, then run `npm install` in its root directory.

2. For the starter to have full functionality locally (e.g. edge functions, blob store), please ensure you have an up-to-date version of Netlify CLI. Run:

```
npm install netlify-cli@latest -g
```

3. Link your local repository to the deployed Netlify site. This will ensure you're using the same runtime version for both local development and your deployed site.

```
netlify link
```

4. Then, run the Next.js development server via Netlify CLI:

```
netlify dev
```

If your browser doesn't navigate to the site automatically, visit [localhost:8888](http://localhost:8888).

## Sistema de busca e alerta de aluguel em Fortaleza

Este starter foi estendido com um sistema de busca e alerta de imóveis (casas e apartamentos) para alugar em
Fortaleza:

- **Cadastro/login** (`/registrar`, `/entrar`) com sessão em cookie assinado.
- **Busca** (`/buscar`) com filtros de tipo, bairro, preço e quartos, sobre imóveis armazenados no Netlify Blobs.
- **Importar imóvel** (`/imoveis/importar`, requer login): você cola o link de um anúncio encontrado em qualquer
  site (ZAP Imóveis, OLX, QuintoAndar, grupo de WhatsApp, etc.) e o sistema lê as tags de pré-visualização
  públicas da página (título, descrição, imagem — as mesmas usadas para gerar preview de link) para agilizar o
  cadastro. **Isso não é um robô de coleta automática**: não fazemos crawling em massa desses sites, o que
  violaria os termos de uso da maioria deles e é tecnicamente frágil por causa de proteções anti-bot. Os dados
  vêm sempre um link por vez, revisados e completados manualmente antes de salvar.
- **Alertas** (`/alertas`, requer login): salve critérios de busca (bairro, preço, quartos) e ative notificações
  push no navegador. Quando alguém importa um imóvel compatível, os usuários com alerta correspondente recebem
  uma notificação push na hora.

### Configuração de variáveis de ambiente

Copie `.env.example` para `.env` (ou configure no painel do Netlify) e preencha:

- `AUTH_SECRET`: chave para assinar os cookies de sessão. Gere com `openssl rand -hex 32`.
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`: chaves para notificações push. Gere o par com
  `npx web-push generate-vapid-keys`. Sem essas chaves, o site funciona normalmente mas as notificações ficam
  desativadas.

## Resources

- Check out the [Next.js on Netlify docs](https://docs.netlify.com/frameworks/next-js/overview/)
