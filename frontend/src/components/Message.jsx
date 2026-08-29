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

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Light Mode & Dark Mode Contrast Fixes
  const ownBg = useColorModeValue("green.400", "green.800");
  const otherBg = useColorModeValue("gray.200", "gray.600");
  const ownTextColor = useColorModeValue("white", "white");
  const otherTextColor = useColorModeValue("black", "white");

  const downloadImage = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "momentogram-image.jpg";
    link.click();
  };

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex bg={ownBg} maxW={"350px"} p={2} borderRadius={"md"}>
              <Text color={ownTextColor}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"} flexDir="column">
              <Image
                src={message.img}
                alt="Message image"
                borderRadius={4}
                cursor="pointer"
                onClick={onOpen}
              />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          <Avatar src={user.profilePic} w="7" h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar
            src={selectedConversation.userProfilePic}
            w="7"
            h={7}
            cursor="pointer"
            onClick={() =>
              window.open(`/${selectedConversation.username}`, "_blank")
            }
          />

          {message.text && (
            <Text
              maxW={"350px"}
              bg={otherBg}
              p={2}
              borderRadius={"md"}
              color={otherTextColor}
            >
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                alt="Message image"
                borderRadius={4}
                cursor="pointer"
                onClick={onOpen}
              />
            </Flex>
          )}
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
