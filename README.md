# Zênite Motoboy — landing page interativa (projeto de portfólio)

Landing page de uma empresa **fictícia** de motoboys, feita só com HTML, CSS e JavaScript puros, sem framework e sem build. Marca, telefones, endereço e dados são inventados.

**Demonstração:** https://zenite-motoboy-portfolio.vercel.app

## O que mostra
- **Capa em vídeo em tela cheia** com imagem de capa instantânea, vídeo com fade e camada de fumaça carregada depois da página; escurece e flutua com a rolagem. Respeita `prefers-reduced-motion` e economia de dados.
- **Pedido em um formulário** (serviço, endereços, nome) que monta a mensagem pronta para o WhatsApp; em modo demonstração mostra a prévia em vez de abrir o `wa.me`.
- Trilho de serviços, "Como funciona", contato com número animado e barra fixa no celular.
- **Área do dono** (`admin.html`): PIN com SHA-256, cadastro de corridas, KPIs por período, endereços mais usados, backup CSV/JSON; dados só no navegador. O botão "Carregar dados de exemplo" popula o painel.
- Configuração única em `js/config.js` (`demo: true`).

## Tecnologias
HTML5, CSS3 (variáveis, grid, flexbox, container queries, máscaras), JavaScript (IntersectionObserver, localStorage, Web Crypto), SVG, fonte Exo 2 local, ffmpeg para os vídeos.

Os vídeos de fundo são animações abstratas geradas por IA. Projeto sem fins comerciais.
