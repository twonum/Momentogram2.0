import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import { FiRepeat } from "react-icons/fi";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) return showToast("Error", data.error, "error");
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      showToast("Success", "Post deleted", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user) return null;

  // Reposter or Original author can delete
  const canDelete =
    currentUser?._id === user._id || currentUser?._id === post.repostedBy?._id;

  return (
    <Box mb={4} py={2}>
      {/* BEAUTIFUL REPOST INDICATOR */}
      {post.repostedBy && (
        <Flex
          gap={2}
          alignItems="center"
          mb={3}
          color="gray.500"
          fontSize="sm"
          ml={2}
        >
          <FiRepeat size={14} />
          <Avatar
            size="2xs"
            src={post.repostedBy.profilePic}
            name={post.repostedBy.username}
          />
          <Text
            fontWeight="bold"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${post.repostedBy.username}`);
            }}
          >
            {post.repostedBy.username} reposted
          </Text>
        </Flex>
      )}

      <Link to={`/${user.username}/post/${post._id}`}>
        <Flex gap={3}>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Avatar
              size="md"
              name={user.username}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
            />
            <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
            <Box position={"relative"} w={"full"}>
              {post.replies.length === 0 && (
                <Text textAlign={"center"}>🥱</Text>
              )}
              {post.replies[0] && (
                <Avatar
                  size="xs"
                  name={post.replies[0].username}
                  src={post.replies[0].userProfilePic}
                  position={"absolute"}
                  top={"0px"}
                  left="15px"
                  padding={"2px"}
                />
              )}
              {post.replies[1] && (
                <Avatar
                  size="xs"
                  name={post.replies[1].username}
                  src={post.replies[1].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  right="-5px"
                  padding={"2px"}
                />
              )}
              {post.replies[2] && (
                <Avatar
                  size="xs"
                  name={post.replies[2].username}
                  src={post.replies[2].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  left="4px"
                  padding={"2px"}
                />
              )}
            </Box>
          </Flex>

          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex w={"full"} alignItems={"center"}>
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}
                >
                  {user?.username}
                </Text>
                <Image src="/verified.png" w={4} h={4} ml={1} />
              </Flex>
              <Flex gap={4} alignItems={"center"}>
                <Text
                  fontSize={"xs"}
                  width={36}
                  textAlign={"right"}
                  color={"gray.light"}
                >
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Text>
                {canDelete && (
                  <DeleteIcon
                    size={16}
                    onClick={handleDeletePost}
                    _hover={{ color: "red.500" }}
                  />
                )}
              </Flex>
            </Flex>

            <Text fontSize={"sm"}>{post.text}</Text>

            {post.img && (
              <Box
                borderRadius={6}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"gray.light"}
              >
                {post.img.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={post.img}
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Image src={post.img} w={"full"} />
                )}
              </Box>
            )}

            <Flex gap={3} my={1}>
              <Actions post={post} />
            </Flex>
          </Flex>
        </Flex>
      </Link>
    </Box>
  );
};

export default Post;
