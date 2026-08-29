import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Text,
  Spinner,
  useColorModeValue,
  Avatar,
  Checkbox,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import {
  FiDownload,
  FiTrash2,
  FiMaximize2,
  FiXCircle,
  FiRefreshCcw,
  FiPlayCircle,
} from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

const MediaManagement = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewMedia, setPreviewMedia] = useState({ url: "", isVideo: false });

  const showToast = useShowToast();
  const bgCard = useColorModeValue("white", "gray.dark");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch("/api/admin/media");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMediaList(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [showToast]);

  const filteredMedia = useMemo(() => {
    const now = new Date();
    return mediaList.filter((item) => {
      const itemDate = new Date(item.createdAt);
      if (dateFilter === "today")
        return itemDate.toDateString() === now.toDateString();
      if (dateFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return itemDate.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === "7days")
        return (now - itemDate) / (1000 * 60 * 60 * 24) <= 7;
      if (dateFilter === "30days")
        return (now - itemDate) / (1000 * 60 * 60 * 24) <= 30;
      if (dateFilter === "custom" && customStart && customEnd) {
        return (
          itemDate >= new Date(customStart) &&
          itemDate <= new Date(customEnd + "T23:59:59")
        );
      }
      return true;
    });
  }, [mediaList, dateFilter, customStart, customEnd]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedMedia(filteredMedia.map((m) => m._id));
    else setSelectedMedia([]);
  };

  const toggleSelect = (id) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedMedia.length} selected items?`,
      )
    )
      return;

    const itemsToDelete = mediaList
      .filter((m) => selectedMedia.includes(m._id))
      .map((m) => ({ id: m._id, type: m.type }));

    try {
      const res = await fetch(`/api/admin/media/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToDelete }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showToast("Success", "Selected media deleted permanently", "success");
      setMediaList((prev) =>
        prev.filter((item) => !selectedMedia.includes(item._id)),
      );
      setSelectedMedia([]);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleSingleDelete = async (id, type) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this media?")
    )
      return;
    try {
      const res = await fetch(`/api/admin/media/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id, type }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast("Success", "Media deleted permanently", "success");
      setMediaList((prev) => prev.filter((item) => item._id !== id));
      setSelectedMedia((prev) => prev.filter((mId) => mId !== id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const downloadMedia = async (url, isVideo) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `momentogram-media.${isVideo ? "mp4" : "jpg"}`;
      link.click();
    } catch (err) {
      showToast("Error", "Failed to download file", "error");
    }
  };

  const openPreview = (url, isVideo) => {
    setPreviewMedia({ url, isVideo });
    onOpen();
  };

  const resetFilters = () => {
    setDateFilter("all");
    setCustomStart("");
    setCustomEnd("");
  };

  if (loading)
    return (
      <Flex justify="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box w="full" maxW="1200px" mx="auto" px={4} py={6}>
      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={6}>
        Super Admin Media Management
      </Text>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={6}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <Flex gap={4} wrap="wrap" align="center">
          <Select
            w="180px"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </Select>
          {dateFilter === "custom" && (
            <Flex gap={2} align="center">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <Text>to</Text>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  setCustomStart("");
                  setCustomEnd("");
                }}
                variant="ghost"
                colorScheme="red"
              >
                Clear
              </Button>
            </Flex>
          )}
          {(dateFilter !== "all" || customStart !== "") && (
            <Button
              size="sm"
              leftIcon={<FiRefreshCcw />}
              onClick={resetFilters}
              variant="outline"
              colorScheme="blue"
            >
              Reset Filters
            </Button>
          )}
        </Flex>
        <Flex gap={4} align="center" wrap="wrap">
          {selectedMedia.length > 0 && (
            <Button
              size="sm"
              leftIcon={<FiXCircle />}
              variant="ghost"
              colorScheme="gray"
              onClick={() => setSelectedMedia([])}
            >
              Cancel Selection
            </Button>
          )}
          <Checkbox
            isChecked={
              selectedMedia.length > 0 &&
              selectedMedia.length === filteredMedia.length
            }
            onChange={handleSelectAll}
          >
            Select All
          </Checkbox>
          <Button
            colorScheme="red"
            leftIcon={<FiTrash2 />}
            onClick={handleBulkDelete}
            isDisabled={selectedMedia.length === 0}
          >
            Delete Selected ({selectedMedia.length})
          </Button>
        </Flex>
      </Flex>

      {filteredMedia.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={10}>
          No media found for the selected criteria.
        </Text>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
        >
          {filteredMedia.map((item) => {
            // Robust check for Cloudinary videos
            const isVideo =
              item.url &&
              typeof item.url === "string" &&
              (item.url.includes("/video/upload/") ||
                !!item.url.match(/\.(mp4|webm|ogg|mov)/i));

            return (
              <Flex
                key={item._id}
                direction="column"
                bg={bgCard}
                p={4}
                borderRadius="xl"
                boxShadow="md"
                position="relative"
              >
                <Checkbox
                  position="absolute"
                  top={2}
                  right={2}
                  size="lg"
                  isChecked={selectedMedia.includes(item._id)}
                  onChange={() => toggleSelect(item._id)}
                  zIndex={2}
                  bg="whiteAlpha.800"
                  borderRadius="md"
                />

                <Box
                  position="relative"
                  cursor="pointer"
                  onClick={() => openPreview(item.url, isVideo)}
                  group="true"
                  borderRadius="md"
                  overflow="hidden"
                  h="180px"
                  mb={3}
                  bg="blackAlpha.900"
                >
                  {isVideo ? (
                    <>
                      <video
                        src={item.url}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Flex
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        bg="blackAlpha.400"
                        justify="center"
                        align="center"
                      >
                        <FiPlayCircle color="white" size={40} />
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Image
                        src={item.url}
                        fallback={<Box h="100%" w="100%" bg="gray.700" />}
                        h="100%"
                        w="100%"
                        objectFit="cover"
                      />
                      <Flex
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        bg="blackAlpha.500"
                        opacity={0}
                        _hover={{ opacity: 1 }}
                        transition="0.2s"
                        align="center"
                        justify="center"
                      >
                        <FiMaximize2 color="white" size={30} />
                      </Flex>
                    </>
                  )}
                </Box>

                <Flex align="center" gap={3} mb={3}>
                  <Avatar src={item.user?.profilePic} size="sm" />
                  <Box overflow="hidden">
                    <Text fontWeight="bold" fontSize="sm" isTruncated>
                      {item.user?.username || "Unknown"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <Badge
                      colorScheme={item.type === "post" ? "purple" : "blue"}
                      fontSize="0.6em"
                    >
                      {item.type}
                    </Badge>
                  </Box>
                </Flex>

                {/* Conditional Actions for Posts vs Messages */}
                <Flex justifyContent="space-between" mt="auto">
                  {item.type === "post" ? (
                    <Button
                      size="sm"
                      as={RouterLink}
                      to={`/${item.user?.username}/post/${item._id}`}
                      colorScheme="purple"
                      variant="outline"
                    >
                      Go to Post
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      leftIcon={<FiDownload />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => downloadMedia(item.url, isVideo)}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleSingleDelete(item._id, item.type)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            );
          })}
        </Grid>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(5px)" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          m={0}
          p={0}
          w="100vw"
          h="100vh"
          maxW="100vw"
          maxH="100vh"
          borderRadius={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <ModalCloseButton
            color="white"
            size="lg"
            position="absolute"
            top={4}
            right={4}
            zIndex={20}
            bg="blackAlpha.600"
            borderRadius="full"
          />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            p={4}
            w="100%"
            h="100%"
            overflow="hidden"
          >
            {previewMedia.isVideo ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "8px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              />
            ) : (
              <Image
                src={previewMedia.url}
                maxW="95%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="md"
              />
            )}
            <Button
              mt={6}
              colorScheme="blue"
              leftIcon={<FiDownload />}
              onClick={() =>
                downloadMedia(previewMedia.url, previewMedia.isVideo)
              }
              borderRadius="full"
              size="md"
            >
              Download {previewMedia.isVideo ? "Video" : "Image"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MediaManagement;
