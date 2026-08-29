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
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiSearch, FiBell, FiArrowLeft } from "react-icons/fi";
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
  const location = useLocation();

  const hoverBg = useColorModeValue("gray.100", "gray.700");

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
    const targetId = searchedUser?._id || searchedUser?.id;
    if (!targetId) return;

    setSelectedConversation({
      _id: Date.now(),
      userId: targetId,
      username: searchedUser.username,
      userProfilePic: searchedUser.profilePic,
      mock: true,
    });
    navigate("/chat");
  };

  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (res.status === 401 || data.error?.includes("deleted")) {
          localStorage.removeItem("user-threads");
          window.location.href = "/auth";
          return;
        }
        if (!data.error && Array.isArray(data)) setNotifications(data);
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

  const showBackButton = location.pathname !== "/";

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      mt={{ base: 3, md: 6 }}
      mb={{ base: 6, md: "12" }}
      px={{ base: 2, md: 0 }}
      wrap="wrap"
      gap={3}
    >
      <Flex gap={{ base: 2, md: 3 }} alignItems="center" wrap="wrap">
        {showBackButton && (
          <Tooltip label="Go Back" hasArrow placement="bottom">
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              p={2}
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft size={20} />
            </Button>
          </Tooltip>
        )}

        {user && (
          <Tooltip label="Home Feed" hasArrow placement="bottom">
            <Link as={RouterLink} to="/">
              <AiFillHome size={22} />
            </Link>
          </Tooltip>
        )}
        {user && (
          <Tooltip label="Search Users" hasArrow placement="bottom">
            <Box cursor="pointer" onClick={onOpen} p={1}>
              <FiSearch size={20} />
            </Box>
          </Tooltip>
        )}
        {user && (user.role === "admin" || user.role === "superadmin") && (
          <Tooltip label="Admin Dashboard" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/admin`}>
              <MdOutlineAdminPanelSettings size={22} color="red" />
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
          w={5}
          src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
        />
      </Tooltip>

      {user && (
        <Flex alignItems={"center"} gap={{ base: 2, md: 4 }} wrap="wrap">
          <Tooltip label="Notifications" hasArrow placement="bottom">
            <Box>
              <Menu onOpen={handleMarkAsRead}>
                <MenuButton
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  p={1}
                >
                  <Flex alignItems="center" position="relative">
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-1"
                        right="-2"
                        borderRadius="full"
                        fontSize="10px"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </MenuButton>
                <MenuList
                  maxH="300px"
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
                    notifications.map((notif) => {
                      if (!notif || !notif.sender) return null;
                      return (
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
                              <b>{notif.sender.username}</b> started following
                              you
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </Text>
                          </Box>
                        </MenuItem>
                      );
                    })
                  )}
                </MenuList>
              </Menu>
            </Box>
          </Tooltip>

          <Tooltip label="My Profile" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={22} />
            </Link>
          </Tooltip>

          <Tooltip label="Chat" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={18} />
            </Link>
          </Tooltip>

          <Tooltip label="Settings" hasArrow placement="bottom">
            <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={18} />
            </Link>
          </Tooltip>

          <Tooltip label="Logout" hasArrow placement="bottom">
            <Button size={"xs"} onClick={logout} px={2}>
              <FiLogOut size={16} />
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
              {Array.isArray(searchResults) &&
                searchResults.map((u) => {
                  if (!u) return null;
                  return (
                    <Flex
                      key={u._id || Math.random()}
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
                          if (u.username) navigate(`/${u.username}`);
                        }}
                      >
                        <Avatar
                          src={u.profilePic}
                          name={u.name || u.username}
                        />
                        <Box>
                          <Text fontWeight="bold">
                            {u.username || "Unknown"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {u.name}
                          </Text>
                        </Box>
                      </Flex>
                      {user && u._id !== user._id && (
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
                  );
                })}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Header;
