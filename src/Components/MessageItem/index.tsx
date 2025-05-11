import styled from "styled-components";
import { Timestamp } from "firebase/firestore";
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
import { useState } from "react";

// Props do MessageItem
interface MessageItemProps {
  message: any;
  isSender: boolean;
  color?: string;
  seen?: boolean;
  avatar?: string;
}

// Função para formatar tempo relativo (pt-BR)
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Agora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffDays = Math.floor(diffH / 24);
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
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
  seen,
  avatar,
}: MessageItemProps) {
  const MAX_PREVIEW = 200;
  const [expanded, setExpanded] = useState(false);

  // Extrai timestamp
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
    date = new Date();
  }
  const formattedTime = timeAgo(date);

  // Gera preview ou texto completo
  const fullText = message.text as string;
  const previewText =
    fullText.length > MAX_PREVIEW && !expanded
      ? fullText.slice(0, MAX_PREVIEW) + "..."
      : fullText;

  return (
    <MessageContainer isSender={isSender}>
      <MessageBubble isSender={isSender}>
        <MessageUsername isSender={isSender} color={color}>
          {isSender
            ? "Você"
            : `~ ${message.user.charAt(0).toUpperCase()}${message.user.slice(
                1
              )}`}
        </MessageUsername>

        <MessageText>{previewText}</MessageText>
        {fullText.length > MAX_PREVIEW && (
          <ToggleButton onClick={() => setExpanded(!expanded)}>
            {expanded ? "Ver menos" : "Ver mais"}
          </ToggleButton>
        )}

        <MessageDataContainer>
          <MessageTime>{formattedTime}</MessageTime>
          {isSender &&
            (seen ? (
              <IoCheckmarkDoneOutline size={16} color="#4fc3f7" />
            ) : (
              <IoCheckmarkOutline size={16} color="#e9d4c4" />
            ))}
        </MessageDataContainer>
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
    isSender && `border-top-left-radius: 10px; border-top-right-radius: 0; `}
`;

const MessageUsername = styled.div<{ isSender: boolean; color?: string }>`
  padding-bottom: 5px;
  font-size: 14px;
  color: ${({ color }) => color || "#e9d4c4"};
  font-weight: bold;
  ${({ isSender }) => isSender && `color: #ff5100;`}
`;

const MessageText = styled.p`
  max-width: 400px;
  font-size: 16px;
  color: white;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: #4fc3f7;
  cursor: pointer;
  padding: 5px 0;
  font-size: 14px;
  align-self: flex-start;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #a7a7a7;
`;

const MessageOptionsIcons = styled.div`
  padding: 10px;
`;

const MessageDataContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
`;
