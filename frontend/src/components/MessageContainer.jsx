import {
  Avatar,
  Divider,
  Flex,
  Box,
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
import { FiArrowLeft } from "react-icons/fi";
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
  const { handleImageChange, imgUrl, setImgUrl, fileType, setFileType } =
    usePreviewImg();
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef(null);
  const imageRef = useRef(null);

  const headerBg = useColorModeValue("white", "gray.950");
  const inputContainerBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId)
        setMessages((prev) => [...prev, message]);
      if (!document.hasFocus()) new Audio(notificationSound).play();
    });
    return () => socket?.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser)
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    socket?.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId)
        setMessages((prev) =>
          prev.map((msg) => (!msg.seen ? { ...msg, seen: true } : msg)),
        );
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
      )
        return setLoadingMessages(false);
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return setLoadingMessages(false);
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) return showToast("Error", data.error, "error");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedConversation.userId,
          message: newMessage,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      setMessages((prev) => [...prev, data]);
      setConversations((prev) => {
        let exists = false;
        const updated = prev.map((conv) => {
          if (
            conv._id === selectedConversation._id ||
            conv.participants?.[0]?._id === selectedConversation.userId
          ) {
            exists = true;
            return {
              ...conv,
              mock: false,
              lastMessage: {
                text: newMessage || "Sent media",
                sender: data.sender,
                seen: false,
              },
            };
          }
          return conv;
        });
        if (!exists) {
          return [
            {
              _id: data.conversationId || Date.now(),
              participants: [
                {
                  _id: selectedConversation.userId,
                  username: selectedConversation.username,
                  profilePic:
                    selectedConversation.userProfilePic ||
                    selectedConversation.profilePic,
                },
              ],
              lastMessage: {
                text: newMessage || "Sent media",
                sender: data.sender,
                seen: false,
              },
            },
            ...updated,
          ];
        }
        return updated;
      });
      setNewMessage("");
      setImgUrl("");
      if (setFileType) setFileType(null);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex w="100%" h="100%" flexDirection="column" overflow="hidden">
      {/* HEADER: Absolute rigid bounds */}
      <Flex
        flexShrink={0}
        w="100%"
        h="65px"
        minH="65px"
        alignItems="center"
        px={4}
        gap={3}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Button
          size="sm"
          variant="ghost"
          borderRadius="full"
          p={2}
          onClick={() => setSelectedConversation(null)}
        >
          <FiArrowLeft size={20} />
        </Button>
        <Flex
          alignItems="center"
          gap={3}
          cursor="pointer"
          flex={1}
          onClick={() => navigate(`/${selectedConversation.username}`)}
        >
          <Avatar
            src={
              selectedConversation.userProfilePic ||
              selectedConversation.profilePic
            }
            size="sm"
          />
          <Text fontWeight="bold" fontSize="md" isTruncated>
            {selectedConversation.username}{" "}
            <Image src="/verified.png" w={4} h={4} ml={1} display="inline" />
          </Text>
        </Flex>
      </Flex>

      {/* MESSAGES FEED: Box forces isolated scrolling */}
      <Box
        flex={1}
        w="100%"
        minH={0}
        overflowY="auto"
        overflowX="hidden"
        px={5}
        py={4}
      >
        <Flex direction="column" gap={4}>
          {loadingMessages &&
            [0, 1, 2, 3].map((_, i) => (
              <Flex
                key={i}
                gap={3}
                alignItems="center"
                alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
              >
                <SkeletonCircle size={7} />
                <Skeleton h="40px" w="250px" borderRadius="xl" />
              </Flex>
            ))}
          {!loadingMessages &&
            messages.map((message, idx) => (
              <Flex
                key={message._id}
                direction="column"
                w="100%"
                overflow="hidden"
              >
                <Message
                  message={message}
                  ownMessage={currentUser._id === message.sender}
                  onDeleteMessage={(id) =>
                    setMessages((prev) => prev.filter((m) => m._id !== id))
                  }
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
          <div ref={messageEndRef} />
        </Flex>
      </Box>

      {/* UPLOAD PREVIEW */}
      {imgUrl && (
        <Flex
          px={5}
          py={2}
          bg={inputContainerBg}
          align="center"
          gap={3}
          flexShrink={0}
        >
          {fileType === "video" ? (
            <video
              src={imgUrl}
              width="60"
              height="60"
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
          ) : (
            <Image
              src={imgUrl}
              w="60px"
              h="60px"
              objectFit="cover"
              borderRadius="lg"
            />
          )}
          <CloseButton
            onClick={() => {
              setImgUrl("");
              if (setFileType) setFileType(null);
            }}
          />
        </Flex>
      )}

      {/* BOTTOM INPUT: Rigid flexShrink=0 */}
      <Flex
        flexShrink={0}
        w="100%"
        alignItems="center"
        px={4}
        py={3}
        bg={inputContainerBg}
        borderTop="1px solid"
        borderColor={borderColor}
        gap={3}
      >
        <form
          onSubmit={handleSendMessage}
          style={{
            width: "100%",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            borderRadius="full"
            bg={useColorModeValue("white", "whiteAlpha.150")}
            py={5}
            flex={1}
          />
          <input
            type="file"
            hidden
            ref={imageRef}
            accept="image/*,video/*"
            onChange={handleImageChange}
          />
          <Button
            size="md"
            borderRadius="full"
            variant="ghost"
            onClick={() => imageRef.current.click()}
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
        </form>
      </Flex>
    </Flex>
  );
};

export default MessageContainer;
