// import * as C from "./AppStyle";
// import MessageItem from "./Components/MessageItem";
// import { IoEllipsisVertical, IoSend } from "react-icons/io5";
// import { useState, useEffect, FormEvent, useRef } from "react";
// import { db, timestamp } from "./firebase";

// import SystemMessage from "./Components/SystemMessage";

// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   DocumentData,
// } from "firebase/firestore";

// interface Message {
//   id: string;
//   text: string;
//   user?: string;
//   timestamp: { seconds: number; nanoseconds: number };
//   system?: boolean;
// }

// // Paleta de cores para usuários
// const colorPalette = [
//   "#e57373",
//   "#ba68c8",
//   "#7986cb",
//   "#4fc3f7",
//   "#4db6ac",
//   "#81c784",
//   "#dce775",
//   "#ffd54f",
//   "#ffb74d",
//   "#a1887f",
// ];

// // Gera cor aleatória da paleta
// function getRandomColor() {
//   return colorPalette[Math.floor(Math.random() * colorPalette.length)];
// }

// // Retorna cor do usuário (persistida no localStorage)
// function getUserColor(user: string) {
//   const key = `color_${user}`;
//   let color = localStorage.getItem(key);
//   if (!color) {
//     color = getRandomColor();
//     localStorage.setItem(key, color);
//   }
//   return color;
// }

// function App() {
//   const [entered, setEntered] = useState<boolean>(false);
//   const [username, setUsername] = useState<string>("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState<string>("");
//   const [showMenu, setShowMenu] = useState<boolean>(false);

//   // Ref para scroll
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const saved = localStorage.getItem("username");
//     if (saved) {
//       setUsername(saved);
//       setEntered(true);
//     }
//     const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const msgs: Message[] = snapshot.docs.map((doc: DocumentData) => ({
//         id: doc.id,
//         ...(doc.data() as Omit<Message, "id">),
//       }));
//       setMessages(msgs);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Scroll automático quando usuário atual manda mensagem
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       // verifica se última mensagem é do usuário atual
//       const last = messages[0];
//       if (last && last.user === username) {
//         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//       }
//     }
//   }, [messages, username]);

//   const handleEnter = () => {
//     const name = username.trim().toLowerCase();
//     if (!name) return;
//     localStorage.setItem("username", name);
//     setUsername(name);
//     setEntered(true);
//   };

//   const sendMessage = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     await addDoc(collection(db, "messages"), {
//       text,
//       user: username,
//       timestamp: timestamp(),
//     });
//     setText("");
//     // após enviar, scroll também
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("username");
//     setEntered(false);
//     setUsername("");
//     setShowMenu(false);
//   };

//   if (!entered) {
//     return (
//       <C.EnterContainer>
//         <h2>
//           Bem-vindo ao <b>Fire</b>Chat
//         </h2>
//         <input
//           placeholder="Digite seu nome..."
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           maxLength={15}
//         />
//         <button onClick={handleEnter}>Entrar</button>
//       </C.EnterContainer>
//     );
//   }

//   return (
//     <C.Container>
//       <C.Header>
//         <h1>
//           <b>Fire</b>Chat
//         </h1>

//         <C.MenuWrapper>
//           <C.MenuIcon onClick={() => setShowMenu((s) => !s)}>
//             <IoEllipsisVertical size={24} />
//           </C.MenuIcon>
//           {showMenu && (
//             <C.Menu>
//               <C.MenuItem onClick={handleLogout}>Sair</C.MenuItem>
//             </C.Menu>
//           )}
//         </C.MenuWrapper>
//       </C.Header>

//       <C.ChatContainer>
//         <C.MessagesContainer>
//           {messages.map((m) =>
//             m.system ? (
//               <SystemMessage key={m.id} message={m} />
//             ) : (
//               <MessageItem
//                 key={m.id}
//                 message={m}
//                 isSender={m.user === username}
//                 color={getUserColor(m.user!)}
//               />
//             )
//           )}
//         </C.MessagesContainer>
//         <div ref={messagesEndRef} />
//       </C.ChatContainer>

//       <C.ChatInputBar>
//         <form onSubmit={sendMessage}>
//           <input
//             type="text"
//             placeholder="Mensagem..."
//             autoComplete="off"
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//           />
//           <button type="submit">
//             <IoSend size={25} />
//           </button>
//         </form>
//       </C.ChatInputBar>
//     </C.Container>
//   );
// }

// export default App;

import * as C from "./AppStyle";
import MessageItem from "./Components/MessageItem";
import SystemMessage from "./Components/SystemMessage";
import { IoEllipsisVertical, IoSend } from "react-icons/io5";
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
} from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  user?: string;
  timestamp: { seconds: number; nanoseconds: number };
  system?: boolean;
  readBy?: string[];
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

function App() {
  const [entered, setEntered] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Carrega mensagens e marca não-lidas como lidas
  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) {
      setUsername(saved);
      setEntered(true);
    }
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

  // Marca mensagens como vistas
  useEffect(() => {
    if (!username) return;
    const batch = writeBatch(db);
    messages.forEach((m) => {
      if (!m.system && !m.readBy?.includes(username)) {
        const ref = doc(db, "messages", m.id);
        batch.update(ref, { readBy: arrayUnion(username) });
      }
    });
    batch.commit();
  }, [messages, username]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnter = async () => {
    const name = username.trim().toLowerCase();
    if (!name) return;
    localStorage.setItem("username", name);
    setUsername(name);
    setEntered(true);
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
    setEntered(false);
    setUsername("");
    setShowMenu(false);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text,
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
        <h2>
          Bem-vindo ao <b>Fire</b>Chat
        </h2>
        <input
          placeholder="Digite seu nome..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={15}
        />
        <button onClick={handleEnter}>Entrar</button>
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
              <C.MenuItem onClick={handleLogout}>Sair</C.MenuItem>
            </C.Menu>
          )}
        </C.MenuWrapper>
      </C.Header>

      <C.ChatContainer>
        <C.MessagesContainer>
          {messages
            .slice(0)
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
                  // Verifica se sender e já lida por alguém
                  seen={m.readBy?.length! > 1}
                />
              )
            )}
        </C.MessagesContainer>
        <div ref={messagesEndRef} />
      </C.ChatContainer>

      <C.ChatInputBar>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Mensagem..."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
