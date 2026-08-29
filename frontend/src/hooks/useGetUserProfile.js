import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";

const useGetUserProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const { username } = useParams();
	const showToast = useShowToast();

	useEffect(() => {
		const getUser = async () => {
			setLoading(true);
			try {
				const res = await fetch(`/api/users/profile/${username}`);
				const data = await res.json();

				// Catch both custom and standard server errors
				if (data.error || data.message) {
					showToast("Error", data.error || data.message, "error");
					setUser(null);
					return;
				}
				if (data.isFrozen) {
					setUser(null);
					return;
				}
				setUser(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		getUser();
	}, [username, showToast]);

	return { loading, user };
};

export default useGetUserProfile;