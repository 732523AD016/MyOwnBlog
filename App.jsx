import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";

import Register from "./pages/Register";
import Login from "./pages/Login";

import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import MyBlogs from "./pages/MyBlogs";

import AdminDashboard from "./pages/AdminDashboard";
import AdminPosts from "./pages/AdminPosts";
import AdminUsers from "./pages/AdminUsers";

import NotFound from "./pages/NotFound";
function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }}
function ProtectedRoute({ children, allowedRoles = [] }) {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const user = getUser();

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }  const userRole = user.role?.toLowerCase();
   if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
    ) {
        return <Navigate to="/" replace />;
    }

    return children;
}
function AppLayout() {
    const location = useLocation();

    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminPage && <Navbar />}

            <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />

                <Route path="/blogs" element={<BlogList />} />

                <Route
                    path="/:id"
                    element={<BlogDetails />}
                />

                <Route
                    path="/category/:slug"
                    element={<CategoryPage />}
                />

                <Route
                    path="/tag/:slug"
                    element={<TagPage />}
                />

                {/* Authentication */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Any logged-in user can write, edit and delete their own blogs */}
                <Route
                    path="/create-blog"
                    element={
                        <ProtectedRoute>
                            <CreateBlog />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit-blog/:id"
                    element={
                        <ProtectedRoute>
                            <EditBlog />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-blogs"
                    element={
                        <ProtectedRoute>
                            <MyBlogs />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Pages */}
                <Route
                    path="/admin"
                    element={<Navigate to="/admin/dashboard" replace />}
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/posts"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPosts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />

                {/* Not Found */}
                <Route path="/404" element={<NotFound />} />

                <Route path="*" element={<NotFound />} />
            </Routes>

            {!isAdminPage && <Footer />}
        </>
    );
}
function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );}
export default App;
