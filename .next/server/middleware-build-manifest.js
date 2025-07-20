self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/cashback": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/cashback.js"
    ],
    "/chat": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/chat.js"
    ],
    "/criadores": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/criadores.js"
    ],
    "/dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/dashboard.js"
    ],
    "/esqueci-senha": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/esqueci-senha.js"
    ],
    "/missoes": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/missoes.js"
    ],
    "/moderacao": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/moderacao.js"
    ],
    "/notificacoes-tempo-real": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/notificacoes-tempo-real.js"
    ],
    "/ranking": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/ranking.js"
    ],
    "/registro": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/registro.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];