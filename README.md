# Zênite Motoboy — React + TypeScript (projeto de portfólio)

Landing page de uma empresa **fictícia** de motoboys, reescrita em **React 19 + TypeScript + Vite**. Marca, telefones, endereço e dados são inventados.

## Scripts
```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # checa os tipos (tsc) e gera /dist
npm run preview    # serve o build
```

## Estrutura
```
index.html / admin.html     duas páginas (site e área do dono)
src/config.ts               dados da empresa e modo demonstração (demo: true)
src/App.tsx                 composição do site
src/components/             Capa, Pedido, Secoes, Aviso (toast), Fundo (vídeos)...
src/hooks/hooks.ts          useRolagem, useRevelar, useRelogio, useVideoLoop
src/lib/                    contato, serviços, movimento reduzido
src/admin/                  painel: PIN (SHA-256), corridas, KPIs, backup CSV/JSON
public/assets/              vídeos, imagens, logo SVG e fonte Exo 2
```

## O que mostra
- Capa em vídeo em tela cheia (imagem na hora, fade, fumaça carregada depois), com `prefers-reduced-motion` e economia de dados.
- Formulário controlado que monta a mensagem do WhatsApp; em modo demo mostra a prévia.
- Painel do dono com estado em React, dados em `localStorage` e botão "Carregar dados de exemplo".

Os vídeos de fundo são animações abstratas geradas por IA. Projeto sem fins comerciais.
