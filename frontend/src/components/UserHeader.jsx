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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";
import { CgMoreO } from "react-icons/cg";
import { BsInstagram, BsLinkedin, BsGlobe } from "react-icons/bs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  selectedConversationAtom,
  conversationsAtom,
} from "../atoms/messagesAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { useState } from "react";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);
  const conversations = useRecoilValue(conversationsAtom);
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  // Modal states for Followers & Following lists
  const {
    isOpen: isFollowersOpen,
    onOpen: onFollowersOpen,
    onClose: onFollowersClose,
  } = useDisclosure();
  const {
    isOpen: isFollowingOpen,
    onOpen: onFollowingOpen,
    onClose: onFollowingClose,
  } = useDisclosure();
  const [modalUsers, setModalUsers] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const menuBg = useColorModeValue("white", "gray.dark");
  const textColor = useColorModeValue("black", "white");
  const badgeBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const badgeColor = useColorModeValue("gray.700", "gray.300");

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
    const targetId = user?._id || user?.id;
    if (!targetId) return;

    const existingConv = conversations.find(
      (c) => c.participants?.[0]?._id === targetId,
    );

    if (existingConv) {
      setSelectedConversation({
        _id: existingConv._id,
        userId: targetId,
        username: user.username,
        userProfilePic: user.profilePic,
        mock: false,
      });
    } else {
      setSelectedConversation({
        _id: Date.now(),
        userId: targetId,
        username: user.username,
        userProfilePic: user.profilePic,
        mock: true,
      });
    }
    navigate("/chat");
  };

  const fetchUserList = async (ids) => {
    if (!ids || ids.length === 0) {
      setModalUsers([]);
      return;
    }
    setLoadingModal(true);
    try {
      const res = await fetch("/api/users/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setModalUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        status: "error",
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoadingModal(false);
    }
  };

  // Follow Back Logic Detection
  const isMe = currentUser?._id === user._id;
  const iFollowThem = currentUser?.following?.includes(user._id);
  const theyFollowMe = user?.followers?.includes(currentUser?._id);

  let followButtonText = "Follow";
  if (iFollowThem) {
    followButtonText = "Following";
  } else if (theyFollowMe && !iFollowThem) {
    followButtonText = "Follow Back";
  }

  return (
    <VStack
      gap={5}
      alignItems={"start"}
      w="full"
      p={6}
      bg={useColorModeValue("white", "gray.dark")}
      borderRadius="2xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
    >
      <Flex justifyContent={"space-between"} w={"full"} alignItems="center">
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"} letterSpacing="tight">
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"} mt={1} wrap="wrap">
            <Text fontSize={"sm"} color="gray.500">
              @{user.username}
            </Text>
            <Flex
              alignItems="center"
              gap={1.5}
              px={2.5}
              py={0.5}
              bg={badgeBg}
              color={badgeColor}
              borderRadius="full"
              fontSize="xs"
              fontWeight="500"
            >
              <Box w={1.5} h={1.5} borderRadius="full" bg="blue.400" />
              threads.net
            </Flex>

            {user.role === "superadmin" && (
              <Badge colorScheme="red" px={2} py={0.5} borderRadius="md">
                Super Admin
              </Badge>
            )}
            {user.role === "admin" && (
              <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
                Admin
              </Badge>
            )}
            {user.role === "user" && (
              <Badge colorScheme="gray" px={2} py={0.5} borderRadius="md">
                Standard User
              </Badge>
            )}
          </Flex>
        </Box>
        <Avatar
          name={user.name}
          src={user.profilePic || "https://bit.ly/broken-link"}
          size={{ base: "lg", md: "xl" }}
          boxShadow="md"
        />
      </Flex>

      {user.bio && (
        <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.200")}>
          {user.bio}
        </Text>
      )}

      {/* Social Links Row */}
      <Flex gap={3} alignItems="center" wrap="wrap">
        {user.instagramLink && (
          <Link
            href={user.instagramLink}
            isExternal
            display="flex"
            alignItems="center"
            gap={1}
            fontSize="xs"
            color="pink.500"
            fontWeight="600"
          >
            <BsInstagram size={14} /> Instagram
          </Link>
        )}
        {user.linkedinLink && (
          <Link
            href={user.linkedinLink}
            isExternal
            display="flex"
            alignItems="center"
            gap={1}
            fontSize="xs"
            color="blue.500"
            fontWeight="600"
          >
            <BsLinkedin size={14} /> LinkedIn
          </Link>
        )}
        {user.websiteUrl && (
          <Link
            href={user.websiteUrl}
            isExternal
            display="flex"
            alignItems="center"
            gap={1}
            fontSize="xs"
            color="teal.500"
            fontWeight="600"
          >
            <BsGlobe size={14} /> Website
          </Link>
        )}
      </Flex>

      {!isMe && (
        <Flex gap={3} w="full">
          <Button
            flex={1}
            size="md"
            borderRadius="full"
            fontWeight="600"
            colorScheme={iFollowThem ? "gray" : "blue"}
            variant={iFollowThem ? "outline" : "solid"}
            onClick={handleFollowUnfollow}
            isLoading={updating}
          >
            {followButtonText}
          </Button>
          <Button
            flex={1}
            size="md"
            borderRadius="full"
            fontWeight="600"
            colorScheme="blue"
            variant="outline"
            onClick={handleDirectMessage}
          >
            Message
          </Button>
        </Flex>
      )}

      {isMe && (
        <Link
          as={RouterLink}
          to="/update"
          style={{ width: "100%", textDecoration: "none" }}
        >
          <Button
            w="full"
            size="md"
            borderRadius="full"
            fontWeight="600"
            variant="outline"
          >
            Edit Profile
          </Button>
        </Link>
      )}

      <Flex
        w={"full"}
        justifyContent={"space-between"}
        alignItems="center"
        pt={1}
      >
        <Flex gap={4} alignItems={"center"} fontSize="sm">
          <Text
            color={"gray.500"}
            fontWeight="500"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={() => {
              fetchUserList(user.followers);
              onFollowersOpen();
            }}
          >
            <b>{user.followers?.length || 0}</b> followers
          </Text>
          <Box w="1" h="1" bg={"gray.400"} borderRadius={"full"}></Box>
          <Text
            color={"gray.500"}
            fontWeight="500"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={() => {
              fetchUserList(user.following);
              onFollowingOpen();
            }}
          >
            <b>{user.following?.length || 0}</b> following
          </Text>
        </Flex>
        <Box className="icon-container">
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              borderRadius="full"
              p={0}
            >
              <CgMoreO size={22} />
            </MenuButton>
            <Portal>
              <MenuList
                bg={menuBg}
                color={textColor}
                boxShadow="lg"
                borderRadius="xl"
              >
                <MenuItem bg={menuBg} onClick={copyURL} fontWeight="500">
                  Copy profile link
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </Flex>

      {/* Followers Modal */}
      <Modal
        isOpen={isFollowersOpen}
        onClose={onFollowersClose}
        size="sm"
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontWeight="bold">Followers</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingModal ? (
              <Flex justify="center" py={6}>
                <Spinner />
              </Flex>
            ) : modalUsers.length === 0 ? (
              <Text textAlign="center" color="gray.500" py={4}>
                No followers yet.
              </Text>
            ) : (
              <VStack gap={3} align="stretch">
                {modalUsers.map((u) => (
                  <Flex
                    key={u._id}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    onClick={() => {
                      onFollowersClose();
                      navigate(`/${u.username}`);
                    }}
                  >
                    <Flex gap={3} align="center">
                      <Avatar src={u.profilePic} size="sm" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          {u.username}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {u.name}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={isFollowingOpen}
        onClose={onFollowingClose}
        size="sm"
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontWeight="bold">Following</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingModal ? (
              <Flex justify="center" py={6}>
                <Spinner />
              </Flex>
            ) : modalUsers.length === 0 ? (
              <Text textAlign="center" color="gray.500" py={4}>
                Not following anyone yet.
              </Text>
            ) : (
              <VStack gap={3} align="stretch">
                {modalUsers.map((u) => (
                  <Flex
                    key={u._id}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    onClick={() => {
                      onFollowingClose();
                      navigate(`/${u.username}`);
                    }}
                  >
                    <Flex gap={3} align="center">
                      <Avatar src={u.profilePic} size="sm" />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          {u.username}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {u.name}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default UserHeader;
