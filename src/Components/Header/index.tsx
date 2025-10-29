
// import styled from "styled-components";
// import FireLogo from "../../assets/Firechat.png";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { doc, updateDoc } from "firebase/firestore";
// import { db, auth } from "../../firebase";
// import { toast } from "react-toastify";

// function Header({
//   onOpenGroupInfo,
//   avatar,
//   username,
//   showMenu,
//   setShowMenu,
//   handleLogout,
// }: any) {
//   const menuRef = useRef<HTMLDivElement>(null);
//   const [showAvatarModal, setShowAvatarModal] = useState(false);
//   const [avatarStyle, setAvatarStyle] = useState("fun-emoji");

//   // Fecha o menu se clicar fora
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setShowMenu(false);
//       }
//     }

//     if (showMenu) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showMenu, setShowMenu]);

//   // 🔹 Estilos disponíveis da DiceBear
//   const availableStyles = [
//     "fun-emoji",
//     "pixel-art",
//     "bottts",
//     "notionists",
//     "thumbs",
//   ];

//   const avatarPreview = useMemo(() => {
//     const seed = auth.currentUser?.uid || username || "guest";
//     return `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(
//       seed
//     )}`;
//   }, [avatarStyle, username]);

//   // 🔹 Salvar novo avatar no Firestore
//   const handleSaveAvatar = async () => {
//     try {
//       const uid = auth.currentUser?.uid;
//       if (!uid) return;
//       await updateDoc(doc(db, "users", uid), {
//         avatar: avatarPreview,
//         avatarStyle,
//       });
//       toast.success("Avatar atualizado com sucesso!");
//       setShowAvatarModal(false);
//     } catch (err: any) {
//       toast.error(`Erro ao atualizar avatar: ${err.message}`);
//     }
//   };

//   return (
//     <HeaderWrapper>
//       <Logo onClick={onOpenGroupInfo}>
//         <img width={40} src={FireLogo} alt="logo" />
//         <h1>
//           <b>Fire</b>Chat
//         </h1>
//       </Logo>

//       <MenuWrapper ref={menuRef}>
//         <BsThreeDotsVertical
//           size={20}
//           onClick={() => setShowMenu((prev: boolean) => !prev)}
//           style={{ cursor: "pointer" }}
//         />

//         <Menu className={showMenu ? "show" : ""}>
//           <MenuItem>
//             <UserAvatar
//               onClick={() => setShowAvatarModal(true)}
//               src={
//                 avatar ||
//                 "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
//               }
//             />
//             {username}
//           </MenuItem>

         

//           <MenuItem>
//             <button onClick={handleLogout}>Desconectar-se</button>
//           </MenuItem>
//         </Menu>
//       </MenuWrapper>

//       {/* 🔹 Modal de seleção de avatar */}
//       {showAvatarModal && (
//         <AvatarModalOverlay>
//           <AvatarModal>
//             <h2>Escolha seu novo avatar</h2>
//             <AvatarGrid>
//               {availableStyles.map((style) => (
//                 <AvatarOption
//                   key={style}
//                   onClick={() => setAvatarStyle(style)}
//                   className={avatarStyle === style ? "active" : ""}
//                 >
//                   <img
//                     src={`https://api.dicebear.com/9.x/${style}/svg?seed=demo`}
//                     alt={style}
//                   />
//                 </AvatarOption>
//               ))}
//             </AvatarGrid>

//             <AvatarPreview>
//               <img src={avatarPreview} alt="Preview" />
//               <span>Pré-visualização</span>
//             </AvatarPreview>

//             <ModalButtons>
//               <button onClick={() => setShowAvatarModal(false)}>
//                 Cancelar
//               </button>
//               <button className="save" onClick={handleSaveAvatar}>
//                 Salvar
//               </button>
//             </ModalButtons>
//           </AvatarModal>
//         </AvatarModalOverlay>
//       )}
//     </HeaderWrapper>
//   );
// }

// export default Header;

// // ====== Styled Components ======

// const HeaderWrapper = styled.header`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 16px 20px;
//   border-bottom: 0.5px solid #cccccc49;
//   position: fixed;
//   top: 0;
//   width: 100%;
//   z-index: 99;
//   background-color: #181a25;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

//   h1 {
//     font-size: 22px;
//     font-weight: bold;
//     cursor: pointer;

//     b {
//       color: #ff5100;
//     }
//   }
// `;

// const Logo = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   cursor: pointer;

//   img {
//     width: 35px;
//     height: 35px;
//     object-fit: contain;
//   }
// `;

// const UserAvatar = styled.img`
//   width: 35px;
//   height: 35px;
//   border-radius: 50%;
//   object-fit: cover;
//   cursor: pointer;
// `;

// const MenuWrapper = styled.div`
//   position: relative;
// `;

// const Menu = styled.div`
//   position: absolute;
//   top: 45px;
//   right: 0;
//   background: #212433;
//   border-radius: 8px;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
//   overflow: hidden;
//   min-width: 180px;
//   opacity: 0;
//   transform: translateY(-10px);
//   pointer-events: none;
//   transition: opacity 0.25s ease, transform 0.25s ease;

//   &.show {
//     opacity: 1;
//     transform: translateY(0);
//     pointer-events: auto;
//   }
// `;

// const MenuItem = styled.div`
//   padding: 15px 18px;
//   font-size: 14px;
//   color: #e9d4c4;
//   display: flex;
//   gap: 10px;
//   align-items: center;
//   cursor: pointer;

//   button {
//     width: 100%;
//     background: none;
//     border: 1px solid #ff5100;
//     padding: 10px 15px;
//     border-radius: 5px;
//     color: #e9d4c4;
//     font-size: 14px;
//     cursor: pointer;
//     transition: background 0.2s ease;

//     &:hover {
//       background: #ff5100;
//     }
//   }
// `;

// // ====== Modal ======
// const AvatarModalOverlay = styled.div`
//   position: fixed;
//   inset: 0;
//   background: rgba(0, 0, 0, 0.65);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 999;
// `;

// const AvatarModal = styled.div`
//   background: #181a25;
//   border-radius: 16px;
//   padding: 30px;
//   width: 400px;
//   max-width: 90%;
//   text-align: center;
//   color: #e9d4c4;
//   box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);

//   h2 {
//     margin-bottom: 15px;
//   }
// `;

// const AvatarGrid = styled.div`
//   display: flex;
//   gap: 10px;
//   margin: 10px 0;
//   flex-wrap: wrap;
//   justify-content: center;
// `;

// const AvatarOption = styled.div`
//   width: 55px;
//   height: 55px;
//   border-radius: 50%;
//   border: 2px solid transparent;
//   cursor: pointer;
//   transition: 0.2s;
//   overflow: hidden;
//   background-color: #212433;

//   &.active {
//     border-color: #ff5100;
//     transform: scale(1.1);
//   }

//   img {
//     width: 100%;
//     height: 100%;
//   }

//   &:hover {
//     transform: scale(1.05);
//   }
// `;

// const AvatarPreview = styled.div`
//   margin: 10px 0;
//   text-align: center;

//   img {
//     width: 80px;
//     height: 80px;
//     border-radius: 50%;
//     background-color: #212433;
//   }

//   span {
//     display: block;
//     margin-top: 6px;
//     font-size: 14px;
//     color: #aaa;
//   }
// `;

// const ModalButtons = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-top: 15px;
//   gap: 10px;

//   button {
//     flex: 1;
//     padding: 10px;
//     border-radius: 6px;
//     border: none;
//     cursor: pointer;
//     font-size: 15px;
//     transition: 0.2s;

//     &.save {
//       background-color: #ff5100;
//       color: white;

//       &:hover {
//         background-color: #ff6a00;
//       }
//     }

//     &:not(.save) {
//       background-color: #2b2f41;
//       color: #e9d4c4;

//       &:hover {
//         background-color: #3a3f55;
//       }
//     }
//   }
// `;

import styled from "styled-components";
import FireLogo from "../../assets/Firechat.png";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useRef, useState, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { toast } from "react-toastify";

function Header({
  onOpenGroupInfo,
  avatar,
  username,
  showMenu,
  setShowMenu,
  handleLogout,
}: any) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState("fun-emoji");
  const [selectedSeed, setSelectedSeed] = useState("default");

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, setShowMenu]);

  // 🔹 Lista completa de estilos populares da DiceBear v9
  const availableStyles = [
    "fun-emoji",
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "bottts",
    "croodles",
    "croodles-neutral",
    "identicon",
    "micah",
    "miniavs",
    "notionists",
    "notionists-neutral",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "shapes",
    "thumbs",
  ];

  // 🔹 Gera variações de seeds (para pré-visualização)
  const seedOptions = useMemo(() => {
    const base = auth.currentUser?.uid || username || "guest";
    return Array.from({ length: 12 }, (_, i) => `${base}-${i + 1}`);
  }, [username]);

  // 🔹 Gera a URL do avatar selecionado
  const avatarPreview = useMemo(() => {
    const seed = selectedSeed || "default";
    return `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(
      seed
    )}`;
  }, [avatarStyle, selectedSeed]);

  // 🔹 Salvar novo avatar
  const handleSaveAvatar = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await updateDoc(doc(db, "users", uid), {
        avatar: avatarPreview,
        avatarStyle,
        avatarSeed: selectedSeed,
      });
      toast.success("Avatar atualizado com sucesso!");
      setShowAvatarModal(false);
    } catch (err: any) {
      toast.error(`Erro ao atualizar avatar: ${err.message}`);
    }
  };

  return (
    <HeaderWrapper>
      <Logo onClick={onOpenGroupInfo}>
        <img width={40} src={FireLogo} alt="logo" />
        <h1>
          <b>Fire</b>Chat
        </h1>
      </Logo>

      <MenuWrapper ref={menuRef}>
        <BsThreeDotsVertical
          size={20}
          onClick={() => setShowMenu((prev: boolean) => !prev)}
          style={{ cursor: "pointer" }}
        />

        <Menu className={showMenu ? "show" : ""}>
          <MenuItem>
            <UserAvatar
              onClick={() => setShowAvatarModal(true)}
              src={
                avatar ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
            />
            {username}
          </MenuItem>

          <MenuItem>
            <button onClick={handleLogout}>Desconectar-se</button>
          </MenuItem>
        </Menu>
      </MenuWrapper>

      {/* 🔹 Modal de seleção de avatar */}
      {showAvatarModal && (
        <AvatarModalOverlay>
          <AvatarModal>
            <h2>Escolha seu novo avatar</h2>

            {/* ===== Escolher estilo ===== */}
            <StyleSelector>
              <label>Estilo:</label>
              <select
                value={avatarStyle}
                onChange={(e) => setAvatarStyle(e.target.value)}
              >
                {availableStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </StyleSelector>

            {/* ===== Variações do estilo ===== */}
            <AvatarGrid>
              {seedOptions.map((seed) => (
                <AvatarOption
                  key={seed}
                  onClick={() => setSelectedSeed(seed)}
                  className={selectedSeed === seed ? "active" : ""}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(
                      seed
                    )}`}
                    alt={seed}
                  />
                </AvatarOption>
              ))}
            </AvatarGrid>

            <AvatarPreview>
              <img src={avatarPreview} alt="Preview" />
              <span>Pré-visualização</span>
              <StyleName>
                {avatarStyle} — {selectedSeed.split("-").pop()}
              </StyleName>
            </AvatarPreview>

            <ModalButtons>
              <button onClick={() => setShowAvatarModal(false)}>Cancelar</button>
              <button className="save" onClick={handleSaveAvatar}>
                Salvar
              </button>
            </ModalButtons>
          </AvatarModal>
        </AvatarModalOverlay>
      )}
    </HeaderWrapper>
  );
}

export default Header;

// ====== Styled Components ======
const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 0.5px solid #cccccc49;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 99;
  background-color: #181a25;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  h1 {
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    b {
      color: #ff5100;
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const UserAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  background: #212433;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-width: 180px;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const MenuItem = styled.div`
  padding: 15px 18px;
  font-size: 14px;
  color: #e9d4c4;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  button {
    width: 100%;
    background: none;
    border: 1px solid #ff5100;
    padding: 10px 15px;
    border-radius: 5px;
    color: #e9d4c4;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
      background: #ff5100;
    }
  }
`;

// ====== Modal ======
const AvatarModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const AvatarModal = styled.div`
  background: #181a25;
  border-radius: 16px;
  padding: 25px;
  width: 500px;
  max-width: 95%;
  text-align: center;
  color: #e9d4c4;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
  h2 {
    margin-bottom: 15px;
  }
`;

const StyleSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;

  label {
    font-size: 15px;
    color: #ffb380;
  }

  select {
    background: #212433;
    color: #e9d4c4;
    border: none;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
  }
`;

const AvatarGrid = styled.div`
  display: flex;
  gap: 8px;
  margin: 10px 0;
  flex-wrap: wrap;
  justify-content: center;
  max-height: 240px;
  overflow-y: auto;
`;

const AvatarOption = styled.div`
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: 0.2s;
  overflow: hidden;
  background-color: #212433;
  &.active {
    border-color: #ff5100;
    transform: scale(1.1);
  }
  img {
    width: 100%;
    height: 100%;
  }
  &:hover {
    transform: scale(1.05);
  }
`;

const AvatarPreview = styled.div`
  margin: 15px 0;
  text-align: center;
  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: #212433;
  }
  span {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    color: #aaa;
  }
`;

const StyleName = styled.div`
  font-size: 12px;
  color: #ffb380;
  margin-top: 3px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  gap: 10px;
  button {
    flex: 1;
    padding: 10px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    transition: 0.2s;
    &.save {
      background-color: #ff5100;
      color: white;
      &:hover {
        background-color: #ff6a00;
      }
    }
    &:not(.save) {
      background-color: #2b2f41;
      color: #e9d4c4;
      &:hover {
        background-color: #3a3f55;
      }
    }
  }
`;
