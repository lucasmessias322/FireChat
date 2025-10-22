// import { IoEllipsisVertical, IoExitOutline } from "react-icons/io5";
// import styled from "styled-components";
// import FireLogo from "../../assets/Firechat.png";
// function Header({
//   setShowMenu,
//   showMenu,
//   username,
//   avatar,
//   handleLogout,
//   onClickUsers,
// }: any) {
//   return (
//     <HeaderWrapper>
//       <Logo>
//         {/* //<img width={25} src={FireLogo} alt="" /> */}
//         <h1>
//           <b>Fire</b>Chat
//         </h1>
//       </Logo>

//       <MenuWrapper>
//         <MenuIcon onClick={() => setShowMenu((s: any) => !s)}>
//           <IoEllipsisVertical size={24} />
//         </MenuIcon>
//         {showMenu && (
//           <Menu>
//             <MenuItem>
//               <img src={avatar} alt="avatar" width={32} height={32} />{" "}
//               {username}
//             </MenuItem>
//             <MenuItem onClick={onClickUsers}>Usuarios</MenuItem>
//             <MenuItem onClick={handleLogout}>
//               <IoExitOutline size={20} color="red" /> Sair
//             </MenuItem>
//           </Menu>
//         )}
//       </MenuWrapper>
//     </HeaderWrapper>
//   );
// }
// export default Header;

// const HeaderWrapper = styled.header`
//   display: flex;
//   justify-content: space-between;
//   padding: 20px;
//   border-bottom: 0.5px solid #cccccc49;

//   position: fixed;
//   top: 0;
//   width: 100%;
//   z-index: 99;
//   background-color: #181a25;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

//   h1 {
//     font-size: 25px;
//     font-weight: bold;

//     b {
//       color: #ff5100;
//     }
//   }
// `;

// const Logo = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 5px;
//   img {
//     width: 40px;
//     height: 40px;
//     object-fit: contain;
//   }
// `;

// const MenuWrapper = styled.div`
//   position: relative;
// `;

// const MenuIcon = styled.div`
//   cursor: pointer;
//   color: #e9d4c4;
// `;

// const Menu = styled.div`
//   position: absolute;
//   top: 30px;
//   right: 0;
//   background: #212433;
//   border-radius: 5px;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
//   overflow: hidden;
// `;

// const MenuItem = styled.div`
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

// const LogoutButton = styled.button`
//   background: transparent;
//   border: none;
//   color: #ff5100;
//   cursor: pointer;
//   font-size: 14px;
// `;

import {
  IoEllipsisVertical,
  IoExitOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import styled from "styled-components";
import FireLogo from "../../assets/Firechat.png";

function Header({
  setShowMenu,
  showMenu,
  username,
  avatar,
  handleLogout,
  onClickUsers,
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

      <MenuWrapper>
        {/* <MenuIcon onClick={() => setShowMenu((s: any) => !s)}>
          <IoEllipsisVertical size={24} />
        </MenuIcon> */}

        {/* {showMenu && (
          <Menu>
            <MenuItem>
              <img src={avatar} alt="avatar" width={32} height={32} /> {username}
            </MenuItem>
            <MenuItem onClick={onClickUsers}>
              <IoPeopleOutline size={20} /> Usuários
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <IoExitOutline size={20} color="red" /> Sair
            </MenuItem>
          </Menu>
        )} */}
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
