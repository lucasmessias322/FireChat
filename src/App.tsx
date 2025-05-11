import styled from "styled-components";
import MessageItem from "./Components/MessageItem";
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
} from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: { seconds: number; nanoseconds: number };
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

// Gera cor aleatória da paleta
function getRandomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

// Retorna cor do usuário (persistida no localStorage)
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

  // Ref para scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) {
      setUsername(saved);
      setEntered(true);
    }
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Scroll automático quando usuário atual manda mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      // verifica se última mensagem é do usuário atual
      const last = messages[0];
      if (last && last.user === username) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, username]);

  const handleEnter = () => {
    const name = username.trim().toLowerCase();
    if (!name) return;
    localStorage.setItem("username", name);
    setUsername(name);
    setEntered(true);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text,
      user: username,
      timestamp: timestamp(),
    });
    setText("");
    // após enviar, scroll também
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setEntered(false);
    setUsername("");
    setShowMenu(false);
  };

  if (!entered) {
    return (
      <EnterContainer>
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
      </EnterContainer>
    );
  }

  return (
    <Container>
      <Header>
        <h1>
          <b>Fire</b>Chat
        </h1>

        <MenuWrapper>
          <MenuIcon onClick={() => setShowMenu((s) => !s)}>
            <IoEllipsisVertical size={24} />
          </MenuIcon>
          {showMenu && (
            <Menu>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          )}
        </MenuWrapper>
      </Header>

      <ChatContainer>
        <MessagesContainer>
          {messages.map((m) => (
            <MessageItem
              key={m.id}
              message={m}
              isSender={m.user === username}
              color={getUserColor(m.user)}
            />
          ))}

          <div ref={messagesEndRef} />
        </MessagesContainer>
      </ChatContainer>

      <ChatInputBar>
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
      </ChatInputBar>
    </Container>
  );
}

export default App;

const Container = styled.div``;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 0.5px solid #cccccc49;

  position: fixed;
  width: 100%;
  z-index: 99999;
  background-color: #181a25;

  h1 {
    font-size: 24px;
    font-weight: bold;

    b {
      color: #ff5100;
    }
  }
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuIcon = styled.div`
  cursor: pointer;
  color: #e9d4c4;
`;

const Menu = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: #212433;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 10px 20px;
  font-size: 14px;
  color: #e9d4c4;
  cursor: pointer;
  &:hover {
    background: #2a2f42;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: #ff5100;
  cursor: pointer;
  font-size: 14px;
`;

const ChatContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-top: 50px;
  padding-bottom: 50px;

  @media (min-width: 1000px) {
    padding: 0px 250px;
  }
`;

const MessagesContainer = styled.div`
  width: 100%;
  margin-top: 40px; /* Corrigido para evitar sobreposição */
  margin-bottom: 40px;

  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  overflow-y: auto;
`;

const ChatInputBar = styled.div`
  width: 100%;
  position: fixed;
  padding: 10px 5px;
  bottom: 0;

  form {
    box-shadow: 5px 5px 20px #0d1214;
    max-width: 500px;
    margin: auto;
    border-radius: 10px;
    background-color: #212433;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 10px;

    input {
      width: 100%;
      padding: 10px;
      border: 0;
      outline: none;
      font-size: 20px;
      background-color: transparent;
      color: #e9d4c4;
      background-color: #212433;
      border-radius: 10px;
    }

    .formitem {
      margin: 0px 5px;
    }

    button {
      border: 0;
      padding: 0px;
      border-radius: 5px;
      background-color: transparent;
      cursor: pointer;
      color: #e9d4c4;
    }

    img {
      width: 40px;
      height: 40px;
      border: 1px dashed whitesmoke;
      object-fit: contain;
    }
  }
`;

const EnterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  h2 {
    font-size: 30px;
    color: #e9d4c4;
    margin-bottom: 20px;

    b {
      color: #ff5100;
    }
  }

  input {
    margin: 10px;
    padding: 10px;
    border: 0;
    outline: none;
    font-size: 20px;
    background-color: transparent;
    color: #e9d4c4;
    background-color: #212433;
    border-radius: 10px;
  }

  button {
    border: 0;
    padding: 10px;
    border-radius: 5px;
    background-color: transparent;
    cursor: pointer;
    color: #e9d4c4;
    font-size: 20px;
    background-color: #212433;
  }
`;
