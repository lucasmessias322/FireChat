// src/sw.ts
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json();

  const title = data?.title || "Nova Mensagem";
  const options = {
    body: data?.body || "Você recebeu uma nova mensagem.",
    icon: "/icon.png",
    badge: "/icon.png",
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
