import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const SuggestedUser = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user.followers.includes(currentUser?._id),
  );
  const [updating, setUpdating] = useState(false);
  const showToast = useShowToast();

  const handleFollowUnfollow = async (e) => {
    e.preventDefault();
    if (!currentUser)
      return showToast("Error", "Please login to follow", "error");
    if (updating) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (following) {
        showToast("Success", `Unfollowed ${user.username}`, "success");
        user.followers.pop();
      } else {
        showToast("Success", `Followed ${user.username}`, "success");
        user.followers.push(currentUser?._id);
      }
      setFollowing(!following);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setUpdating(false);
    }
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
    <Flex
      gap={2}
      justifyContent={"space-between"}
      alignItems={"center"}
      w={"full"}
      mb={4}
    >
      <Flex gap={2} as={Link} to={`/${user.username}`} cursor={"pointer"}>
        <Avatar src={user.profilePic} name={user.username} size={"md"} />
        <Box>
          <Text fontSize={"sm"} fontWeight={"bold"}>
            {user.username}
          </Text>
          <Text color={"gray.500"} fontSize={"xs"}>
            {user.name}
          </Text>
        </Box>
      </Flex>
      <Button
        size={"sm"}
        colorScheme={buttonColor}
        variant={buttonVariant}
        onClick={handleFollowUnfollow}
        isLoading={updating}
        borderRadius="full"
        px={4}
      >
        {buttonText}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
