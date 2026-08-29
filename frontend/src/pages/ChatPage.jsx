import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
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

  const bgCard = useColorModeValue("white", "gray.dark");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

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

        // If a mock conversation was passed via atom from a profile click, handle it seamlessly
        if (selectedConversation?.mock && selectedConversation?.userId) {
          const exists = data.find(
            (c) => c.participants[0]?._id === selectedConversation.userId,
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
          conversation.participants[0]?._id === searchedUser._id,
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
      maxW="1000px"
      mx="auto"
      p={{ base: 2, md: 4 }}
    >
      <Flex
        gap={4}
        flexDirection={{ base: "column", md: "row" }}
        bg={bgCard}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="lg"
        minH="600px"
      >
        {/* Conversation Sidebar */}
        <Flex
          flex={{ base: selectedConversation?._id ? "0 0 0px" : "1", md: "35" }}
          display={{
            base: selectedConversation?._id ? "none" : "flex",
            md: "flex",
          }}
          gap={3}
          flexDirection={"column"}
          p={4}
          borderRight="1px solid"
          borderColor={borderColor}
        >
          <Text fontWeight={700} fontSize="lg" mb={2}>
            Messages
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="Search user..."
                borderRadius="full"
                size="sm"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                size={"sm"}
                borderRadius="full"
                colorScheme="blue"
                type="submit"
                isLoading={searchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversations &&
            [0, 1, 2, 3].map((_, i) => (
              <Flex key={i} gap={4} alignItems={"center"} p={2}>
                <SkeletonCircle size={"10"} />
                <Flex w={"full"} flexDirection={"column"} gap={2}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}

          {!loadingConversations &&
            Array.isArray(conversations) &&
            conversations.map((conversation) => (
              <Conversation
                key={conversation._id}
                isOnline={onlineUsers.includes(
                  conversation.participants?.[0]?._id, // Added safe optional chaining here
                )}
                conversation={conversation}
              />
            ))}
        </Flex>

        {/* Chat Box Area */}
        <Flex
          flex={{ base: selectedConversation?._id ? "1" : "0 0 0px", md: "65" }}
          display={{
            base: selectedConversation?._id ? "flex" : "none",
            md: "flex",
          }}
          flexDir="column"
          justifyContent="center"
          alignItems="center"
        >
          {!selectedConversation?._id ? (
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              height={"100%"}
              p={6}
              color="gray.500"
            >
              <GiConversation size={80} />
              <Text fontSize="lg" fontWeight="500" mt={4}>
                Select a conversation to start messaging
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
