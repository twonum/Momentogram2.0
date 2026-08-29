import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";

const Actions = ({ post }) => {
  const user = useRecoilValue(userAtom);
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id));
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");

  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLikeAndUnlike = async (e) => {
    e.preventDefault();
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error",
      );
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      if (!liked) {
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id)
            return { ...p, likes: [...p.likes, user._id] };
          return p;
        });
        setPosts(updatedPosts);
      } else {
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id)
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          return p;
        });
        setPosts(updatedPosts);
      }
      setLiked(!liked);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user)
      return showToast("Error", "You must be logged in to reply", "error");
    if (isReplying) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/posts/reply/" + post._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) return { ...p, replies: [...p.replies, data] };
        return p;
      });
      setPosts(updatedPosts);
      showToast("Success", "Reply posted successfully", "success");
      onClose();
      setReply("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  const handleRepost = async (e) => {
    e.preventDefault();
    if (!user)
      return showToast("Error", "You must be logged in to repost", "error");
    if (isReposting) return;
    setIsReposting(true);
    try {
      const res = await fetch("/api/posts/repost/" + post._id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      showToast("Success", "Post reposted successfully!", "success");
      setPosts([data, ...posts]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReposting(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post on Momentogram",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("Success", "Post link copied to clipboard!", "success");
    }
  };

  return (
    <Flex flexDirection="column">
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        {/* Like */}
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikeAndUnlike}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>

        {/* Reply */}
        <svg
          aria-label="Reply"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={onOpen}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>

        {/* Repost */}
        <svg
          aria-label="Repost"
          color="currentColor"
          fill="currentColor"
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={handleRepost}
          style={{ cursor: "pointer", opacity: isReposting ? 0.5 : 1 }}
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m15.23 6.75 3.27 3.27m-3.27-3.27L11.96 10m3.27-3.25V18m0 0-3.27-3.25m3.27 3.25L18.5 14.75M8.77 17.25l-3.27-3.27m3.27 3.27L12.04 14m-3.27 3.25V6m0 0 3.27 3.25M8.77 6 5.5 9.25"
          ></path>
        </svg>

        {/* Share */}
        <svg
          aria-label="Share"
          color=""
          fill="none"
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={handleShare}
          style={{ cursor: "pointer" }}
        >
          <line
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="22"
            x2="9.218"
            y1="3"
            y2="10.083"
          ></line>
          <polygon
            fill="none"
            points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></polygon>
        </svg>
      </Flex>

      <Flex gap={2} alignItems={"center"} color={"gray.light"} fontSize="sm">
        <Text>{post.replies?.length} replies</Text>
        <Box w={1} h={1} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text>{post.likes?.length} likes</Text>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Reply to {post?.postedBy?.username || "Post"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply goes here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              size={"sm"}
              mr={3}
              isLoading={isReplying}
              onClick={handleReply}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;
