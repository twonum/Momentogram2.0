import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
	const [imgUrl, setImgUrl] = useState(null);
	const [fileType, setFileType] = useState(null); // Tracks if it's image or video
	const showToast = useShowToast();

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImgUrl(reader.result);
				setFileType(file.type.startsWith("video/") ? "video" : "image");
			};
			reader.readAsDataURL(file);
		} else {
			showToast("Invalid file type", "Please select an image or video file", "error");
			setImgUrl(null);
			setFileType(null);
		}
	};

	return { handleImageChange, imgUrl, setImgUrl, fileType, setFileType };
};

export default usePreviewImg;