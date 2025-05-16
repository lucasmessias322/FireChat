import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      srcDir: "src",
      filename: "sw.ts", // seu SW customizado para Web‑Push
      manifest: {
        name: "FireChat",
        short_name: "FireChat",
        description: "Chat Multusuário com Firebase",
        theme_color: "#181a25",
        background_color: "#181a25",
        display: "standalone",
        start_url: "/",
        // obrigatório para FCM em Android PWA background
        gcm_sender_id: "103953800507",
        icons: [
          { src: "/icon.png", sizes: "192x192", type: "image/png" },
          { src: "/icon.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: false,
        type: "module",
        navigateFallback: "index.html",
        suppressWarnings: true,
      },
    }),
  ],  // <— fecha plugins array, sem vírgula extra
  // garante que o SW do Firebase (public/firebase-messaging-sw.js) seja incluído no build
  assetsInclude: ["firebase-messaging-sw.js"],

  server: {
    host: true,
  },
});
