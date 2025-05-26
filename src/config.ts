// src/config.ts
export const config = {
    server: {
      port: 3000,
      host: "localhost",
    },
    auth: {
      apiKey: process.env.API_KEY || "apikey",
    },
  };
  