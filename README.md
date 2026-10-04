# Jogo das Coordenadas Geográficas · v2.1

Jogo educativo de latitude e longitude. Escolha uma missão, digite as coordenadas geográficas e localize os navios de **Pesca Ilegal** e de **Pirataria** nos oceanos e mares.

Criado por **Edson Maia** (versão original de 2021, reformulada em 2026).

## Como jogar

1. Escolha uma das 4 missões. O mapa amplia o quadrante da missão.
2. Digite a latitude (0° a 90°, N ou S) e a longitude (0° a 180°, E ou W).
3. Clique em **Jogar** ou pressione Enter.
4. Encontre todos os navios ilegais de cada missão para ganhar a insígnia e as estrelas.

Dicas: clicar no mapa preenche as coordenadas, e as setas ↑/↓ nos campos mudam o valor de 10 em 10° (latitude) ou de 20 em 20° (longitude).

## No celular

Funciona com o celular deitado (paisagem). As missões, o placar e as insígnias ficam na barra do alto da tela, e a latitude, a longitude e o botão **Jogar** ficam na barra de baixo, sempre à vista. Escolha a missão nos botões **1** a **4**, toque no mapa ou use os botões **−** e **+** para definir as coordenadas, troque o hemisfério (N/S, E/W) com um toque e depois toque em **Jogar**. O volume da música e dos efeitos abre no botão de ajustes, no canto superior direito, ao lado do botão de ajuda.

Para instalar como app, abra o endereço do jogo no celular. No Android (Chrome), toque em ⋮ e depois em **Instalar app**. No iPhone (Safari), toque em Compartilhar e depois em **Adicionar à Tela de Início**. Depois da primeira visita, o jogo funciona sem internet.

## Publicar no GitHub Pages

1. Crie um repositório público e envie estes arquivos para a raiz.
2. Vá em **Settings → Pages** e escolha **Deploy from a branch**, depois **main** e **/(root)**.
3. O jogo fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Estrutura

```
index.html                  Jogo (interface, mapa, missões, telas de conquista)
navios.js                   Posições, cores e tipos dos 50 navios
som.js                      Música de fundo e efeitos sonoros (Web Audio API)
manifest.webmanifest        Dados para instalar como app
sw.js                       Funcionamento offline do app
icons/                      Ícones do app
images/rosa-dos-ventos.png  Logotipo
offline/index.html          Versão em arquivo único, funciona sem internet
```

Para mudar navios ou missões, edite `navios.js`. A latitude e a longitude estão em graus: Norte e Leste são positivos, Sul e Oeste são negativos.

## Créditos

- **Edson Maia**: concepção, missões, textos e código original
- **Natural Earth**, via [world-atlas](https://github.com/topojson/world-atlas): contornos dos continentes (domínio público / ISC)
- **D3.js** e **TopoJSON Client**: desenho do mapa (ISC)
- **Material Symbols**, do Google: ícones (Apache 2.0)
- **Montserrat**, de Julieta Ulanovsky: fonte (SIL Open Font License)
- Música e efeitos: sintetizados no navegador, sem arquivos de áudio de terceiros
