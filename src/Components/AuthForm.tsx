import { FcGoogle } from "react-icons/fc";
import styled from "styled-components";
import FireLogo from "../assets/Firechat.png";
import { useState } from "react";

function AuthForm({
  loginMode,
  setLoginMode,
  handleGoogleLogin,
  handleAuth,
  inputName,
  setInputName,
  inputPass,
  setInputPass,
}: any) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const toggleMode = () =>
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  return (
    <EnterContainer>
      <Logo>
        <div>
          <img src={FireLogo} alt="" />
          <h1>
            <b>Fire</b>Chat
          </h1>
        </div>

        <p>Chat em tempo real com Firebase</p>
      </Logo>

      <FormContainer>
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

        <p onClick={toggleMode} style={{ cursor: "pointer" }}>
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entre"}
        </p>

        <Divider>
          <hr /> Ou <hr />
        </Divider>
        <GoogleButton onClick={handleGoogleLogin}>
          <FcGoogle size={24} /> Entrar com Google
        </GoogleButton>
      </FormContainer>
    </EnterContainer>
  );
}

export default AuthForm;

const EnterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px 10px;
  text-align: center;
  color: #e9d4c4;
`;

const Logo = styled.div`
  margin-bottom: 20px;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-right: 5px;
  }

  h1 {
    font-size: 42px;
    font-weight: bold;

    b {
      color: #ff5100;
    }
  }

  p {
    font-size: 16px;
    margin-top: 8px;
    color: #c7bcb0;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;

  input {
    width: 100%;
    margin: 8px 0;
    padding: 10px;
    font-size: 18px;
    color: #e9d4c4;
    background-color: #212433;
    border: none;
    border-radius: 10px;
    outline: none;
  }

  button {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    background-color: #212433;
    border: none;
    border-radius: 5px;
    color: #e9d4c4;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background-color: #2b2f41;
    }
  }

  p {
    font-size: 16px;
    margin-top: 10px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  color: gray;
  font-size: 14px;
  gap: 8px;

  hr {
    flex: 1;
    border: none;
    border-top: 1px solid gray;
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #fff;
  color: #1a1a1a;
  border-radius: 8px;
  padding: 12px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  border: none;
  width: 100%;
  transition: 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;
