import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  background-color: #181a25;
  color: #e9d4c4;
  font-family: "Poppins", sans-serif;
  font-size: 16px;
`;

export const Header = styled.header`
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

export const MenuWrapper = styled.div`
  position: relative;
`;

export const MenuIcon = styled.div`
  cursor: pointer;
  color: #e9d4c4;
`;

export const Menu = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: #212433;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

export const MenuItem = styled.div`
  padding: 10px 20px;
  font-size: 14px;
  color: #e9d4c4;
  cursor: pointer;
  &:hover {
    background: #2a2f42;
  }
`;

export const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: #ff5100;
  cursor: pointer;
  font-size: 14px;
`;

export const ChatContainer = styled.div`
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

export const MessagesContainer = styled.div`
  width: 100%;
  margin-top: 40px; /* Corrigido para evitar sobreposição */
  margin-bottom: 40px;

  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  overflow-y: auto;

  @media (min-width: 1000px) {
    margin-top: 70px; /* Corrigido para evitar sobreposição */
    margin-bottom: 40px;
  }
`;

export const ChatInputBar = styled.div`
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

export const EnterContainer = styled.div`
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
