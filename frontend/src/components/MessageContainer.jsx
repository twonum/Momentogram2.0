import {
  Avatar,
  Divider,
  Flex,
  Image,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Message from "./Message";
import { useEffect, useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { BsFillImageFill } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import usePreviewImg from "../hooks/usePreviewImg";
import { CloseButton } from "@chakra-ui/close-button";
import { useSocket } from "../context/SocketContext";
import notificationSound from "../assets/sounds/notification.mp3";
import { Button } from "@chakra-ui/button";
import { useNavigate } from "react-router-dom";

const MessageContainer = () => {
  const showToast = useShowToast();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom,
  );
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const { socket } = useSocket();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef(null);
  const imageRef = useRef(null);

  const headerBg = useColorModeValue("white", "gray.950");
  const inputContainerBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  // Fallback helper to resolve avatar image fields correctly across different object structures
  const activeAvatar =
    selectedConversation.userProfilePic ||
    selectedConversation.profilePic ||
    "";

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      if (!document.hasFocus()) {
        const sound = new Audio(notificationSound);
        sound.play();
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => socket?.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    socket?.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      if (
        !selectedConversation?.userId ||
        selectedConversation.userId === "undefined"
      ) {
        setLoadingMessages(false);
        return;
      }

      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) {
          setLoadingMessages(false);
          return;
        }
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [selectedConversation?.userId, selectedConversation?.mock, showToast]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedConversation.userId,
          message: newMessage,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setMessages((prev) => [...prev, data]);

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: newMessage,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });

      setNewMessage("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const goToProfile = () => {
    if (selectedConversation?.username) {
      navigate(`/${selectedConversation.username}`);
    }
  };

  return (
    <Flex
      w="full"
      h="full"
      flexDirection="column"
      bg={useColorModeValue("white", "gray.900")}
      borderTopRightRadius="20px"
      borderBottomRightRadius="20px"
      overflow="hidden"
    >
      {/* Clickable Chat Header opening User Profile */}
      <Flex
        w={"full"}
        h={16}
        alignItems={"center"}
        px={5}
        gap={3}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        flexShrink={0}
        cursor="pointer"
        _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.50") }}
        onClick={goToProfile}
      >
        <Avatar src={activeAvatar} size={"sm"} />
        <Text
          display={"flex"}
          alignItems={"center"}
          fontWeight={"bold"}
          fontSize="md"
          isTruncated
        >
          {selectedConversation.username}{" "}
          <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
      </Flex>

      {/* Messages Scroll Area */}
      <Flex
        flex={1}
        flexDirection={"column"}
        px={5}
        py={4}
        overflowY={"auto"}
        overflowX={"hidden"}
        gap={4}
        w="full"
      >
        {loadingMessages &&
          [0, 1, 2, 4, 5].map((_, i) => (
            <Flex
              key={i}
              gap={3}
              alignItems={"center"}
              p={1}
              borderRadius={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Skeleton h={"40px"} w={"250px"} borderRadius="xl" />
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {!loadingMessages &&
          messages.map((message, idx) => (
            <Flex
              key={message._id}
              direction="column"
              w="full"
              maxW="100%"
              overflow="hidden"
              ref={idx === messages.length - 1 ? messageEndRef : null}
            >
              <Message
                message={message}
                ownMessage={currentUser._id === message.sender}
              />
              {idx < messages.length - 1 && (
                <Divider
                  my={2}
                  opacity={0.15}
                  borderColor="gray.400"
                  w="60%"
                  mx="auto"
                />
              )}
            </Flex>
          ))}
      </Flex>

      {/* Image Preview Container if attached */}
      {imgUrl && (
        <Flex
          px={5}
          py={2}
          bg={inputContainerBg}
          align="center"
          gap={3}
          flexShrink={0}
        >
          <Image
            src={imgUrl}
            alt="Selected img"
            w="60px"
            h="60px"
            objectFit="cover"
            borderRadius="lg"
          />
          <CloseButton onClick={() => setImgUrl("")} />
        </Flex>
      )}

      {/* Modern Sleek Input Footer */}
      <form onSubmit={handleSendMessage} style={{ width: "100%" }}>
        <Flex
          alignItems={"center"}
          px={4}
          py={3}
          bg={inputContainerBg}
          borderTop="1px solid"
          borderColor={borderColor}
          gap={3}
          w="full"
          flexShrink={0}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            borderRadius="full"
            bg={useColorModeValue("white", "whiteAlpha.150")}
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
            py={5}
            flex={1}
            minW="0"
            wordBreak="break-word"
            _focus={{ borderColor: "blue.400", boxShadow: "none" }}
          />
          <input
            type="file"
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          />
          <Button
            size="md"
            borderRadius="full"
            variant="ghost"
            onClick={() => imageRef.current.click()}
            colorScheme="gray"
            p={3}
            flexShrink={0}
          >
            <BsFillImageFill size={20} />
          </Button>
          <Button
            size="md"
            borderRadius="full"
            colorScheme="blue"
            type="submit"
            isLoading={isSending}
            px={5}
            flexShrink={0}
          >
            <IoSend size={16} />
          </Button>
        </Flex>
      </form>
    </Flex>
  );
};

export default MessageContainer;
