import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Image,
  Stack,
  Text,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline, isCompact }) => {
  const user = conversation?.participants?.[0];
  const currentUser = useRecoilValue(userAtom);
  const lastMessage = conversation?.lastMessage;
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom,
  );

  if (!user) return null;

  const isSelected = selectedConversation?._id === conversation._id;
  const bgSelected = useColorModeValue("blue.100", "whiteAlpha.200");
  const bgHover = useColorModeValue("gray.200", "whiteAlpha.100");
  const textColor = useColorModeValue("black", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  const handleSelectChat = () => {
    setSelectedConversation({
      _id: conversation._id,
      userId: user._id,
      userProfilePic: user.profilePic,
      username: user.username,
      mock: conversation.mock,
    });
  };

  if (isCompact) {
    return (
      <Flex
        justify="center"
        align="center"
        p={2}
        borderRadius="xl"
        cursor="pointer"
        bg={isSelected ? bgSelected : "transparent"}
        _hover={{ bg: isSelected ? bgSelected : bgHover }}
        transition="all 0.2s ease"
        onClick={handleSelectChat}
        title={user.username}
      >
        <WrapItem>
          <Avatar size={"md"} src={user.profilePic}>
            {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
          </Avatar>
        </WrapItem>
      </Flex>
    );
  }

  return (
    <Flex
      gap={4}
      alignItems={"center"}
      p={"3"}
      borderRadius={"md"}
      cursor={"pointer"}
      color={textColor}
      bg={isSelected ? bgSelected : "transparent"}
      _hover={{ bg: isSelected ? bgSelected : bgHover }}
      transition="all 0.2s ease"
      onClick={handleSelectChat}
    >
      <WrapItem>
        <Avatar size={{ base: "sm", md: "md" }} src={user.profilePic}>
          {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
        </Avatar>
      </WrapItem>

      <Stack
        direction={"column"}
        fontSize={"sm"}
        spacing={1}
        overflow="hidden"
        w="full"
      >
        <Text
          fontWeight="700"
          display={"flex"}
          alignItems={"center"}
          isTruncated
        >
          {user.username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
        {/* Using Box instead of Text to prevent <div> inside <p> DOM nesting warning */}
        <Box
          fontSize={"xs"}
          display={"flex"}
          alignItems={"center"}
          gap={1}
          color={mutedTextColor}
          isTruncated
          as="div"
        >
          {currentUser?._id === lastMessage?.sender ? (
            <Box as="span" color={lastMessage?.seen ? "blue.400" : "gray.500"}>
              <BsCheck2All size={16} />
            </Box>
          ) : null}
          {lastMessage?.text ? (
            lastMessage.text.length > 25 ? (
              lastMessage.text.substring(0, 25) + "..."
            ) : (
              lastMessage.text
            )
          ) : (
            <BsFillImageFill size={16} />
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default Conversation;
