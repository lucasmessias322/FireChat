import styled from "styled-components";
import FireLogo from "../../assets/Firechat.png";
import { BsThreeDotsVertical } from "react-icons/bs";

function Header({
  onOpenGroupInfo, // 👈 novo
}: any) {
  return (
    <HeaderWrapper>
      <Logo onClick={onOpenGroupInfo}>
        <img width={40} src={FireLogo} alt="logo" />
        <h1>
          <b>Fire</b>Chat
        </h1>
      </Logo>

      {/* <BsThreeDotsVertical size={20} /> */}
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

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuIcon = styled.div`
  cursor: pointer;
  color: #e9d4c4;
`;

const Menu = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: #212433;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-width: 180px;
`;

const MenuItem = styled.div`
  padding: 15px 18px;
  font-size: 14px;
  color: #e9d4c4;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: #2a2f42;
  }

  img {
    width: 35px;
    height: 35px;
    object-fit: cover;
    border-radius: 50%;
  }
`;
