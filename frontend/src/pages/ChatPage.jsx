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
import { useEffect, useState } from "react";
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

  // Minimalist Sleek Tokens
  const bgCard = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const sidebarBg = useColorModeValue("white", "gray.900");
  const chatAreaBg = useColorModeValue("white", "gray.900");
  const inputBg = useColorModeValue("gray.50", "whiteAlpha.50");

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
    <Box
      position={"relative"}
      w="full"
      maxW="1100px"
      mx="auto"
      px={{ base: 2, md: 4 }}
      py={2}
    >
      <Flex
        gap={0}
        flexDirection={{ base: "column", md: "row" }}
        bg={bgCard}
        borderRadius="20px"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="lg"
        h={{ base: "calc(100vh - 120px)", md: "720px" }}
      >
        {/* Sleek Minimalist Sidebar */}
        <Flex
          flex={{
            base: selectedConversation?._id ? "0 0 0px" : "1",
            md: "340px",
          }}
          display={{
            base: selectedConversation?._id ? "none" : "flex",
            md: "flex",
          }}
          gap={3}
          flexDirection={"column"}
          p={4}
          bg={sidebarBg}
          borderRight="1px solid"
          borderColor={borderColor}
          overflowY="auto"
        >
          <Text
            fontWeight={700}
            fontSize="xl"
            px={2}
            pt={1}
            pb={1}
            tracking="tight"
          >
            Messages
          </Text>

          <form onSubmit={handleConversationSearch}>
            <InputGroup size="sm" px={1}>
              <InputLeftElement pointerEvents="none" h="full" pl={3}>
                <SearchIcon color="gray.400" boxSize={3.5} />
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
                pl={9}
                py={4}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </InputGroup>
          </form>

          <Box mt={1} overflowY="auto">
            {loadingConversations &&
              [0, 1, 2, 3].map((_, i) => (
                <Flex
                  key={i}
                  gap={3}
                  alignItems={"center"}
                  p={3}
                  mb={1}
                  borderRadius="xl"
                >
                  <SkeletonCircle size={"10"} />
                  <Flex w={"full"} flexDirection={"column"} gap={2}>
                    <Skeleton h={"10px"} w={"90px"} borderRadius="md" />
                    <Skeleton h={"8px"} w={"70%"} borderRadius="md" />
                  </Flex>
                </Flex>
              ))}

            {!loadingConversations &&
              Array.isArray(conversations) &&
              conversations.map((conversation) => (
                <Box key={conversation._id} mb={1}>
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

        {/* Clean, Bordered Minimalist Chat Area */}
        <Flex
          flex={{ base: selectedConversation?._id ? "1" : "0 0 0px", md: "1" }}
          display={{
            base: selectedConversation?._id ? "flex" : "none",
            md: "flex",
          }}
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          bg={chatAreaBg}
          position="relative"
        >
          {!selectedConversation?._id ? (
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              height={"100%"}
              p={6}
              textAlign="center"
            >
              <Box
                p={5}
                bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                borderRadius="full"
                mb={3}
                color="gray.400"
              >
                <GiConversation size={50} />
              </Box>
              <Text fontSize="md" fontWeight="600" color="gray.600" mb={1}>
                Select a chat
              </Text>
              <Text fontSize="xs" color="gray.400" maxW="240px">
                Choose from your existing conversations or search for a user to
                start messaging.
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
