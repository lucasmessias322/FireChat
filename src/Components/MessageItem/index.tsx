import styled from "styled-components";
import { Timestamp } from "firebase/firestore";

// Props do MessageItem
interface MessageItemProps {
  message: any;
  isSender: boolean;
  color?: string;
}

// Função para formatar tempo relativo (pt-BR)
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return "Agora";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `há ${diffMin} min`;
  }
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    return `há ${diffH} h`;
  }
  const diffDays = Math.floor(diffH / 24);
  if (diffDays < 7) {
    return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  }
  // Para >7 dias, exibe data completa
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MessageItem({
  message,
  isSender,
  color,
}: MessageItemProps) {
  // Extrai timestamp: pode ser Timestamp ou objeto {seconds, nanoseconds}
  let date: Date;

  if (message.timestamp instanceof Timestamp) {
    date = message.timestamp.toDate();
  } else if (
    message.timestamp &&
    typeof message.timestamp === "object" &&
    "seconds" in message.timestamp
  ) {
    date = new Date(message.timestamp.seconds * 1000);
  } else if (typeof message.timestamp === "number") {
    date = new Date(message.timestamp);
  } else {
    date = new Date(); // fallback seguro
  }

  // Formata tempo relativo
  const formattedTime = timeAgo(date);

  return (
    <MessageContainer isSender={isSender}>
      <MessageBubble isSender={isSender}>
        <MessageUsername isSender={isSender} color={color}>
          {isSender
            ? "Você"
            : "~ " +
              message.user.charAt(0).toUpperCase() +
              message.user.slice(1)}
        </MessageUsername>
        <MessageText>{message.text}</MessageText>
        <MessageTime>{formattedTime}</MessageTime>
      </MessageBubble>
      <MessageOptionsIcons />
    </MessageContainer>
  );
}

const MessageContainer = styled.div<{ isSender: boolean }>`
  display: flex;
  width: 100%;
  padding: 20px 10px;
  ${({ isSender }) => isSender && `justify-content: flex-end;`}
`;

const MessageBubble = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: #212433;
  padding: 10px 20px;
  border-radius: 20px;
  border-top-left-radius: 0;
  max-width: 90%;
  ${({ isSender }) =>
    isSender && `border-top-left-radius: 10px; border-top-right-radius: 0;`}
`;

const MessageUsername = styled.div<{ isSender: boolean; color?: string }>`
  padding-bottom: 5px;
  font-size: 14px;
  color: ${({ color }) => color || "#e9d4c4"};
  font-weight: bold;
  ${({ isSender }) => isSender && `color: #91ff00;`}
`;

const MessageText = styled.div`
  font-size: 16px;
  color: white;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #a7a7a7;
  padding-top: 10px;
`;

const MessageOptionsIcons = styled.div`
  padding: 10px;
`;
