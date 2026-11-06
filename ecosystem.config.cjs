// Produção: rode "npm run build" antes de iniciar com o PM2.
module.exports = {
  apps: [
    {
      name: "CHAT-MVP",
      script: "./server.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 4173,
      },
    },
  ],
};
