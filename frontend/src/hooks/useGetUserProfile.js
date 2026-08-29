import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const useGetUserProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const { username } = useParams();
	const navigate = useNavigate();

	// Prevent fetching if the route is clearly not a user (like /404, /chat, /admin, etc.)
	const reservedRoutes = ["404", "chat", "admin", "auth", "settings"];

	useEffect(() => {
		if (reservedRoutes.includes(username)) {
			navigate("/404", { replace: true });
			return;
		}

		const getUser = async () => {
			try {
				const res = `/api/users/profile/${username}`;
				const response = await fetch(res);
				const data = await response.json();

				if (data.error || response.status === 404) {
					navigate("/404", { replace: true });
					return;
				}

				setUser(data);
			} catch (error) {
				navigate("/404", { replace: true });
			} finally {
				setLoading(false);
			}
		};
		getUser();
	}, [username, navigate]);

	return { loading, user };
};

export default useGetUserProfile;