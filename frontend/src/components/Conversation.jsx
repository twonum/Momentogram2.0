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
import { useNavigate } from "react-router-dom";

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation?.participants?.[0];
  const currentUser = useRecoilValue(userAtom);
  const lastMessage = conversation?.lastMessage;
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom,
  );
  const navigate = useNavigate();

  if (!user) return null;

  const isSelected = selectedConversation?._id === conversation._id;
  const bgSelected = useColorModeValue("blue.100", "whiteAlpha.200");
  const bgHover = useColorModeValue("gray.200", "whiteAlpha.100");
  const textColor = useColorModeValue("black", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    navigate(`/${user.username}`);
  };

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
      onClick={() =>
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
          mock: conversation.mock,
        })
      }
    >
      <WrapItem onClick={handleAvatarClick}>
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
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${user.username}`);
          }}
          _hover={{ textDecoration: "underline" }}
        >
          {user.username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
        <Text
          fontSize={"xs"}
          display={"flex"}
          alignItems={"center"}
          gap={1}
          color={mutedTextColor}
          isTruncated
        >
          {currentUser?._id === lastMessage?.sender ? (
            <Box color={lastMessage?.seen ? "blue.400" : "gray.500"}>
              <BsCheck2All size={16} />
            </Box>
          ) : (
            ""
          )}
          {lastMessage?.text ? (
            lastMessage.text.length > 25 ? (
              lastMessage.text.substring(0, 25) + "..."
            ) : (
              lastMessage.text
            )
          ) : (
            <BsFillImageFill size={16} />
          )}
        </Text>
      </Stack>
    </Flex>
  );
};

export default Conversation;
