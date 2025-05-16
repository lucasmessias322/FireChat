// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Substitua pelos seus dados do Firebase
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  const notificationTitle = payload.notification?.title || 'Nova mensagem';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png' // adicione um ícone se quiser
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
