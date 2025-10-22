// src/sw.ts
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json();

  const title = data?.title || "Nova Mensagem";
  const options = {
    body: data?.body || "Você recebeu uma nova mensagem.",
    icon: "/assets/Firechat.png",
    badge: "/assets/Firechat.png",
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
