

import * as C from "./AppStyle";
import MessageItem from "./Components/MessageItem";
import SystemMessage from "./Components/SystemMessage";
import { IoEllipsisVertical, IoExitOutline, IoSend } from "react-icons/io5";
import { useState, useEffect, FormEvent, useRef } from "react";
import { db, timestamp } from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  DocumentData,
  writeBatch,
  doc,
  arrayUnion,
  setDoc,
  doc as docRef,
} from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  user?: string;
  timestamp: { seconds: number; nanoseconds: number };
  system?: boolean;
  readBy?: string[];
}

interface UserProfile {
  username: string;
  avatar: string;
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
function getRandomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}
function getUserColor(user: string) {
  const key = `color_${user}`;
  let color = localStorage.getItem(key);
  if (!color) {
    color = getRandomColor();
    localStorage.setItem(key, color);
  }
  return color;
}

const MAX_MESSAGE_LENGTH = 400;

function App() {
  const [entered, setEntered] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Recupera perfil salvo
    const savedUser = localStorage.getItem("username");
    const savedAvatar = localStorage.getItem("avatar");
    if (savedUser && savedAvatar) {
      setUsername(savedUser);
      setAvatar(savedAvatar);
      setEntered(true);
    }
    // Listener mensagens
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...(doc.data() as Message),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Marcar lidas
    if (!username) return;
    const batch = writeBatch(db);
    messages.forEach((m) => {
      if (!m.system && !m.readBy?.includes(username)) {
        batch.update(doc(db, "messages", m.id), {
          readBy: arrayUnion(username),
        });
      }
    });
    batch.commit();
  }, [messages, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnter = async () => {
    const name = username.trim().toLowerCase();
    if (!name) return;
    // Gera avatar via DiceBear
    const avatarUrl = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${encodeURIComponent(
      name
    )}`;
    localStorage.setItem("username", name);
    localStorage.setItem("avatar", avatarUrl);
    setUsername(name);
    setAvatar(avatarUrl);
    setEntered(true);
    // Armazena também em Firestore usuário
    await setDoc(docRef(db, "users", name), {
      username: name,
      avatar: avatarUrl,
    });
    await addDoc(collection(db, "messages"), {
      text: `${name} entrou no chat`,
      timestamp: timestamp(),
      system: true,
      readBy: [name],
    });
  };

  const handleLogout = async () => {
    await addDoc(collection(db, "messages"), {
      text: `${username} saiu do chat`,
      timestamp: timestamp(),
      system: true,
      readBy: [username],
    });
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    setEntered(false);
    setUsername("");
    setAvatar("");
    setShowMenu(false);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      alert(`Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH})`);
      return;
    }
    await addDoc(collection(db, "messages"), {
      text: trimmed,
      user: username,
      timestamp: timestamp(),
      system: false,
      readBy: [username],
    });
    setText("");
  };

  if (!entered) {
    return (
      <C.EnterContainer>
        <h2>Crie sua conta</h2>
        <input
          placeholder="Digite seu nome..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={15}
        />
        <button onClick={handleEnter}>Criar Conta</button>
      </C.EnterContainer>
    );
  }

  return (
    <C.Container>
      <C.Header>
        <h1>
          <b>Fire</b>Chat
        </h1>
        <C.MenuWrapper>
          <C.MenuIcon onClick={() => setShowMenu((s) => !s)}>
            <IoEllipsisVertical size={24} />
          </C.MenuIcon>
          {showMenu && (
            <C.Menu>
              <C.MenuItem>
                <img src={avatar} alt="avatar" width={32} height={32} />
                {username}
              </C.MenuItem>
              <C.MenuItem onClick={handleLogout}>
                <IoExitOutline size={20} color="red" /> Sair
              </C.MenuItem>
            </C.Menu>
          )}
        </C.MenuWrapper>
      </C.Header>
      <C.ChatContainer>
        <C.MessagesContainer>
          {messages
            .slice()
            .reverse()
            .map((m) =>
              m.system ? (
                <SystemMessage key={m.id} message={m} />
              ) : (
                <MessageItem
                  key={m.id}
                  message={m}
                  isSender={m.user === username}
                  color={getUserColor(m.user!)}
                  seen={m.readBy?.length! > 1}
                  avatar={
                    m.user
                      ? m.user === username
                        ? avatar
                        : undefined
                      : undefined
                  }
                />
              )
            )}
          <div ref={messagesEndRef} />
        </C.MessagesContainer>
      </C.ChatContainer>
      <C.ChatInputBar>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Mensagem..."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <button type="submit">
            <IoSend size={25} />
          </button>
        </form>
      </C.ChatInputBar>
    </C.Container>
  );
}

export default App;
