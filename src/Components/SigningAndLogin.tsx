import { FcGoogle } from "react-icons/fc";
import styled from "styled-components";
import FireLogo from "../assets/Firechat.png";

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
      {loginMode === "login" ? (
        <>{/* <h2>Boas-vindas de volta!</h2> */}</>
      ) : (
        <>{/* <h2>Cadastre-se abaixo!</h2> */}</>
      )}

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

        <span>
          <span /> Ou <span />
        </span>
        <button className="withGoogle" onClick={handleGoogleLogin}>
          <FcGoogle size={24} /> Entrar com Google
        </button>
      </FormContainer>
    </EnterContainer>
  );
}

export default SigningAndLogin;

const EnterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  padding: 40px 10px;

  h2 {
    font-size: 30px;
    color: #e9d4c4;
    margin-bottom: 20px;

    b {
      color: #ff5100;
    }
  }

  p {
    font-size: 20px;
    color: #e9d4c4;
    //margin-top: 20px;

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
    margin: 10px 0px;
  }

  span {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 20px;
    gap: 10px;

    span {
      padding-bottom: 16px;
      border-top: 1px solid gray;
    }
  }

  .withGoogle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 20px;
    cursor: pointer;
    color: rgb(29, 29, 29);
    background-color: #fff;
    padding: 15px;

    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

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
    width: 100%;
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
    width: 100%;
    border: 0;
    padding: 10px;
    border-radius: 5px;
    background-color: transparent;
    cursor: pointer;
    color: #e9d4c4;
    font-size: 20px;
    background-color: #212433;
    margin: 10px 0px;
  }
`;

const Logo = styled.div`
  text-align: center;
  div {
    display: flex;
    img {
      width: 50px;
      height: 50px;
      object-fit: contain;
      margin-right: 5px;
    }
    h1 {
      font-size: 50px;
      font-weight: bold;
      padding-bottom: 20px;

      b {
        color: #ff5100;
      }
    }
  }

  p {
    font-size: 16px;
    color: #e9d4c4;
    padding: 5px 0px;
  }
`;
