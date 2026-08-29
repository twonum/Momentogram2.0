import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast, useColorModeValue } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom);
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  const [following, setFollowing] = useState(
    user.followers.includes(currentUser?._id),
  );
  const [updating, setUpdating] = useState(false);
  const showToast = useShowToast();
  const navigate = useNavigate();

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Success.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      showToast("Error", "Please login to follow", "error");
      return;
    }
    if (updating) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (following) {
        showToast("Success", `Unfollowed ${user.name}`, "success");
        user.followers.pop();
      } else {
        showToast("Success", `Followed ${user.name}`, "success");
        user.followers.push(currentUser?._id);
      }
      setFollowing(!following);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDirectMessage = () => {
    if (!currentUser) {
      showToast("Error", "Please login to send a message", "error");
      return;
    }
    setSelectedConversation({
      _id: Date.now(), // Fallback ID until a real conversation is created
      userId: user._id,
      username: user.username,
      userProfilePic: user.profilePic,
      mock: true,
    });
    navigate("/chat");
  };

  // Smart Button Logic
  const isFollowingMe =
    user.following?.includes(currentUser?._id) ||
    currentUser?.followers?.includes(user._id);

  let buttonText = "Follow";
  let buttonVariant = "solid";
  let buttonColor = "blue";

  if (following) {
    buttonText = "Following";
    buttonVariant = "outline";
    buttonColor = "gray";
  } else if (isFollowingMe) {
    buttonText = "Follow Back";
    buttonVariant = "solid";
    buttonColor = "blue";
  }

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"} mt={1}>
            <Text fontSize={"sm"} color={"gray.500"} fontWeight={"medium"}>
              @{user.username}
            </Text>
            <Text
              fontSize={"2xs"}
              bg={useColorModeValue("blackAlpha.100", "whiteAlpha.200")}
              color={useColorModeValue("gray.600", "gray.300")}
              px={2.5}
              py={0.5}
              borderRadius={"full"}
              letterSpacing={"wide"}
            >
              momentogram.net
            </Text>

            {/* Admin Badges */}
            {user.role === "superadmin" && (
              <Text
                fontSize={"2xs"}
                bg={"red.500"}
                color={"white"}
                px={2}
                py={0.5}
                borderRadius={"full"}
                fontWeight="bold"
              >
                SUPER ADMIN
              </Text>
            )}
            {user.role === "admin" && (
              <Text
                fontSize={"2xs"}
                bg={"green.500"}
                color={"white"}
                px={2}
                py={0.5}
                borderRadius={"full"}
                fontWeight="bold"
              >
                ADMIN
              </Text>
            )}
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"} borderRadius="full" px={6}>
            Update Profile
          </Button>
        </Link>
      )}

      {currentUser?._id !== user._id && (
        <Flex gap={3}>
          <Button
            size={"sm"}
            borderRadius="full"
            px={6}
            onClick={handleFollowUnfollow}
            isLoading={updating}
            colorScheme={buttonColor}
            variant={buttonVariant}
          >
            {buttonText}
          </Button>
          <Button
            size={"sm"}
            borderRadius="full"
            px={6}
            onClick={handleDirectMessage}
            colorScheme="blue"
            variant="outline"
          >
            Message
          </Button>
        </Flex>
      )}

      <Flex w={"full"} justifyContent={"space-between"} mt={2}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"} fontSize="sm">
            {user.followers.length} followers
          </Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Text color={"gray.light"} fontSize="sm">
            {user.following.length} following
          </Text>
        </Flex>
        <Flex gap={4}>
          <Box
            className="icon-container"
            _hover={{ color: "blue.400" }}
            transition="0.2s"
          >
            <BsInstagram size={22} cursor={"pointer"} />
          </Box>
          <Box
            className="icon-container"
            _hover={{ color: "blue.400" }}
            transition="0.2s"
          >
            <Menu>
              <MenuButton>
                <CgMoreO size={22} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList
                  bg={useColorModeValue("white", "gray.dark")}
                  boxShadow="xl"
                  borderRadius="xl"
                >
                  <MenuItem
                    bg={useColorModeValue("white", "gray.dark")}
                    onClick={copyURL}
                    _hover={{
                      bg: useColorModeValue("gray.100", "whiteAlpha.200"),
                    }}
                  >
                    Copy profile link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
