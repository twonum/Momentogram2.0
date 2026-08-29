import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState, useRef, useCallback } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom,
  );
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const { socket, onlineUsers } = useSocket();

  const [sidebarWidth, setSidebarWidth] = useState(350);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const bgCard = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const dividerColor = useColorModeValue("blue.400", "blue.500");
  const sidebarBg = useColorModeValue("white", "gray.900");

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    if (newWidth >= 300 && newWidth <= 500) setSidebarWidth(newWidth);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  }, [resize]);

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c._id === message.conversationId,
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: {
              text: message.text || "Sent an attachment",
              sender: message.sender,
              seen: false,
            },
          };
          const [moved] = updated.splice(existingIndex, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    });

    socket?.on("messagesSeen", ({ conversationId }) => {
      setConversations((prev) =>
        prev?.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: { ...c.lastMessage, seen: true } }
            : c,
        ),
      );
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen");
    };
  }, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) return showToast("Error", data.error, "error");

        if (selectedConversation?.userId) {
          const existingConv = data.find(
            (c) => c.participants?.[0]?._id === selectedConversation.userId,
          );
          if (existingConv) {
            setSelectedConversation({
              _id: existingConv._id,
              userId: existingConv.participants[0]._id,
              username: existingConv.participants[0].username,
              userProfilePic: existingConv.participants[0].profilePic,
            });
            setConversations(data);
          } else {
            setConversations([selectedConversation, ...data]);
          }
        } else {
          setConversations(data);
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };
    getConversations();
  }, [showToast, setConversations, selectedConversation?.userId]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error)
        return showToast("Error", searchedUser.error, "error");
      if (searchedUser._id === currentUser._id)
        return showToast("Error", "You cannot message yourself", "error");

      const existing = conversations.find(
        (c) => c.participants?.[0]?._id === searchedUser._id,
      );
      if (existing) {
        setSelectedConversation({
          _id: existing._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mock = {
        mock: true,
        lastMessage: { text: "", sender: "" },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prev) => [mock, ...prev]);
      setSelectedConversation({
        _id: mock._id,
        userId: searchedUser._id,
        username: searchedUser.username,
        userProfilePic: searchedUser.profilePic,
        mock: true,
      });
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position="relative"
      w="full"
      h="calc(100vh - 100px)"
      maxW="1200px"
      mx="auto"
      px={2}
      pb={4}
      overflow="hidden"
    >
      {/* MASTER WRAPPER: Rigid 100% height block */}
      <Flex
        ref={containerRef}
        w="100%"
        h="100%"
        flexDirection={{ base: "column", md: "row" }}
        bg={bgCard}
        borderRadius="24px"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="2xl"
      >
        {/* LEFT PANEL */}
        <Flex
          w={{ base: "full", md: `${sidebarWidth}px` }}
          minW={{ md: "300px" }}
          maxW={{ md: "500px" }}
          display={{
            base: selectedConversation?._id ? "none" : "flex",
            md: "flex",
          }}
          flexDirection="column"
          bg={sidebarBg}
          h="100%"
          flexShrink={0}
        >
          <Box p={5} pb={2}>
            <Text
              fontWeight={800}
              fontSize="2xl"
              px={2}
              pt={2}
              pb={2}
              tracking="tight"
            >
              Messages
            </Text>
            <form onSubmit={handleConversationSearch}>
              <InputGroup size="md" px={1}>
                <InputLeftElement pointerEvents="none" h="full" pl={3}>
                  <SearchIcon color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  placeholder="Search messages..."
                  borderRadius="full"
                  bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                  border="none"
                  pl={10}
                  py={5}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>
            </form>
          </Box>
          <Box flex={1} overflowY="auto" px={5} pb={5}>
            {loadingConversations &&
              [0, 1, 2, 3].map((_, i) => (
                <Flex key={i} gap={3} alignItems="center" p={3} mb={1}>
                  <SkeletonCircle size="12" />
                  <Flex w="full" flexDirection="column" gap={2}>
                    <Skeleton h="12px" w="100px" borderRadius="md" />
                    <Skeleton h="10px" w="75%" borderRadius="md" />
                  </Flex>
                </Flex>
              ))}
            {!loadingConversations &&
              conversations.map((conversation) => (
                <Box key={conversation._id} mb={1.5}>
                  <Conversation
                    isOnline={onlineUsers.includes(
                      conversation.participants?.[0]?._id,
                    )}
                    conversation={conversation}
                  />
                </Box>
              ))}
          </Box>
        </Flex>

        {/* RESIZER DRAG HANDLE */}
        <Box
          display={{ base: "none", md: "flex" }}
          w="6px"
          bg={borderColor}
          cursor="col-resize"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: dividerColor }}
          onMouseDown={startResizing}
          zIndex={10}
          flexShrink={0}
        >
          <Box w="1px" h="30px" bg="gray.400" />
        </Box>

        {/* RIGHT PANEL: Box instead of Flex stops flex-grow overflow bugs */}
        <Box
          flex={1}
          minW={0}
          w="100%"
          h="100%"
          display={{
            base: selectedConversation?._id ? "block" : "none",
            md: "block",
          }}
          bg={useColorModeValue("white", "gray.900")}
          overflow="hidden"
        >
          {!selectedConversation?._id ? (
            <Flex
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              h="100%"
              p={8}
              textAlign="center"
            >
              <Box
                p={6}
                bg={useColorModeValue("blue.50", "whiteAlpha.50")}
                borderRadius="full"
                mb={4}
                color="blue.400"
              >
                <GiConversation size={60} />
              </Box>
              <Text fontSize="lg" fontWeight="700" mb={1}>
                Select a conversation
              </Text>
              <Text fontSize="sm" color="gray.500" maxW="300px">
                Choose from your existing chats or search for a user to start
                messaging.
              </Text>
            </Flex>
          ) : (
            <MessageContainer />
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatPage;
