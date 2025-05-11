import * as C from "./AppStyle";
import MessageItem from "./Components/MessageItem";
import SystemMessage from "./Components/SystemMessage";
import { IoEllipsisVertical, IoExitOutline, IoSend } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
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
}

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

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

  // ✨ Auth state listener: marca entered e define username/avatar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u: FirebaseUser | null) => {
      if (u) {
        setEntered(true);
        const name = u.email!.split("@")[0];
        setUsername(name);
        const avatarUrl =
          u.photoURL && u.photoURL !== ""
            ? u.photoURL
            : `https://api.dicebear.com/6.x/pixel-art/svg?seed=${u.uid}`;
        setAvatar(avatarUrl);
        setDoc(
          docRef(db, "users", u.uid),
          { username: name, avatar: avatarUrl },
          { merge: true }
        );
        addDoc(collection(db, "messages"), {
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

  // Carrega mensagens
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Message) })))
    );
  }, []);

  // Carrega usuários
  useEffect(() => {
    const q = collection(db, "users");
    return onSnapshot(q, (snap) =>
      setUsersData(
        snap.docs.map((d) => ({
          uid: d.id,
          username: (d.data() as any).username,
          avatar: (d.data() as any).avatar,
        }))
      )
    );
  }, []);

  // Carrega typing
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

  // Marca como lido
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fakeEmail = (name: string) => `${name}@chat.app`;

  // Login / signup
  const handleAuth = async () => {
    const name = inputName.trim().toLowerCase();
    if (!name || !inputPass) return;
    const email = fakeEmail(name);
    try {
      if (loginMode === "login")
        await signInWithEmailAndPassword(auth, email, inputPass);
      else
        await createUserWithEmailAndPassword(auth, email, inputPass);
      setInputPass("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Login Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await addDoc(collection(db, "messages"), {
      text: `${username} saiu do chat`,
      timestamp: timestamp(),
      system: true,
      readBy: [username],
    });
    await fbSignOut(auth);
    setShowMenu(false);
  };

  // Typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    const uid = auth.currentUser!.uid;
    setDoc(doc(db, "typing", uid), { typing: true, lastUpdated: timestamp() });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () =>
        setDoc(doc(db, "typing", uid), {
          typing: false,
          lastUpdated: timestamp(),
        }),
      1000
    );
  };

  // Envia mensagem
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + 5 * 60 * 60 * 1000 // 5 horas
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
    setDoc(doc(db, "typing", uid), { typing: false, lastUpdated: timestamp() });
  };

  const handleDelete = async (id: string, owner?: string) => {
    if (owner !== username) return;
    if (window.confirm("Confirma exclusão?"))
      await deleteDoc(docRef(db, "messages", id));
  };

  if (!entered)
    return (
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
    );

  return (
    <C.Container>
      <Header
        setShowMenu={setShowMenu}
        showMenu={showMenu}
        username={username}
        avatar={avatar}
        handleLogout={handleLogout}
      />
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
                  seen={m.readBy!.length > 1}
                  onDelete={() => handleDelete(m.id, m.user)}
                  avatar={usersData.find((u) => u.uid === m.user)?.avatar || ""}
                />
              )
            )}
        </C.MessagesContainer>

        {typingUsers.length > 0 && (
          <C.TypingIndicator>
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "está" : "estão"} digitando...
          </C.TypingIndicator>
        )}

        <div ref={messagesEndRef} />
      </C.ChatContainer>

      <SendMessageForm
        text={text}
        handleTextChange={handleTextChange}
        sendMessage={sendMessage}
      />
    </C.Container>
  );
}


function Header({
  setShowMenu,
  showMenu,
  username,
  avatar,
  handleLogout,
}: any) {
  return (
    <C.Header>
      <h1>
        <b>Fire</b>Chat
      </h1>
      <C.MenuWrapper>
        <C.MenuIcon onClick={() => setShowMenu((s: any) => !s)}>
          <IoEllipsisVertical size={24} />
        </C.MenuIcon>
        {showMenu && (
          <C.Menu>
            <C.MenuItem>
              <img src={avatar} alt="avatar" width={32} height={32} />{" "}
              {username}
            </C.MenuItem>
            <C.MenuItem onClick={handleLogout}>
              <IoExitOutline size={20} color="red" /> Sair
            </C.MenuItem>
          </C.Menu>
        )}
      </C.MenuWrapper>
    </C.Header>
  );
}

function SigningAndLogin({
  loginMode,
  setLoginMode,
  handleGoogleLogin,
  handleAuth,
  inputName,
  setInputName,
  inputPass,
  setInputPass,
}: any) {
  return (
    <C.EnterContainer>
      <h2>{loginMode === "login" ? "Entrar" : "Cadastrar"}</h2>
      <button className="withGoogle" onClick={handleGoogleLogin}>
        <FcGoogle size={24} /> Entrar com Google
      </button>
      <input
        placeholder="Nome de usuário"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={inputPass}
        onChange={(e) => setInputPass(e.target.value)}
      />
      <button onClick={handleAuth}>
        {loginMode === "login" ? "Entrar" : "Cadastrar"}
      </button>
      <p
        style={{ cursor: "pointer" }}
        onClick={() =>
          setLoginMode((m: any) => (m === "login" ? "signup" : "login"))
        }
      >
        {loginMode === "login"
          ? "Não tem conta? Cadastre-se"
          : "Já tem conta? Entre"}
      </p>
    </C.EnterContainer>
  );
}

function SendMessageForm({
  text,
  handleTextChange,
  sendMessage,
}: {
  text: string;
  handleTextChange: (e: any) => void;
  sendMessage: (e: FormEvent) => void;
}) {
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
