import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  background-color: #181a25;
  color: #e9d4c4;
  font-family: "Poppins", sans-serif;
  font-size: 16px;
`;



// export const MenuWrapper = styled.div`
//   position: relative;
// `;

// export const MenuIcon = styled.div`
//   cursor: pointer;
//   color: #e9d4c4;
// `;

// export const Menu = styled.div`
//   position: absolute;
//   top: 30px;
//   right: 0;
//   background: #212433;
//   border-radius: 5px;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
//   overflow: hidden;
// `;

// export const MenuItem = styled.div`
//   min-width: 200px;
//   padding: 20px 20px;
//   font-size: 14px;
//   color: #e9d4c4;
//   display: flex;
//   gap: 10px;
//   align-items: center;
//   cursor: pointer;
//   &:hover {
//     background: #2a2f42;
//   }

//   img {
//     width: 50px;
//     height: 50px;
//     object-fit: contain;
//     border-radius: 100%;
//   }
// `;

// export const LogoutButton = styled.button`
//   background: transparent;
//   border: none;
//   color: #ff5100;
//   cursor: pointer;
//   font-size: 14px;
// `;

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
  padding-bottom: 40px;

  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  overflow-y: auto;

  @media (min-width: 1000px) {
    margin-top: 70px; /* Corrigido para evitar sobreposição */
    margin-bottom: 75px;
  }
`;

export const ChatInputBar = styled.div`
  width: 100%;
  position: fixed;
  padding: 5px 5px;
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

  @media (min-width: 1000px) {
    padding: 10px 10px;
  }
`;

// export const EnterContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;

//   padding: 40px 10px;

//   h2 {
//     font-size: 30px;
//     color: #e9d4c4;
//     margin-bottom: 20px;

//     b {
//       color: #ff5100;
//     }
//   }

//   p {
//     font-size: 20px;
//     color: #e9d4c4;
//     //margin-top: 20px;

//     b {
//       color: #ff5100;
//     }
//   }

//   input {
//     margin: 10px;
//     padding: 10px;
//     border: 0;
//     outline: none;
//     font-size: 20px;
//     background-color: transparent;
//     color: #e9d4c4;
//     background-color: #212433;
//     border-radius: 10px;
//   }

//   button {
//     border: 0;
//     padding: 10px;
//     border-radius: 5px;
//     background-color: transparent;
//     cursor: pointer;
//     color: #e9d4c4;
//     font-size: 20px;
//     background-color: #212433;
//     margin: 10px 0px;
//   }

//   .withGoogle {
//     width: 300px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 10px;
//     margin: 20px;
//     cursor: pointer;
//     color: rgb(29, 29, 29);
//     background-color: #fff;

//     img {
//       width: 30px;
//       height: 30px;
//       border-radius: 50%;
//       object-fit: cover;
//     }
//   }
// `;

// export const FormContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;

//   height: 100vh;

//   h2 {
//     font-size: 30px;
//     color: #e9d4c4;
//     margin-bottom: 20px;

//     b {
//       color: #ff5100;
//     }
//   }

//   input {
//     width: 100%;
//     margin: 10px;
//     padding: 10px;
//     border: 0;
//     outline: none;
//     font-size: 20px;
//     background-color: transparent;
//     color: #e9d4c4;
//     background-color: #212433;
//     border-radius: 10px;
//   }

//   button {
//     width: 100%;
//     border: 0;
//     padding: 10px;
//     border-radius: 5px;
//     background-color: transparent;
//     cursor: pointer;
//     color: #e9d4c4;
//     font-size: 20px;
//     background-color: #212433;
//     margin: 10px 0px;
//   }
// `;

// export const Logo = styled.div`
//   text-align: center;
//   h1 {
//     font-size: 50px;
//     font-weight: bold;
//     padding-bottom: 20px;

//     b {
//       color: #ff5100;
//     }
//   }

//   p {
//     font-size: 16px;
//     color: #e9d4c4;
//     padding: 5px 0px;
//   }
// `;

export const TypingIndicator = styled.div`
  margin-bottom: 70px;

  display: flex;
  align-items: center;
  color: #a7a7a7;
  font-size: 14px;

  font-style: italic;
`;
