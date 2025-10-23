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

import styled from "styled-components";
import SendMessageForm from "./Components/SendMessageForm";
import GroupInfo from "./Components/GroupInfo";

// Tipos
interface Message {
  id: string;
  text: string;
  user?: string;
  timestamp: { seconds: number; nanoseconds: number };
  system?: boolean;
  readBy?: string[];
}

interface User {
  uid: string;
  username: string;
  avatar: string;
  online?: boolean;
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
  const [text, setText] = useState("");
  const [usersData, setUsersData] = useState<User[]>([]);
  //const [typingUsers, setTypingUsers] = useState<string[]>([]);
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
  // --- Hook de presença online ---
  useOnlineStatus(entered); // ✅ Substitui o useEffect antigo
  useMarkRead(messages, username);

  // --- Carregar mensagens ---
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Message) }))
      )
    );
  }, []);

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
            body: m.text,
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

  // --- Firebase Cloud Messaging ---
  useEffect(() => {
    if (Notification.permission !== "granted") return;

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) =>
        getToken(messaging, {
          vapidKey: "SUA_VAPID_KEY_DO_FIREBASE",
          serviceWorkerRegistration: registration,
        })
      )
      .then((token) => console.log("FCM token:", token))
      .catch(console.error);
  }, []);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification!;
      new Notification(title || "Nova mensagem", {
        body: body || "",
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
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + 5 * 60 * 60 * 1000
      );
      await addDoc(collection(db, "messages"), {
        text: t,
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
        <GroupInfo users={usersData} handleLogout={handleLogout} onClose={() => setShowGroupInfo(false)} />
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
                  message={m}
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
