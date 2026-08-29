import {
  Button,
  Flex,
  Image,
  Link,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  Box,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiSearch, FiBell } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineAdminPanelSettings, MdOutlineSettings } from "react-icons/md";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();

  const hoverBg = useColorModeValue("gray.100", "gray.700");

  // Search Logic
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search/${searchText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSearching(false);
    }
  };
  const handleDirectMessage = (searchedUser) => {
    onClose();
    setSelectedConversation({
      _id: Date.now(),
      userId: searchedUser._id, // Explicitly mapped to searchedUser._id
      username: searchedUser.username,
      userProfilePic: searchedUser.profilePic,
      mock: true,
    });
    navigate("/chat");
  };
  // Notifications Logic
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!data.error) setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch("/api/notifications/read", { method: "PUT" });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} mt={6} mb="12">
      <Flex gap={4} alignItems="center">
        {user && (
          <Tooltip label="Home Feed" hasArrow placement="bottom">
            <Link as={RouterLink} to="/">
              <AiFillHome size={24} />
            </Link>
          </Tooltip>
        )}
        {user && (
          <Tooltip label="Search Users" hasArrow placement="bottom">
            <Box cursor="pointer" onClick={onOpen}>
              <FiSearch size={22} />
            </Box>
          </Tooltip>
        )}
        {user && (user.role === "admin" || user.role === "superadmin") && (
          <Tooltip label="Admin Dashboard" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/admin`}>
              <MdOutlineAdminPanelSettings size={24} color="red" />
            </Link>
          </Tooltip>
        )}
      </Flex>

      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          Login
        </Link>
      )}

      <Tooltip label="Toggle Dark/Light Mode" placement="bottom" hasArrow>
        <Image
          cursor={"pointer"}
          alt="logo"
          w={6}
          src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
        />
      </Tooltip>

      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Tooltip label="Notifications" hasArrow placement="bottom">
            <Box>
              <Menu onOpen={handleMarkAsRead}>
                <MenuButton
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Flex alignItems="center" position="relative">
                    <FiBell size={22} />
                    {unreadCount > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-1"
                        right="-2"
                        borderRadius="full"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </MenuButton>
                <MenuList
                  maxH="380px"
                  overflowY="auto"
                  p={2}
                  borderRadius="xl"
                  boxShadow="xl"
                  bg={useColorModeValue("white", "gray.dark")}
                >
                  <Text
                    px={3}
                    py={2}
                    fontWeight="bold"
                    fontSize="sm"
                    borderBottom="1px solid"
                    borderColor={useColorModeValue(
                      "gray.100",
                      "whiteAlpha.100",
                    )}
                    mb={1}
                  >
                    Notifications
                  </Text>
                  {notifications.length === 0 ? (
                    <Text
                      textAlign="center"
                      py={6}
                      fontSize="sm"
                      color="gray.500"
                    >
                      No new notifications
                    </Text>
                  ) : (
                    notifications.map((notif) => (
                      <MenuItem
                        key={notif._id}
                        as={RouterLink}
                        to={`/${notif.sender.username}`}
                        borderRadius="lg"
                        p={3}
                        mb={1}
                        bg={
                          !notif.read
                            ? useColorModeValue("blue.50", "whiteAlpha.50")
                            : "transparent"
                        }
                        _hover={{
                          bg: useColorModeValue("gray.100", "whiteAlpha.200"),
                        }}
                      >
                        <Avatar
                          src={notif.sender.profilePic}
                          size="sm"
                          mr={3}
                        />
                        <Box>
                          <Text fontSize="sm">
                            <b>{notif.sender.username}</b> started following you
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </MenuList>
              </Menu>
            </Box>
          </Tooltip>

          <Tooltip label="My Profile" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>
          </Tooltip>

          <Tooltip label="Chat" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={20} />
            </Link>
          </Tooltip>

          <Tooltip label="Settings" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={20} />
            </Link>
          </Tooltip>

          <Tooltip label="Logout" hasArrow placement="bottom">
            <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </Tooltip>
        </Flex>
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

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search Users</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSearch}>
              <Flex gap={2}>
                <Input
                  placeholder="Search by name or username..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                  type="submit"
                  isLoading={isSearching}
                  colorScheme="blue"
                >
                  Search
                </Button>
              </Flex>
            </form>
            <Flex direction="column" mt={6} gap={2}>
              {searchResults.map((u) => (
                <Flex
                  key={u._id}
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  _hover={{ bg: hoverBg }}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  <Flex
                    gap={3}
                    alignItems="center"
                    cursor="pointer"
                    onClick={() => {
                      onClose();
                      navigate(`/${u.username}`);
                    }}
                  >
                    <Avatar src={u.profilePic} name={u.name} />
                    <Box>
                      <Text fontWeight="bold">{u.username}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {u.name}
                      </Text>
                    </Box>
                  </Flex>
                  {u._id !== user._id && (
                    <Button
                      size="sm"
                      borderRadius="full"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleDirectMessage(u)}
                    >
                      Chat
                    </Button>
                  )}
                </Flex>
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Header;
