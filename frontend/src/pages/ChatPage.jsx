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

  // Resizable Sidebar Width (Default = 350px)
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const bgCard = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const dividerColor = useColorModeValue("blue.400", "blue.500");
  const sidebarBg = useColorModeValue("white", "gray.900");
  const chatAreaBg = useColorModeValue("white", "gray.900");
  const inputBg = useColorModeValue("gray.50", "whiteAlpha.50");

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

    // Boundaries: Min 88px (Avatar mode) to Max 500px
    if (newWidth >= 88 && newWidth <= 500) {
      setSidebarWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  }, [resize]);

  const isCompact = sidebarWidth < 230;

  useEffect(() => {
    socket?.on("messagesSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev?.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: { ...conversation.lastMessage, seen: true },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error || data.message) {
          showToast("Error", data.error || data.message, "error");
          return;
        }

        if (selectedConversation?.mock && selectedConversation?.userId) {
          const exists = data.find(
            (c) => c.participants?.[0]?._id === selectedConversation.userId,
          );
          if (!exists) {
            setConversations([selectedConversation, ...data]);
          } else {
            setSelectedConversation(exists);
            setConversations(data);
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
  }, [showToast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();

      if (searchedUser.error || searchedUser.message) {
        showToast("Error", searchedUser.error || searchedUser.message, "error");
        return;
      }

      if (searchedUser._id === currentUser._id) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }

      const conversationAlreadyExists = conversations.find(
        (conversation) =>
          conversation.participants?.[0]?._id === searchedUser._id,
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversation = {
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
      setConversations((prevConvs) => [mockConversation, ...prevConvs]);
      setSelectedConversation({
        _id: mockConversation._id,
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
    // Expanded full-width & full-height container layout
    <Box
      position={"relative"}
      w="full"
      h="calc(100vh - 110px)"
      maxW="100%"
      mx="auto"
      px={2}
      pb={2}
    >
      <Flex
        ref={containerRef}
        gap={0}
        flexDirection={{ base: "column", md: "row" }}
        bg={bgCard}
        borderRadius="24px"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="2xl"
        w="full"
        h="full"
      >
        {/* Resizable Sidebar */}
        <Flex
          w={{ base: "full", md: `${sidebarWidth}px` }}
          minW={{ md: "88px" }}
          maxW={{ md: "500px" }}
          display={{
            base: selectedConversation?._id ? "none" : "flex",
            md: "flex",
          }}
          gap={3}
          flexDirection={"column"}
          p={isCompact ? 2 : 5}
          bg={sidebarBg}
          overflowY="auto"
          h="full"
          flexShrink={0}
          transition="padding 0.2s ease"
        >
          {!isCompact && (
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
          )}

          {!isCompact && (
            <form onSubmit={handleConversationSearch}>
              <InputGroup size="md" px={1}>
                <InputLeftElement pointerEvents="none" h="full" pl={3}>
                  <SearchIcon color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  placeholder="Search messages..."
                  borderRadius="full"
                  bg={inputBg}
                  borderColor="transparent"
                  _hover={{ borderColor: "gray.300" }}
                  _focus={{
                    bg: "transparent",
                    borderColor: "blue.400",
                    boxShadow: "none",
                  }}
                  pl={10}
                  py={5}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>
            </form>
          )}

          <Box mt={2} overflowY="auto" flex={1}>
            {loadingConversations &&
              [0, 1, 2, 3].map((_, i) => (
                <Flex
                  key={i}
                  gap={3}
                  alignItems={"center"}
                  p={3}
                  mb={1}
                  borderRadius="xl"
                  justify={isCompact ? "center" : "flex-start"}
                >
                  <SkeletonCircle size={"12"} />
                  {!isCompact && (
                    <Flex w={"full"} flexDirection={"column"} gap={2}>
                      <Skeleton h={"12px"} w={"100px"} borderRadius="md" />
                      <Skeleton h={"10px"} w={"75%"} borderRadius="md" />
                    </Flex>
                  )}
                </Flex>
              ))}

            {!loadingConversations &&
              Array.isArray(conversations) &&
              conversations.map((conversation) => (
                <Box key={conversation._id} mb={1.5}>
                  <Conversation
                    isOnline={onlineUsers.includes(
                      conversation.participants?.[0]?._id,
                    )}
                    conversation={conversation}
                    isCompact={isCompact}
                  />
                </Box>
              ))}
          </Box>
        </Flex>

        {/* Draggable Divider Handle */}
        <Box
          display={{ base: "none", md: "flex" }}
          w="6px"
          bg={borderColor}
          cursor="col-resize"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: dividerColor }}
          transition="background 0.2s"
          onMouseDown={startResizing}
          zIndex={10}
        >
          <Box w="1px" h="30px" bg="gray.400" />
        </Box>

        {/* Immersive Full-Size Chat Area */}
        <Flex
          flex={1}
          display={{
            base: selectedConversation?._id ? "flex" : "none",
            md: "flex",
          }}
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          bg={chatAreaBg}
          position="relative"
          h="full"
          overflow="hidden"
        >
          {!selectedConversation?._id ? (
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              height={"100%"}
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
                messaging across the platform.
              </Text>
            </Flex>
          ) : (
            <MessageContainer />
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default ChatPage;
