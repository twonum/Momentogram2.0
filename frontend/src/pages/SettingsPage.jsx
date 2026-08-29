import { Button, Text, Flex, Box } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";

export const SettingsPage = () => {
  const showToast = useShowToast();
  const logout = useLogout();

  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?"))
      return;
    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");
      await logout();
      showToast("Success", "Your account has been frozen", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "WARNING: This permanently deletes your account and posts. Continue?",
      )
    )
      return;
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");
      await logout();
      showToast("Success", "Account deleted permanently", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Flex direction="column" gap={6}>
      <Box>
        <Text my={1} fontWeight={"bold"}>
          Freeze Your Account
        </Text>
        <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
        <Button size={"sm"} colorScheme="yellow" onClick={freezeAccount}>
          Freeze
        </Button>
      </Box>
      <Box>
        <Text my={1} fontWeight={"bold"} color="red.500">
          Delete Account
        </Text>
        <Text my={1}>
          Permanently erase all your data. This cannot be undone.
        </Text>
        <Button size={"sm"} colorScheme="red" onClick={deleteAccount}>
          Delete Account
        </Button>
      </Box>
    </Flex>
  );
};
