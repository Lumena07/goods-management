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
    "/auth/login": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/auth/login.js"
    ],
    "/dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/dashboard.js"
    ],
    "/products": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/products.js"
    ],
    "/products/[id]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/products/[id].js"
    ],
    "/products/[id]/edit": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/products/[id]/edit.js"
    ],
    "/purchases": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/purchases.js"
    ],
    "/sales": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/sales.js"
    ],
    "/suppliers": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/suppliers.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];