import { Button } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/react";
import { FiMusic } from "react-icons/fi";

const MusicButton = () => {
  const handleRedirect = () => {
    window.open("https://skycarly.onrender.com", "_blank"); // Opens the link in a new tab
  };

  return (
    <Tooltip label="LISTEN TO MUSIC" placement="top" hasArrow>
      <Button
        position={"fixed"}
        bottom={"30px"}
        right={"30px"}
        size={"sm"}
        onClick={handleRedirect}
        bg={"blue.500"}
        color={"white"}
        _hover={{ bg: "blue.700" }}
      >
        <FiMusic size={20} />
      </Button>
    </Tooltip>
  );
};

export default MusicButton;
