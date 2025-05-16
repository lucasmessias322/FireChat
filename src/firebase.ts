// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Firestore e Auth exports
export const db = getFirestore(app);
export const auth = getAuth(app);

// Firebase Cloud Messaging export
export const messaging = getMessaging(app);

// Timestamp do servidor para ordenação de mensagens
export const timestamp = () => serverTimestamp();

/**
 * (Opcional) Autenticação anônima: chama onUser quando o usuário estiver pronto
 */
export function signInAnonymouslyIfNeeded(onUser: (user: User) => void) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUser(user);
    } else {
      signInAnonymously(auth).catch(console.error);
    }
  });
}
