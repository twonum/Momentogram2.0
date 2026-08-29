import {
  Avatar,
  Box,
  Flex,
  Image,
  Skeleton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import { FiDownload, FiTrash2, FiPlayCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";

const Message = ({ ownMessage, message, onDeleteMessage }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const currentUser = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const showToast = useShowToast();

  const ownBg = useColorModeValue("green.500", "green.800");
  const otherBg = useColorModeValue("gray.100", "gray.800");
  const ownTextColor = useColorModeValue("white", "white");
  const otherTextColor = useColorModeValue("black", "white");

  const isVideo =
    message.img &&
    typeof message.img === "string" &&
    (message.img.includes("/video/upload/") ||
      !!message.img.match(/\.(mp4|webm|ogg|mov)/i));
  const hasMedia = message.img && message.img.trim() !== "";

  const canDelete =
    ownMessage && (!hasMedia || currentUser?.role === "superadmin");

  const handleDeletePrompt = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this message?",
      )
    )
      return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/messages/delete/${message._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");
      showToast("Success", "Message deleted permanently", "success");
      if (onDeleteMessage) onDeleteMessage(message._id);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadMedia = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `momentogram-media.${isVideo ? "mp4" : "jpg"}`;
      link.click();
    } catch (err) {
      showToast("Error", "Failed to download media", "error");
    }
  };

  return (
    <>
      <Flex
        gap={2}
        w="100%"
        alignSelf={ownMessage ? "flex-end" : "flex-start"}
        justifyContent={ownMessage ? "flex-end" : "flex-start"}
        alignItems={ownMessage ? "center" : "flex-end"}
      >
        {!ownMessage && (
          <Avatar
            src={
              selectedConversation.userProfilePic ||
              selectedConversation.profilePic
            }
            w="7"
            h="7"
            cursor="pointer"
            onClick={() => navigate(`/${selectedConversation.username}`)}
            flexShrink={0}
          />
        )}

        {canDelete && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<BsThreeDotsVertical size={14} />}
              variant="ghost"
              size="xs"
              color="gray.400"
              _hover={{ bg: "transparent" }}
            />
            <MenuList minW="130px" p={1} boxShadow="lg">
              <MenuItem
                icon={<FiTrash2 color="red" />}
                color="red.500"
                fontSize="sm"
                borderRadius="md"
                onClick={handleDeletePrompt}
                isDisabled={isDeleting}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}

        {/* Constrain bubble width on ultra-wide screens for readability */}
        <Flex
          direction="column"
          align={ownMessage ? "flex-end" : "flex-start"}
          maxW={{ base: "85%", md: "70%", lg: "65%" }}
        >
          {message.text && (
            <Box
              bg={ownMessage ? ownBg : otherBg}
              p={3}
              borderRadius={
                ownMessage ? "20px 20px 2px 20px" : "20px 20px 20px 2px"
              }
              boxShadow="sm"
              wordBreak="break-word"
              maxW="100%"
            >
              <Text
                color={ownMessage ? ownTextColor : otherTextColor}
                fontSize="sm"
                whiteSpace="pre-wrap"
              >
                {message.text}
              </Text>
            </Box>
          )}

          {message.img && !imgLoaded && !isVideo && (
            <Flex mt={2} w="200px">
              <Skeleton w="200px" h="200px" borderRadius={12} />
            </Flex>
          )}

          {message.img && isVideo ? (
            <Box
              position="relative"
              mt={2}
              cursor="pointer"
              onClick={onOpen}
              borderRadius={12}
              overflow="hidden"
              maxW="300px"
              maxH="300px"
            >
              <video
                src={message.img}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Flex
                position="absolute"
                top={0}
                left={0}
                w="full"
                h="full"
                bg="blackAlpha.400"
                justify="center"
                align="center"
                transition="0.2s"
                _hover={{ bg: "blackAlpha.600" }}
              >
                <FiPlayCircle color="white" size={40} />
              </Flex>
            </Box>
          ) : message.img ? (
            <Image
              src={message.img}
              alt="Attachment"
              borderRadius={12}
              mt={2}
              maxW="100%"
              maxH="350px"
              cursor="pointer"
              onClick={onOpen}
              objectFit="cover"
              onLoad={() => setImgLoaded(true)}
              display={imgLoaded ? "block" : "none"}
            />
          ) : null}

          {ownMessage && (
            <Flex align="center" gap={1} mt={1} mr={1}>
              <Box
                color={message.seen ? "blue.400" : "gray.400"}
                fontWeight="bold"
              >
                <BsCheck2All size={14} />
              </Box>
            </Flex>
          )}
        </Flex>

        {ownMessage && (
          <Avatar
            src={currentUser.profilePic}
            w="7"
            h="7"
            cursor="pointer"
            onClick={() => navigate(`/${currentUser.username}`)}
            flexShrink={0}
          />
        )}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(5px)" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          m={0}
          p={0}
          w="100vw"
          h="100vh"
          maxW="100vw"
          maxH="100vh"
          borderRadius={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <ModalCloseButton
            color="white"
            size="lg"
            position="absolute"
            top={4}
            right={4}
            zIndex={20}
            bg="blackAlpha.600"
            borderRadius="full"
          />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            p={4}
            w="100%"
            h="100%"
            overflow="hidden"
          >
            {isVideo ? (
              <video
                src={message.img}
                controls
                autoPlay
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "8px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              />
            ) : (
              <Image
                src={message.img}
                maxW="95%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="md"
              />
            )}

            <Button
              mt={6}
              colorScheme="blue"
              leftIcon={<FiDownload />}
              onClick={() => downloadMedia(message.img)}
              borderRadius="full"
              size="md"
            >
              Download {isVideo ? "Video" : "Image"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Message;
