// import styled from "styled-components";
// import { Timestamp } from "firebase/firestore";
// import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
// import { FaTrashAlt } from "react-icons/fa";
// import { useState } from "react";

// // Props do MessageItem
// interface MessageItemProps {
//   message: any;
//   isSender: boolean;
//   color?: string;
//   seen?: boolean;
//   avatar?: string;
//   username?: string; // Nome do usuário logado
//   onDelete?: () => void;
// }

// // Função para formatar tempo relativo (pt-BR)
// export function timeAgo(date: Date): string {
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffSec = Math.floor(diffMs / 1000);
//   if (diffSec < 60) return "Agora";
//   const diffMin = Math.floor(diffSec / 60);
//   if (diffMin < 60) return `há ${diffMin} min`;
//   const diffH = Math.floor(diffMin / 60);
//   if (diffH < 24) return `há ${diffH} h`;
//   const diffDays = Math.floor(diffH / 24);
//   if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
//   return date.toLocaleDateString("pt-BR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }

// export default function MessageItem({
//   message,
//   isSender,
//   color,
//   seen,
//   avatar,
//   onDelete,
//   username = "",
// }: MessageItemProps) {
//   const MAX_PREVIEW = 200;
//   const [expanded, setExpanded] = useState(false);
//   const [dragged, setDragged] = useState(false);
//   const [startX, setStartX] = useState<number | null>(null);

//   // Permissão de exclusão: proprietário ou usuário 'lucas'
//   const canDelete =
//     isSender ||
//     username.toLowerCase() === "lucasmessiaspereira322" ||
//     username.toLowerCase() === "lucas";

//   // Extrai timestamp
//   let date: Date;
//   if (message.timestamp instanceof Timestamp) {
//     date = message.timestamp.toDate();
//   } else if (
//     message.timestamp &&
//     typeof message.timestamp === "object" &&
//     "seconds" in message.timestamp
//   ) {
//     date = new Date(message.timestamp.seconds * 1000);
//   } else if (typeof message.timestamp === "number") {
//     date = new Date(message.timestamp);
//   } else {
//     date = new Date();
//   }
//   const formattedTime = timeAgo(date);

//   // Gera preview ou texto completo
//   const fullText = message.text as string;
//   const previewText =
//     fullText.length > MAX_PREVIEW && !expanded
//       ? fullText.slice(0, MAX_PREVIEW) + "..."
//       : fullText;

//   const handleTouchStart = (e: React.TouchEvent) => {
//     setStartX(e.touches[0].clientX);
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (startX === null) return;
//     const currentX = e.touches[0].clientX;
//     if (startX - currentX > 50) {
//       setDragged(true);
//     } else if (currentX - startX > 50) {
//       setDragged(false);
//     }
//   };

//   const handleTouchEnd = () => {
//     setStartX(null);
//   };

//   return (
//     <MessageContainer
//       isSender={isSender}
//       dragged={dragged}
//       onTouchStart={canDelete ? handleTouchStart : undefined}
//       onTouchMove={canDelete ? handleTouchMove : undefined}
//       onTouchEnd={canDelete ? handleTouchEnd : undefined}
//     >
//       <div className="first-child">
//         {!isSender && (
//           <img
//             src={
//               avatar && avatar.trim() !== ""
//                 ? avatar
//                 : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
//             }
//             alt={`Avatar de ${message.user}`}
//             onError={(e) => {
//               // Se a imagem quebrar, troca por fallback
//               e.currentTarget.src =
//                 "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
//             }}
//           />
//         )}

//         <MessageBubble isSender={isSender}>
//           <MessageUsername isSender={isSender} color={color}>
//             {isSender
//               ? "Você"
//               : `~ ${message.user.charAt(0).toUpperCase()}${message.user.slice(
//                   1
//                 )}`}
//           </MessageUsername>

//           <MessageText>{previewText}</MessageText>
//           {fullText.length > MAX_PREVIEW && (
//             <ToggleButton onClick={() => setExpanded(!expanded)}>
//               {expanded ? "Ver menos" : "Ver mais"}
//             </ToggleButton>
//           )}

//           <MessageDataContainer>
//             <MessageTime>{formattedTime}</MessageTime>
//             {isSender &&
//               (seen ? (
//                 <IoCheckmarkDoneOutline size={16} color="#4fc3f7" />
//               ) : (
//                 <IoCheckmarkOutline size={16} color="#e9d4c4" />
//               ))}
//           </MessageDataContainer>
//         </MessageBubble>
//       </div>

//       {/* Exibe ícone de deletar apenas se arrastado e permissão */}
//       {canDelete && dragged && (
//         <DeleteIcon onClick={onDelete}>
//           <FaTrashAlt color="#ff4d4d" size={25} />
//         </DeleteIcon>
//       )}
//     </MessageContainer>
//   );
// }

// const MessageContainer = styled.div<{ isSender: boolean; dragged?: boolean }>`
//   display: flex;
//   width: 100%;
//   padding: 20px 10px;
//   align-items: center;
//   justify-content: ${({ isSender }) => (isSender ? "flex-end" : "flex-start")};
//   position: relative;
//   transform: ${({ dragged }) =>
//     dragged ? "translateX(-20px)" : "translateX(0)"};
//   transition: transform 0.2s ease;

//   div.first-child {
//     display: flex;
//     align-items: baseline;
//     img {
//       width: 40px;
//       height: 40px;
//       border-radius: 50%;
//       object-fit: cover;
//       margin-right: 10px;
//     }
//   }
// `;

// const DeleteIcon = styled.div`
//   border-radius: 50%;
//   padding: 10px;
//   cursor: pointer;
//   color: white;
//   font-size: 16px;
//   background: rgba(255, 0, 0, 0.1);
//   transition: background 0.3s;
// `;

// const MessageBubble = styled.div<{ isSender: boolean }>`
//   display: flex;
//   flex-direction: column;
//   background-color: #212433;
//   padding: 10px 15px;
//   border-radius: 20px;
//   border-top-left-radius: 0;
//   max-width: 500px;
//   min-width: 150px;
//   ${({ isSender }) =>
//     isSender && `border-top-left-radius: 20px; border-top-right-radius: 0; `}
// `;

// const MessageUsername = styled.div<{ isSender: boolean; color?: string }>`
//   padding-bottom: 10px;
//   font-size: 14px;
//   color: ${({ color }) => color || "#e9d4c4"};
//   font-weight: bold;
//   ${({ isSender }) => isSender && `color: #ff5100;`}
// `;

// const MessageText = styled.p`
//   max-width: 400px;
//   font-size: 16px;
//   color: white;
//   white-space: pre-wrap;
//   word-wrap: break-word;
//   word-break: break-word;
//   margin: 0;
// `;

// const ToggleButton = styled.button`
//   background: transparent;
//   border: none;
//   color: #4fc3f7;
//   cursor: pointer;
//   padding: 5px 0;
//   font-size: 14px;
//   align-self: flex-start;
// `;

// const MessageTime = styled.div`
//   font-size: 12px;
//   color: #a7a7a7;
// `;

// const MessageDataContainer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   gap: 10px;
//   padding-top: 10px;
// `;

import styled from "styled-components";
import { Timestamp } from "firebase/firestore";
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
import { FaTrashAlt, FaLock } from "react-icons/fa"; // Adicionado FaLock para o ícone de cadeado
import { useState } from "react";

// Props do MessageItem
interface MessageItemProps {
  message: any;
  isSender: boolean;
  color?: string;
  seen?: boolean;
  avatar?: string;
  username?: string; // Nome do usuário logado
  onDelete?: () => void;
}

// Função para formatar tempo relativo (pt-BR)
export function timeAgo(date: Date): string {
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
  onDelete,
  username = "",
}: MessageItemProps) {
  const MAX_PREVIEW = 200;
  const [expanded, setExpanded] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  // Permissão de exclusão: proprietário ou usuário 'lucas'
  const canDelete =
    isSender ||
    username.toLowerCase() === "lucasmessiaspereira322" ||
    username.toLowerCase() === "lucas";

  // Verifica se a mensagem não foi descriptografada
  const isEncrypted =
    message.text === "[Decifrando...]" ||
    message.text === "[Erro ao decifrar mensagem]";

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
    fullText.length > MAX_PREVIEW && !expanded && !isEncrypted
      ? fullText.slice(0, MAX_PREVIEW) + "..."
      : fullText;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null) return;
    const currentX = e.touches[0].clientX;
    if (startX - currentX > 50) {
      setDragged(true);
    } else if (currentX - startX > 50) {
      setDragged(false);
    }
  };

  const handleTouchEnd = () => {
    setStartX(null);
  };

  return (
    <MessageContainer
      isSender={isSender}
      dragged={dragged}
      onTouchStart={canDelete ? handleTouchStart : undefined}
      onTouchMove={canDelete ? handleTouchMove : undefined}
      onTouchEnd={canDelete ? handleTouchEnd : undefined}
    >
      <div className="first-child">
        {!isSender && (
          <img
            src={
              avatar && avatar.trim() !== ""
                ? avatar
                : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt={`Avatar de ${message.user}`}
            onError={(e) => {
              // Se a imagem quebrar, troca por fallback
              e.currentTarget.src =
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
            }}
          />
        )}

        <MessageBubble isSender={isSender}>
          <MessageUsername isSender={isSender} color={color}>
            {isSender
              ? "Você"
              : `~ ${message.user.charAt(0).toUpperCase()}${message.user.slice(
                  1
                )}`}
          </MessageUsername>

          <MessageText isEncrypted={isEncrypted}>
            {previewText}
            {isEncrypted && (
              <EncryptedIndicator>
                <FaLock size={14} color="#a7a7a7" style={{ marginRight: 5 }} />
                Mensagem criptografada
              </EncryptedIndicator>
            )}
          </MessageText>
          {!isEncrypted && fullText.length > MAX_PREVIEW && (
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
      </div>

      {/* Exibe ícone de deletar apenas se arrastado e permissão */}
      {canDelete && dragged && (
        <DeleteIcon onClick={onDelete}>
          <FaTrashAlt color="#ff4d4d" size={25} />
        </DeleteIcon>
      )}
    </MessageContainer>
  );
}

const MessageContainer = styled.div<{ isSender: boolean; dragged?: boolean }>`
  display: flex;
  width: 100%;
  padding: 20px 10px;
  align-items: center;
  justify-content: ${({ isSender }) => (isSender ? "flex-end" : "flex-start")};
  position: relative;
  transform: ${({ dragged }) =>
    dragged ? "translateX(-20px)" : "translateX(0)"};
  transition: transform 0.2s ease;

  div.first-child {
    display: flex;
    align-items: baseline;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
    }
  }
`;

const DeleteIcon = styled.div`
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  background: rgba(255, 0, 0, 0.1);
  transition: background 0.3s;
`;

const MessageBubble = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: #212433;
  padding: 10px 15px;
  border-radius: 20px;
  border-top-left-radius: 0;
  max-width: 500px;
  min-width: 150px;
  ${({ isSender }) =>
    isSender && `border-top-left-radius: 20px; border-top-right-radius: 0; `}
`;

const MessageUsername = styled.div<{ isSender: boolean; color?: string }>`
  padding-bottom: 10px;
  font-size: 14px;
  color: ${({ color }) => color || "#e9d4c4"};
  font-weight: bold;
  ${({ isSender }) => isSender && `color: #ff5100;`}
`;

const MessageText = styled.p<{ isEncrypted?: boolean }>`
  max-width: 400px;
  font-size: 16px;
  color: white;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  ${({ isEncrypted }) => isEncrypted && `filter: blur(5px);`}
`;

const EncryptedIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #a7a7a7;
  font-size: 14px;
  margin-top: 5px;
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

const MessageDataContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
`;