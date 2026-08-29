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
  const [modsAllowed, setModsAllowed] = useState(false);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);

  const bgConfig = useColorModeValue("white", "gray.dark");
  const textColor = useColorModeValue("black", "white");

  useEffect(() => {
    const fetchAdminData = async () => {
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
    fetchAdminData();
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
      setModsAllowed(data.status);
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
    <Box w="full" maxW="800px" mx="auto" px={{ base: 2, md: 4 }}>
      <Text
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        mb={6}
        textAlign="center"
      >
        Management Dashboard
      </Text>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList overflowX="auto" overflowY="hidden">
          <Tab fontSize={{ base: "sm", md: "md" }}>👥 User Management</Tab>
          {currentUser?.role === "superadmin" && (
            <Tab fontSize={{ base: "sm", md: "md" }}>
              👑 Super Admin Controls
            </Tab>
          )}
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Flex direction="column" gap={4} mt={4}>
              {Array.isArray(users) &&
                users.map((u) => (
                  <Flex
                    key={u._id}
                    justifyContent="space-between"
                    alignItems="center"
                    p={{ base: 3, md: 4 }}
                    bg={bgConfig}
                    color={textColor}
                    borderRadius="md"
                    boxShadow="sm"
                    wrap="wrap"
                    gap={3}
                  >
                    <Flex gap={3} alignItems="center" flex="1" minW="200px">
                      <Avatar
                        src={u.profilePic}
                        name={u.username}
                        cursor="pointer"
                        onClick={() => window.open(`/${u.username}`, "_blank")}
                      />
                      <Box overflow="hidden">
                        <Flex gap={2} alignItems="center" wrap="wrap">
                          <Text
                            fontWeight="bold"
                            cursor="pointer"
                            isTruncated
                            onClick={() =>
                              window.open(`/${u.username}`, "_blank")
                            }
                          >
                            {u.username}
                          </Text>
                          {u.role === "superadmin" && (
                            <Badge colorScheme="red" fontSize="10px">
                              Super Admin
                            </Badge>
                          )}
                          {u.role === "admin" && (
                            <Badge colorScheme="green" fontSize="10px">
                              Admin
                            </Badge>
                          )}
                        </Flex>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          isTruncated
                          maxW="220px"
                        >
                          {u.email}
                        </Text>
                      </Box>
                    </Flex>
                    {u._id !== currentUser?._id && u.role !== "superadmin" && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(u._id)}
                        flexShrink={0}
                      >
                        Delete User
                      </Button>
                    )}
                  </Flex>
                ))}
            </Flex>
          </TabPanel>

          {currentUser?.role === "superadmin" && (
            <TabPanel px={0}>
              <Box p={6} bg={bgConfig} borderRadius="md" boxShadow="sm" mt={4}>
                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  wrap="wrap"
                  gap={4}
                >
                  <Box maxW="500px">
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
                    isChecked={modsAllowed}
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
