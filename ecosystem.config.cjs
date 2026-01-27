module.exports = {
  apps: [
    {
      name: "CHAT-MVP",
      // Aponta para o executável do Vite
      script: "./node_modules/vite/bin/vite.js",
      // Passa argumentos limpos, sem confusão de terminal
      args: "preview --host",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};