# Página Lary (GitHub Pages)

## Publicação rápida

1. Suba este repositório no GitHub.
2. Vá em **Settings > Pages** e selecione **GitHub Actions** em *Build and deployment*.
3. Faça push para a branch (`main`, `master` ou `work`).
4. O workflow `.github/workflows/deploy-pages.yml` fará o deploy automático.

## Arquivos para editar

- `data/messages.json`: mensagens da roleta.
- `data/memories.json`: textos e caminhos das fotos.
- `assets/images/`: coloque suas imagens reais (`foto-1.jpg`, `foto-2.jpg`, `foto-3.jpg`) ou altere os caminhos no JSON.

## Página principal

- `index.html` redireciona para `lary.html`.
