import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import MediaManagement from "./pages/MediaManagement";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();

  return (
    <Box position={"relative"} w="full">
      <Container
        maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}
      >
        <Header />
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/" />}
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route
            path="/update"
            element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
          />

          <Route
            path="/admin/media"
            element={
              user?.role === "superadmin" ? (
                <MediaManagement />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/:username"
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />

          <Route path="*" element={<NotFoundPage />} />

          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route
            path="/chat"
            element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
          />
          <Route
            path="/settings"
            element={user ? <SettingsPage /> : <Navigate to={"/auth"} />}
          />

          {/* FIXED: Route now checks for the new role schema instead of the old boolean */}
          <Route
            path="/admin"
            element={
              user && (user.role === "admin" || user.role === "superadmin") ? (
                <AdminPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
