import React from "react";
import styled from "styled-components";
import { IoIosArrowBack } from "react-icons/io";
import FireLogo from "../../assets/Firechat.png";

interface User {
  uid: string;
  username: string;
  avatar: string;
  online?: boolean;
}

interface GroupInfoProps {
  users: User[];
  onClose: () => void;
  handleLogout: () => void;
}

export default function GroupInfo({
  users,
  onClose,
  handleLogout,
}: GroupInfoProps) {
  return (
    <Overlay>
      <Content>
        <Header>
          <IoIosArrowBack size={30} onClick={onClose} />
          <h1>
            <b>Fire</b>Chat
          </h1>
        </Header>

        <InfoBox>
          <img src={FireLogo} alt="Firechat Logo" />
          <p>Grupo oficial do chat. Aqui todos podem conversar livremente!</p>
        </InfoBox>

        <h4>Participantes ({users.length})</h4>
        <UsersList>
          {users.map((u) => (
            <UserItem key={u.uid}>
              <img src={u.avatar} alt={u.username} />
              <strong>{u.username}</strong>
              <Status online={!!u.online}>
                {u.online ? "Online" : "Offline"}
              </Status>
            </UserItem>
          ))}
        </UsersList>
        <LogoutButton onClick={handleLogout}>Desconectar-se</LogoutButton>
      </Content>
    </Overlay>
  );
}

// --- Styled ---
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #181a25;
  color: #fff;
  z-index: 100;
  overflow-y: auto;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Content = styled.div`
  max-width: 600px;
  margin: 0px auto;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  background-color: #181a25;
  gap: 5px;
  margin-bottom: 40px;
  padding: 20px 0px;

  h1 {
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    b {
      color: #ff5100;
    }
  }
`;

const InfoBox = styled.div`
  text-align: center;
  margin-bottom: 40px;

  img {
    width: 100px;
    border-radius: 16px;
    margin-bottom: 10px;
  }
`;

const UsersList = styled.div`
  padding: 10px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px;

  img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    background: #1e2131;
    padding: 5px;
  }
`;

const Status = styled.span<{ online: boolean }>`
  font-size: 12px;
  color: ${(p) => (p.online ? "#4caf50" : "#f44336")};
`;

const LogoutButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: 15px 10px;
  background-color: #212433;
  border: 1px solid #ff1100;
  border-radius: 5px;
  color: whitesmoke;
  margin-top: 20px;

  align-self: center;

  cursor: pointer;
  &:hover {
    background-color: #ff1100;
  }
`;
