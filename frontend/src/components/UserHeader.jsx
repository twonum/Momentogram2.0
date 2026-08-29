import {
  Avatar,
  Box,
  Flex,
  Text,
  Badge,
  Link,
  VStack,
  Button,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  useColorModeValue,
} from "@chakra-ui/react";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  const menuBg = useColorModeValue("white", "gray.dark");
  const textColor = useColorModeValue("black", "white");

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Success",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    });
  };
  const handleDirectMessage = () => {
    if (!currentUser) {
      toast({
        title: "Error",
        status: "error",
        description: "Please login to chat.",
        duration: 3000,
      });
      return;
    }
    setSelectedConversation({
      _id: Date.now(),
      userId: user._id, // Explicitly mapped to user._id
      username: user.username,
      userProfilePic: user.profilePic,
      mock: true,
    });
    navigate("/chat");
  };
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            >
              threads.net
            </Text>
            {user.role === "superadmin" && (
              <Badge colorScheme="red" p={1} borderRadius="md">
                Super Admin
              </Badge>
            )}
            {user.role === "admin" && (
              <Badge colorScheme="green" p={1} borderRadius="md">
                Admin
              </Badge>
            )}
            {user.role === "user" && (
              <Badge colorScheme="gray" p={1} borderRadius="md">
                Standard User
              </Badge>
            )}
          </Flex>
        </Box>
        <Box>
          <Avatar
            name={user.name}
            src={user.profilePic || "https://bit.ly/broken-link"}
            size={{ base: "md", md: "xl" }}
          />
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      <Flex gap={3} w="full">
        {currentUser?._id === user._id ? (
          <Link as={RouterLink} to="/update" style={{ textDecoration: "none" }}>
            <Button size="md" borderRadius="full" px={6} colorScheme="gray">
              Update Profile
            </Button>
          </Link>
        ) : (
          <>
            <Button
              size="md"
              borderRadius="full"
              px={8}
              colorScheme={following ? "gray" : "blue"}
              onClick={handleFollowUnfollow}
              isLoading={updating}
            >
              {following ? "Unfollow" : "Follow"}
            </Button>
            <Button
              size="md"
              borderRadius="full"
              px={8}
              colorScheme="blue"
              variant="outline"
              onClick={handleDirectMessage}
            >
              Message
            </Button>
          </>
        )}
      </Flex>

      <Flex w={"full"} justifyContent={"space-between"} alignItems="center">
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.500"}>{user.followers.length} followers</Text>
          <Box w="1" h="1" bg={"gray.500"} borderRadius={"full"}></Box>
          <Link color={"gray.500"}>momentogram.com</Link>
        </Flex>
        <Box className="icon-container">
          <Menu>
            <MenuButton>
              <CgMoreO size={24} cursor={"pointer"} />
            </MenuButton>
            <Portal>
              <MenuList bg={menuBg} color={textColor}>
                <MenuItem bg={menuBg} onClick={copyURL}>
                  Copy link
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
