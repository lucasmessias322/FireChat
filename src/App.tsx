import * as C from "./AppStyle";
import MessageItem from "./Components/MessageItem";
import SystemMessage from "./Components/SystemMessage";
import { IoSend } from "react-icons/io5";
import { useState, useEffect, FormEvent, useRef } from "react";
import { db, timestamp, auth } from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc as docRef,
  writeBatch,
  doc,
  arrayUnion,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { messaging } from "./firebase"; // exporte getMessaging(app) no seu firebase.ts
import { getToken, onMessage } from "firebase/messaging";

// React-Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Components/Header";
import SigningAndLogin from "./Components/SigningAndLogin";
import styled from "styled-components";

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
  const [entered, setEntered] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [inputName, setInputName] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [usersData, setUsersData] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Permissão concedida para notificações.");
    }
  });

  // Auth listener: update online status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setEntered(true);
        const name = u.email!.split("@")[0];
        setUsername(name);
        const avatarUrl =
          u.photoURL && u.photoURL !== ""
            ? u.photoURL
            : `https://api.dicebear.com/6.x/pixel-art/svg?seed=${u.uid}`;
        setAvatar(avatarUrl);
        // update user doc
        await setDoc(
          docRef(db, "users", u.uid),
          { username: name, avatar: avatarUrl, online: true },
          { merge: true }
        );
        await addDoc(collection(db, "messages"), {
          text: `${name} entrou no chat`,
          timestamp: timestamp(),
          system: true,
          readBy: [name],
        });
      } else {
        setEntered(false);
        setUsername("");
        setAvatar("");
      }
    });
    return () => unsubscribe();
  }, []);

  // load messages
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Message) }))
      )
    );
  }, []);

  // load users with status
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

  // load typing
  useEffect(() => {
    const q = collection(db, "typing");
    return onSnapshot(q, (snap) => {
      const users = snap.docs
        .map((d) => ({ uid: d.id, typing: (d.data() as any).typing }))
        .filter((x) => x.typing && x.uid !== auth.currentUser?.uid)
        .map((x) => usersData.find((u) => u.uid === x.uid)?.username)
        .filter((n): n is string => !!n);
      setTypingUsers(users);
    });
  }, [usersData]);

  // mark read
  useEffect(() => {
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

  // autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // dentro do seu App()...

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      // se não há suporte ou permissão, não faz nada
      return;
    }

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
        // encontrar mensagens que estão em currentIds mas não em previousIds
        const newMsgEntries = docs.filter(
          (m) =>
            !previousIds.includes(m.id) &&
            !m.system && // só mensagens de usuários
            m.user !== username // só quando vier de OUTRO usuário
        );

        newMsgEntries.forEach((m) => {
          new Notification(`Nova mensagem de ${m.user}`, {
            body: m.text,
            icon: "/icon.png", // ou avatar do usuário: usersData.find(u=>u.uid===m.user)?.avatar
          });
        });
      }

      // atualiza state e flags
      setMessages(docs);
      previousIds = currentIds;
      isFirstLoad = false;
    });

    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    if (Notification.permission !== "granted") return;

    // registra o SW do Firebase (em public/firebase-messaging-sw.js)
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        // pede o token
        return getToken(messaging, {
          vapidKey: "SUA_VAPID_KEY_DO_FIREBASE",
          serviceWorkerRegistration: registration,
        });
      })
      .then((token) => {
        console.log("FCM token:", token);
        // envie esse token para o seu backend ou salve no Firestore:
        // fetch('/api/save-fcm-token', { method:'POST', body:JSON.stringify({ uid: auth.currentUser?.uid, token }) })
      })
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

  const fakeEmail = (name: string) => `${name}@chat.app`;

  // auth handlers
  const handleAuth = async () => {
    const name = inputName.trim().toLowerCase();
    if (!name || !inputPass) {
      toast.error("Preencha todos os campos");
      return;
    }
    const email = fakeEmail(name);
    try {
      if (loginMode === "login")
        await signInWithEmailAndPassword(auth, email, inputPass);
      else await createUserWithEmailAndPassword(auth, email, inputPass);
      setInputPass("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const handleLogout = async () => {
    // set offline
    const uid = auth.currentUser!.uid;
    await setDoc(docRef(db, "users", uid), { online: false }, { merge: true });
    await addDoc(collection(db, "messages"), {
      text: `${username} saiu do chat`,
      timestamp: timestamp(),
      system: true,
      readBy: [username],
    });
    await fbSignOut(auth);
    setShowMenu(false);
    toast.info("Você saiu do chat");
  };

  // send
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) {
      toast.error("Mensagem vazia não pode ser enviada");
      return;
    }
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
      //toast.success("Mensagem enviada");
    } catch (err: any) {
      toast.error(`Erro ao enviar mensagem: ${err.message}`);
    }
  };

  // Delete message
  // Delete message
  const handleDelete = async (id: string, owner?: string) => {
    // só o dono da mensagem ou o usuário "lucas" podem deletar
    if (
      owner !== username &&
      username.toLowerCase() !== "lucas" &&
      username.toLowerCase() !== "lucasmessiaspereira322" &&
      username.toLowerCase() !== "admin"
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

  if (!entered)
    return (
      <>
        <ToastContainer position="top-right" />
        <SigningAndLogin
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

  return (
    <C.Container>
      <ToastContainer position="top-right" />
      <Header
        setShowMenu={setShowMenu}
        showMenu={showMenu}
        username={username}
        avatar={avatar}
        handleLogout={handleLogout}
        onClickUsers={() => setShowUsersList((v) => !v)}
      />
      <C.ChatContainer>
        <C.MessagesContainer>
          {messages
            .slice()
            .reverse()
            .map((m) =>
              m.system ? (
                username == "lucas" && <SystemMessage key={m.id} message={m} />
              ) : (
                <MessageItem
                  key={m.id}
                  message={m}
                  isSender={m.user === username}
                  color={getUserColor(m.user!)}
                  seen={m.readBy!.length > 1}
                  onDelete={() => handleDelete(m.id, m.user)}
                  avatar={usersData.find((u) => u.uid === m.user)?.avatar || ""}
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
      {showUsersList && (
        <UsersOverlay>
          <UsersList>
            {usersData.map((u) => (
              <UserItem key={u.uid}>
                <img src={u.avatar} alt={u.username} />
                <strong>{u.username}</strong>
                <Status online={!!u.online}>
                  {u.online ? "Online" : "Offline"}
                </Status>
              </UserItem>
            ))}
          </UsersList>
          <CloseButton onClick={() => setShowUsersList(false)}>
            Fechar
          </CloseButton>
        </UsersOverlay>
      )}
    </C.Container>
  );
}

// Styled overlay components
const UsersOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const UsersList = styled.div`
  background: #1e2131;
  border-radius: 8px;
  padding: 20px;
  max-height: 80%;
  overflow: auto;
  width: 90%;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  //border-bottom: 1px solid gray;
  padding: 10px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: #ff5100;
    padding: 4px;
  }
`;
const Status = styled.span<{ online: boolean }>`
  font-size: 12px;
  color: ${(p) => (p.online ? "#4caf50" : "#f44336")};
`;
const CloseButton = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  background: #ff5100;
  border: none;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
`;

function SendMessageForm({ text, handleTextChange, sendMessage }: any) {
  return (
    <C.ChatInputBar>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Mensagem..."
          autoComplete="off"
          value={text}
          onChange={handleTextChange}
        />
        <button type="submit">
          <IoSend size={25} />
        </button>
      </form>
    </C.ChatInputBar>
  );
}
