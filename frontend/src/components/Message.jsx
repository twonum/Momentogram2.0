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
} from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Light Mode & Dark Mode Contrast Fixes
  const ownBg = useColorModeValue("green.500", "green.800");
  const otherBg = useColorModeValue("gray.100", "gray.800");
  const ownTextColor = useColorModeValue("white", "white");
  const otherTextColor = useColorModeValue("black", "white");

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "momentogram-image.jpg";
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileClick = (username) => {
    if (username) navigate(`/${username}`);
  };

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"} maxW="80%" alignItems="flex-end">
          <Flex direction="column" align="flex-end" maxW="full">
            {message.text && (
              <Box
                bg={ownBg}
                p={3}
                borderRadius={"20px 20px 2px 20px"}
                boxShadow="sm"
                wordBreak="break-word"
                maxW="full"
              >
                <Text
                  color={ownTextColor}
                  fontSize={"sm"}
                  whiteSpace="pre-wrap"
                >
                  {message.text}
                </Text>
              </Box>
            )}
            {message.img && !imgLoaded && (
              <Flex mt={2} w={"200px"}>
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt="Message image"
                  borderRadius={12}
                />
                <Skeleton w={"200px"} h={"200px"} borderRadius={12} />
              </Flex>
            )}
            {message.img && imgLoaded && (
              <Flex mt={2} maxW={"240px"} flexDir="column">
                <Image
                  src={message.img}
                  alt="Message image"
                  borderRadius={12}
                  cursor="pointer"
                  onClick={onOpen}
                  objectFit="cover"
                />
              </Flex>
            )}
            <Flex align="center" gap={1} mt={1} mr={1}>
              <Box
                color={message.seen ? "blue.400" : "gray.400"}
                fontWeight={"bold"}
              >
                <BsCheck2All size={14} />
              </Box>
            </Flex>
          </Flex>
          <Avatar
            src={user.profilePic}
            w="7"
            h={7}
            cursor="pointer"
            onClick={() => handleProfileClick(user.username)}
          />
        </Flex>
      ) : (
        <Flex gap={2} alignSelf={"flex-start"} maxW="80%" alignItems="flex-end">
          <Avatar
            src={
              selectedConversation.userProfilePic ||
              selectedConversation.profilePic
            }
            w="7"
            h={7}
            cursor="pointer"
            onClick={() => handleProfileClick(selectedConversation.username)}
          />
          <Flex direction="column" maxW="full">
            {message.text && (
              <Box
                bg={otherBg}
                p={3}
                borderRadius={"20px 20px 20px 2px"}
                boxShadow="sm"
                wordBreak="break-word"
                maxW="full"
              >
                <Text
                  color={otherTextColor}
                  fontSize={"sm"}
                  whiteSpace="pre-wrap"
                >
                  {message.text}
                </Text>
              </Box>
            )}
            {message.img && !imgLoaded && (
              <Flex mt={2} w={"200px"}>
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt="Message image"
                  borderRadius={12}
                />
                <Skeleton w={"200px"} h={"200px"} borderRadius={12} />
              </Flex>
            )}
            {message.img && imgLoaded && (
              <Flex mt={2} maxW={"240px"}>
                <Image
                  src={message.img}
                  alt="Message image"
                  borderRadius={12}
                  cursor="pointer"
                  onClick={onOpen}
                  objectFit="cover"
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}

      {/* Image Lightbox */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            pt={10}
          >
            <Image
              src={message.img}
              maxH="75vh"
              objectFit="contain"
              borderRadius="md"
            />
            <Button
              mt={4}
              colorScheme="blue"
              leftIcon={<FiDownload />}
              onClick={() => downloadImage(message.img)}
              borderRadius="full"
            >
              Download Image
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Message;
