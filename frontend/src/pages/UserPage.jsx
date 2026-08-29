import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("threads");

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();

        if (data.error || data.message) {
          showToast("Error", data.error || data.message, "error");
          setPosts([]);
          return;
        }

        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, showToast, setPosts, user]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user && !loading) return <h1>User not found</h1>;

  return (
    <>
      <UserHeader user={user} />

      <Flex w={"full"} mt={4} mb={6}>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "threads" ? "1.5px solid" : "1px solid gray"
          }
          borderColor={activeTab === "threads" ? "white" : "gray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setActiveTab("threads")}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "threads" ? "inherit" : "gray.light"}
          >
            Threads
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "replies" ? "1.5px solid" : "1px solid gray"
          }
          borderColor={activeTab === "replies" ? "white" : "gray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setActiveTab("replies")}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "replies" ? "inherit" : "gray.light"}
          >
            Replies
          </Text>
        </Flex>
      </Flex>

      {!fetchingPosts && Array.isArray(posts) && posts.length === 0 && (
        <h1>User has no posts.</h1>
      )}

      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"xl"} />
        </Flex>
      )}

      {Array.isArray(posts) &&
        posts.map((post) => {
          if (activeTab === "threads" && post.postedBy === user._id) {
            return <Post key={post._id} post={post} postedBy={post.postedBy} />;
          }
          if (activeTab === "replies" && post.postedBy !== user._id) {
            return <Post key={post._id} post={post} postedBy={post.postedBy} />;
          }
          return null;
        })}
    </>
  );
};

export default UserPage;
