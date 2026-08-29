import {
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  Avatar,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  FormControl,
  FormLabel,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);

  const bgConfig = useColorModeValue("white", "gray.dark");
  const textColor = useColorModeValue("black", "white");

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

  const handleToggleMods = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/users/admin/toggle-mods", {
        method: "PUT",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast(
        "Success",
        `Admin modifications are now ${data.status ? "ENABLED" : "DISABLED"}`,
        "success",
      );
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setToggling(false);
    }
  };

  if (loading)
    return (
      <Flex justify="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box w="full" maxW="800px" mx="auto">
      <Text fontSize="3xl" fontWeight="bold" mb={6} textAlign="center">
        Management Dashboard
      </Text>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>👥 User Management</Tab>
          {currentUser?.role === "superadmin" && (
            <Tab>👑 Super Admin Controls</Tab>
          )}
        </TabList>

        <TabPanels>
          {/* User Management Tab */}
          <TabPanel>
            <Flex direction="column" gap={4} mt={4}>
              {Array.isArray(users) &&
                users.map((u) => (
                  <Flex
                    key={u._id}
                    justifyContent="space-between"
                    alignItems="center"
                    p={4}
                    bg={bgConfig}
                    color={textColor}
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Flex gap={4} alignItems="center">
                      <Avatar
                        src={u.profilePic}
                        name={u.username}
                        cursor="pointer"
                        onClick={() => window.open(`/${u.username}`, "_blank")}
                      />
                      <Box>
                        <Flex gap={2} alignItems="center">
                          <Text
                            fontWeight="bold"
                            cursor="pointer"
                            onClick={() =>
                              window.open(`/${u.username}`, "_blank")
                            }
                          >
                            {u.username}
                          </Text>
                          {u.role === "superadmin" && (
                            <Badge colorScheme="red">Super Admin</Badge>
                          )}
                          {u.role === "admin" && (
                            <Badge colorScheme="green">Admin</Badge>
                          )}
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                          {u.email}
                        </Text>
                      </Box>
                    </Flex>
                    {u._id !== currentUser?._id && u.role !== "superadmin" && (
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
          </TabPanel>

          {/* Super Admin Controls Tab */}
          {currentUser?.role === "superadmin" && (
            <TabPanel>
              <Box p={6} bg={bgConfig} borderRadius="md" boxShadow="sm" mt={4}>
                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <FormLabel htmlFor="mod-alerts" mb="0" fontWeight="bold">
                      Allow Normal Admins to Modify Data
                    </FormLabel>
                    <Text fontSize="sm" color="gray.500">
                      If enabled, standard admins can delete users and posts. If
                      disabled, they have read-only access.
                    </Text>
                  </Box>
                  <Switch
                    id="mod-alerts"
                    size="lg"
                    colorScheme="blue"
                    onChange={handleToggleMods}
                    isDisabled={toggling}
                  />
                </FormControl>
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminPage;
