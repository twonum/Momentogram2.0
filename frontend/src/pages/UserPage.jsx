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
        <Flex
          flex={1}
          borderBottom={
            activeTab === "reposts" ? "1.5px solid" : "1px solid gray"
          }
          borderColor={activeTab === "reposts" ? "white" : "gray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setActiveTab("reposts")}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "reposts" ? "inherit" : "gray.light"}
          >
            Reposts
          </Text>
        </Flex>
      </Flex>

      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"xl"} />
        </Flex>
      )}

      {!fetchingPosts && Array.isArray(posts) && (
        <>
          {posts.map((post) => {
            const isOwnPost =
              post.postedBy === user._id || post.postedBy?._id === user._id;
            const isRepost = isOwnPost && post.repostedFrom;
            const isThread = isOwnPost && !post.repostedFrom;
            const isReply = post.replies.some(
              (reply) => reply.userId === user._id,
            );

            if (activeTab === "threads" && isThread) {
              return (
                <Post key={post._id} post={post} postedBy={post.postedBy} />
              );
            }
            if (activeTab === "replies" && isReply) {
              return (
                <Post key={post._id} post={post} postedBy={post.postedBy} />
              );
            }
            if (activeTab === "reposts" && isRepost) {
              return (
                <Post key={post._id} post={post} postedBy={post.postedBy} />
              );
            }
            return null;
          })}

          {/* Empty State Handlers */}
          {activeTab === "threads" &&
            !posts.some(
              (p) =>
                (p.postedBy === user._id || p.postedBy?._id === user._id) &&
                !p.repostedFrom,
            ) && (
              <Text textAlign="center" color="gray.500" mt={5}>
                No threads yet.
              </Text>
            )}
          {activeTab === "replies" &&
            !posts.some((p) =>
              p.replies.some((r) => r.userId === user._id),
            ) && (
              <Text textAlign="center" color="gray.500" mt={5}>
                No replies yet.
              </Text>
            )}
          {activeTab === "reposts" &&
            !posts.some(
              (p) =>
                (p.postedBy === user._id || p.postedBy?._id === user._id) &&
                p.repostedFrom,
            ) && (
              <Text textAlign="center" color="gray.500" mt={5}>
                No reposts yet.
              </Text>
            )}
        </>
      )}
    </>
  );
};

export default UserPage;
