import styled from "styled-components";
import FireLogo from "../../assets/Firechat.png";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useRef } from "react";

function Header({
  onOpenGroupInfo,
  avatar,
  username,
  showMenu,
  setShowMenu,
  handleLogout,
}: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // limpeza
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, setShowMenu]);

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
    </HeaderWrapper>
  );
}

export default Header;

// ====== Styled ======
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

  img {
    width: 35px;
    height: 35px;
    object-fit: contain;
  }
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

  img {
    width: 35px;
    height: 35px;
    object-fit: cover;
    border-radius: 50%;
  }

  button {
    width: 100%;
    background: none;
    border: 1px solid #ff1100;
    padding: 10px 15px;
    border-radius: 5px;
    color: #e9d4c4;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #ff1100;
    }
  }
`;
