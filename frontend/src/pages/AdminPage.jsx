import {
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const bgConfig = useColorModeValue("white", "gray.dark");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/admin/users");
        const data = await res.json();
        if (data.error || data.message) {
          showToast("Error", data.error || data.message, "error");
          return;
        }
        setUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showToast]);

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure? This deletes the user and ALL their posts permanently.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/admin/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "User deleted successfully", "success");
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (loading)
    return (
      <Flex justify="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
        Admin Dashboard
      </Text>
      <Flex direction="column" gap={4}>
        {Array.isArray(users) &&
          users.map((u) => (
            <Flex
              key={u._id}
              justifyContent="space-between"
              alignItems="center"
              p={4}
              bg={bgConfig}
              borderRadius="md"
              boxShadow="sm"
            >
              <Flex gap={4} alignItems="center">
                <Avatar src={u.profilePic} name={u.username} />
                <Box>
                  <Text fontWeight="bold">{u.username}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {u.email}
                  </Text>
                </Box>
              </Flex>
              {u._id !== currentUser?._id && (
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  Delete User
                </Button>
              )}
            </Flex>
          ))}
      </Flex>
    </Box>
  );
};

export default AdminPage;
