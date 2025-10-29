import * as C from "./AppStyle";
import MessageItem from "./Components/MessageItem";
import SystemMessage from "./Components/SystemMessage";
import { useState, useEffect, FormEvent, useRef } from "react";
import { db, timestamp, auth, messaging } from "./firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc as docRef,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Components/Header";
import AuthForm from "./Components/AuthForm";

import { useAuth } from "./hooks/useAuth";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useMarkRead } from "./hooks/useMarkRead";
import { useTypingStatus } from "./hooks/useTypingStatus";

import SendMessageForm from "./Components/SendMessageForm";
import GroupInfo from "./Components/GroupInfo";

// Importe as utils de crypto
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  generateAESKey,
  encryptAES,
  decryptAES,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  exportAESKey,
  importAESKey,
} from "./utils/cryptoUtils";

// Configurações do IndexedDB
const DB_NAME = "CryptoKeysDB";
const STORE_NAME = "privateKeys";
const DB_VERSION = 1;

// Função para abrir o IndexedDB
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, { keyPath: "uid" });
    };
    request.onsuccess = (event) =>
      resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) =>
      reject((event.target as IDBOpenDBRequest).error);
  });
}

// Função para salvar privateKey (CryptoKey) no IndexedDB
async function savePrivateKeyToDB(
  uid: string,
  privateKey: CryptoKey
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ uid, key: privateKey });
    request.onsuccess = () => resolve();
    request.onerror = reject;
    tx.oncomplete = () => db.close();
  });
}

// Função para carregar privateKey (CryptoKey) do IndexedDB
async function getPrivateKeyFromDB(uid: string): Promise<CryptoKey | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(uid);
    request.onsuccess = () => resolve(request.result?.key || null);
    request.onerror = reject;
    tx.oncomplete = () => db.close();
  });
}

// Tipos atualizados
interface Message {
  id: string;
  encryptedText?: string; // Base64 do texto criptografado
  iv?: string; // Base64 do IV
  encryptedKeys?: { [uid: string]: string }; // Base64 da AES key criptografada por usuário
  timestamp: { seconds: number; nanoseconds: number };
  system?: boolean;
  readBy?: string[];
  user?: string; // Mantido para identificar o remetente
}

interface User {
  uid: string;
  username: string;
  avatar: string;
  online?: boolean;
  publicKey?: string; // JWK em string da chave pública
}

// Paleta de cores para usuários
const colorPalette = [
  "#e57373",
  "#ba68c8",
  "#7986cb",
  "#4fc3f7",
  "#4db6ac",
  "#81c784",
  "#dce775",
  "#ffd54f",
  "#ffb74d",
  "#a1887f",
];
const getRandomColor = () =>
  colorPalette[Math.floor(Math.random() * colorPalette.length)];
const getUserColor = (u: string) => {
  const key = `color_${u}`;
  let c = localStorage.getItem(key);
  if (!c) {
    c = getRandomColor();
    localStorage.setItem(key, c);
  }
  return c;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<{
    [id: string]: string;
  }>({});
  const [text, setText] = useState("");
  const [usersData, setUsersData] = useState<User[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const typingUsers = useTypingStatus(usersData);
  // Auth Hook
  const {
    user,
    entered,
    loginMode,
    inputName,
    inputPass,
    setLoginMode,
    setInputName,
    setInputPass,
    handleAuth,
    handleGoogleLogin,
    handleLogout,
  } = useAuth();

  const username = user?.username || "";
  const avatar = user?.avatar || "";
  const uid = auth.currentUser?.uid || "";
  // Estado para chaves privadas
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);

  // --- Hook de presença online ---
  useOnlineStatus(entered);
  useMarkRead(messages, username);

  // --- Solicitar armazenamento persistente no IndexedDB ---
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        console.log(`Armazenamento persistente concedido: ${persistent}`);
      });
    }
  }, []);

  // --- Gerar e carregar chaves no login usando IndexedDB ---
  useEffect(() => {
    if (!entered || !uid) return;

    const loadKeys = async () => {
      let privKey = await getPrivateKeyFromDB(uid);

      if (!privKey) {
        // Gerar par de chaves com extractable=true para exportar public
        const keyPair = await crypto.subtle.generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["encrypt", "decrypt"]
        );

        // Exportar public key para compartilhar
        const exportedPublic = await crypto.subtle.exportKey(
          "jwk",
          keyPair.publicKey
        );
        const exportedPublicStr = JSON.stringify(exportedPublic);

        // Armazenar publicKey no Firestore
        await setDoc(
          doc(db, "users", uid),
          { publicKey: exportedPublicStr },
          { merge: true }
        );

        // Exportar private temporariamente como JWK
        const exportedPrivateJwk = await crypto.subtle.exportKey(
          "jwk",
          keyPair.privateKey
        );

        // Importar private novamente como non-extractable (apenas para decrypt)
        privKey = await crypto.subtle.importKey(
          "jwk",
          exportedPrivateJwk,
          { name: "RSA-OAEP", hash: "SHA-256" },
          false, // Non-extractable
          ["decrypt"]
        );

        // Salvar o non-extractable privateKey no IndexedDB
        await savePrivateKeyToDB(uid, privKey);
      }

      setPrivateKey(privKey);
    };

    loadKeys().catch((err) =>
      toast.error(`Erro ao gerenciar chaves: ${err.message}`)
    );
  }, [entered, uid]);

  // --- Carregar mensagens ---
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Message) }))
      )
    );
  }, []);

  // --- Decifrar mensagens ao carregar ---
  useEffect(() => {
    if (!privateKey || !uid) return;

    const decryptAll = async () => {
      const decrypted: { [id: string]: string } = {};
      for (const m of messages) {
        if (m.system || !m.encryptedText || !m.iv || !m.encryptedKeys?.[uid]) {
          decrypted[m.id] = m.encryptedText || "";
          continue;
        }
        try {
          const encKeyBase64 = m.encryptedKeys[uid];
          const encKey = base64ToArrayBuffer(encKeyBase64);
          const aesRaw = await decryptWithPrivateKey(encKey, privateKey);
          const aesKey = await importAESKey(aesRaw);
          const encrypted = base64ToArrayBuffer(m.encryptedText);
          const iv = base64ToArrayBuffer(m.iv);
          const text = await decryptAES(encrypted, iv, aesKey);
          decrypted[m.id] = text;
        } catch (err) {
          decrypted[m.id] = "[Erro ao decifrar mensagem]";
        }
      }
      setDecryptedMessages(decrypted);
    };

    decryptAll();
  }, [messages, privateKey, uid]);

  // --- Carregar usuários ---
  useEffect(() => {
    const q = collection(db, "users");
    return onSnapshot(q, (snap) =>
      setUsersData(
        snap.docs.map((d) => ({
          uid: d.id,
          username: (d.data() as any).username,
          avatar: (d.data() as any).avatar,
          online: (d.data() as any).online,
          publicKey: (d.data() as any).publicKey,
        }))
      )
    );
  }, []);

  // --- Scroll automático ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Notificações ---
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (Notification.permission !== "granted") return;

    let isFirstLoad = true;
    let previousIds: string[] = [];
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Message),
      }));
      const currentIds = docs.map((m) => m.id);

      if (!isFirstLoad) {
        const newMsgEntries = docs.filter(
          (m) => !previousIds.includes(m.id) && !m.system && m.user !== username
        );
        newMsgEntries.forEach((m) => {
          new Notification(`Nova mensagem de ${m.user}`, {
            body: "[Mensagem criptografada]",
            icon: "/icon.png",
          });
        });
      }

      setMessages(docs);
      previousIds = currentIds;
      isFirstLoad = false;
    });

    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification!;
      new Notification(title || "Nova mensagem", {
        body: body || "[Mensagem criptografada]",
        icon: "/icon.png",
      });
    });
  }, []);

  // --- Enviar mensagem ---
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return toast.error("Mensagem vazia não pode ser enviada");

    try {
      // Gere AES key para esta mensagem
      const aesKey = await generateAESKey();
      const { encrypted, iv } = await encryptAES(t, aesKey);
      const encryptedText = arrayBufferToBase64(encrypted);
      const ivBase64 = arrayBufferToBase64(iv.buffer);

      // Criptografe a AES key para cada usuário
      const encryptedKeys: { [uid: string]: string } = {};
      for (const u of usersData) {
        if (!u.publicKey) continue;
        const pubKey = await importPublicKey(u.publicKey);
        const aesRaw = await exportAESKey(aesKey);
        const encKey = await encryptWithPublicKey(aesRaw, pubKey);
        encryptedKeys[u.uid] = arrayBufferToBase64(encKey);
      }

      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + 10 * 60 * 1000 // 10 minutos
      );

      await addDoc(collection(db, "messages"), {
        encryptedText,
        iv: ivBase64,
        encryptedKeys,
        user: username,
        timestamp: timestamp(),
        expiresAt,
        system: false,
        readBy: [username],
      });
      setText("");
      const uid = auth.currentUser!.uid;
      setDoc(doc(db, "typing", uid), {
        typing: false,
        lastUpdated: timestamp(),
      });
    } catch (err: any) {
      toast.error(`Erro ao enviar mensagem: ${err.message}`);
    }
  };

  // --- Deletar mensagem ---
  const handleDelete = async (id: string, owner?: string) => {
    if (
      owner !== username &&
      !["lucas", "lucasmessiaspereira322", "admin"].includes(
        username.toLowerCase()
      )
    ) {
      toast.error("Você não tem permissão para deletar esta mensagem");
      return;
    }
    if (window.confirm("Confirma exclusão?")) {
      try {
        await deleteDoc(docRef(db, "messages", id));
        toast.success("Mensagem excluída");
      } catch (err: any) {
        toast.error(`Erro ao excluir: ${err.message}`);
      }
    }
  };

  // --- Tela de login ---
  if (!entered)
    return (
      <>
        <ToastContainer position="top-right" />
        <AuthForm
          loginMode={loginMode}
          setLoginMode={setLoginMode}
          handleGoogleLogin={handleGoogleLogin}
          handleAuth={handleAuth}
          inputName={inputName}
          setInputName={setInputName}
          inputPass={inputPass}
          setInputPass={setInputPass}
        />
      </>
    );

  // --- Interface principal ---
  return (
    <C.Container>
      <ToastContainer position="top-right" />
      <Header
        setShowMenu={setShowMenu}
        showMenu={showMenu}
        username={username}
        avatar={avatar}
        handleLogout={handleLogout}
        onOpenGroupInfo={() => setShowGroupInfo(true)}
      />

      {showGroupInfo && (
        <GroupInfo
          users={usersData}
          handleLogout={handleLogout}
          onClose={() => setShowGroupInfo(false)}
        />
      )}

      <C.ChatContainer>
        <C.MessagesContainer>
          {messages
            .slice()
            .reverse()
            .map((m) =>
              m.system ? (
                username === "lucas" && <SystemMessage key={m.id} message={m} />
              ) : (
                <MessageItem
                  key={m.id}
                  message={{
                    ...m,
                    text: decryptedMessages[m.id] || "[Decifrando...]",
                  }}
                  isSender={m.user === username}
                  color={getUserColor(m.user!)}
                  seen={m.readBy!.length > 1}
                  onDelete={() => handleDelete(m.id, m.user)}
                  avatar={
                    usersData.find((u) => u.username === m.user)?.avatar || ""
                  }
                  username={username}
                />
              )
            )}
        </C.MessagesContainer>
        {typingUsers.length > 0 && (
          <C.TypingIndicator>
            {typingUsers.join(", ")}{" "}
            {typingUsers.length === 1 ? "está" : "estão"} digitando...
          </C.TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </C.ChatContainer>

      <SendMessageForm
        text={text}
        handleTextChange={(e: any) => {
          setText(e.target.value);
          const uid = auth.currentUser!.uid;
          setDoc(doc(db, "typing", uid), {
            typing: true,
            lastUpdated: timestamp(),
          });
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(
            () =>
              setDoc(doc(db, "typing", uid), {
                typing: false,
                lastUpdated: timestamp(),
              }),
            1000
          );
        }}
        sendMessage={sendMessage}
      />
    </C.Container>
  );
}
