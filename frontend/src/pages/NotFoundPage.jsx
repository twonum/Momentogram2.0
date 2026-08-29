import { Box, Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AiOutlineWarning } from "react-icons/ai";

const NotFoundPage = () => {
  return (
    <Flex
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      minH="70vh"
      textAlign="center"
      px={4}
    >
      <Box color="blue.400" mb={4}>
        <AiOutlineWarning size={64} />
      </Box>
      <Text fontSize="4xl" fontWeight="bold" mb={2}>
        Page Not Found
      </Text>
      <Text fontSize="md" color="gray.500" maxW="400px" mb={6}>
        The page you are looking for doesn't exist or has been moved.
      </Text>
      <Button
        as={RouterLink}
        to="/"
        colorScheme="blue"
        borderRadius="full"
        px={6}
      >
        Go Back Home
      </Button>
    </Flex>
  );
};

export default NotFoundPage;
