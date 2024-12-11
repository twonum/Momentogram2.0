import {
  Button,
  Flex,
  Image,
  Link,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import MusicButton from "./MusicButton"; // Import the MusicButton component
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} mt={6} mb="12">
      {user && (
        <Link as={RouterLink} to="/">
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          Login
        </Link>
      )}

      <Flex alignItems={"center"} gap={4}>
        <Tooltip label="Toggle Theme" placement="top" hasArrow>
          <Image
            cursor={"pointer"}
            alt="logo"
            w={6}
            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
            onClick={toggleColorMode}
          />
        </Tooltip>
        <MusicButton /> {/* Add the MusicButton */}
        {user && (
          <>
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>
            <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={20} />
            </Link>
            <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={20} />
            </Link>
            <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </>
        )}
        {!user && (
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("signup")}
          >
            Sign up
          </Link>
        )}
      </Flex>
    </Flex>
  );
};

export default Header;
