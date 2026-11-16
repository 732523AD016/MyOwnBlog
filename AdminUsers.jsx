
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminusers.css";

const API_URL = "http://localhost:5000/api";

const availablePermissions = [
    { key: "createPost", label: "Create Posts" },
    { key: "editOwnPosts", label: "Edit Own Posts" },
    { key: "deleteOwnPosts", label: "Delete Own Posts" },
    { key: "publishPosts", label: "Publish Posts" },
    { key: "manageUsers", label: "Manage Users" }
];

function AdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState("");

    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (!token || !currentUser || currentUser.role !== "admin") {
            navigate("/login");
            return;
        }

        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to load users");
            }

            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (userId, field, value) => {
        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user._id === userId
                    ? { ...user, [field]: value }
                    : user
            )
        );
    };

    const updatePermission = (userId, permission, checked) => {
        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user._id === userId
                    ? {
                        ...user,
                        permissions: {
                            ...(user.permissions || {}),
                            [permission]: checked
                        }
                    }
                    : user
            )
        );
    };

    const saveUser = async (user) => {
        try {
            setSavingId(user._id);
            setError("");

            const roleResponse = await fetch(
                `${API_URL}/admin/users/${user._id}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        role: user.role
                    })
                }
            );

            const roleData = await roleResponse.json();

            if (!roleResponse.ok) {
                throw new Error(roleData.message || "Unable to update role");
            }

            const permissionResponse = await fetch(
                `${API_URL}/admin/users/${user._id}/permissions`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        permissions: user.permissions || {}
                    })
                }
            );

            const permissionData = await permissionResponse.json();

            if (!permissionResponse.ok) {
                throw new Error(
                    permissionData.message || "Unable to update permissions"
                );
            }

            alert("User details updated successfully!");
            fetchUsers();
        } catch (err) {
            setError(err.message || "Unable to save user details");
        } finally {
            setSavingId("");
        }
    };

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (user.name || "").toLowerCase().includes(searchText) ||
            (user.email || "").toLowerCase().includes(searchText);

        const matchesRole =
            roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const authorCount = users.filter(
        (user) => user.role === "author"
    ).length;

    const adminCount = users.filter(
        (user) => user.role === "admin"
    ).length;

    const handleBack = () => {
        navigate("/admin/dashboard");
    };

    if (loading) {
        return (
            <div className="users-loading">
                <div className="users-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="users-page">

            <header className="users-header">
                <div>
                    <button className="users-back" onClick={handleBack}>
                        ← Dashboard
                    </button>

                    <p className="users-subtitle">ADMINISTRATION</p>
                    <h1>User Management</h1>
                    <p>Manage users, authors, roles and permissions.</p>
                </div>

                <div className="users-header-icon">♙</div>
            </header>

            {error && (
                <div className="users-error">
                    {error}
                </div>
            )}

            <section className="users-summary">

                <div className="users-summary-card">
                    <span className="summary-icon purple">♙</span>
                    <div>
                        <p>Total Users</p>
                        <h2>{users.length}</h2>
                    </div>
                </div>

                <div className="users-summary-card">
                    <span className="summary-icon green">✎</span>
                    <div>
                        <p>Total Authors</p>
                        <h2>{authorCount}</h2>
                    </div>
                </div>

                <div className="users-summary-card">
                    <span className="summary-icon orange">★</span>
                    <div>
                        <p>Administrators</p>
                        <h2>{adminCount}</h2>
                    </div>
                </div>

            </section>

            <section className="users-management">

                <div className="users-section-heading">
                    <div>
                        <h2>All Users</h2>
                        <p>View and manage registered accounts.</p>
                    </div>
                    <span className="users-count">
                        {filteredUsers.length} Users
                    </span>
                </div>

                <div className="users-filters">

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="author">Author</option>
                        <option value="user">User</option>
                    </select>

                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User Details</th>
                                <th>Current Role</th>
                                <th>Manage Role</th>
                                <th>Permissions</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const isCurrentUser =
                                        user._id === currentUser?._id;

                                    return (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-details">
                                                    <div className="user-avatar">
                                                        {(user.name || "U")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <h4>{user.name || "Unknown"}</h4>
                                                        <p>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`user-role ${user.role}`}>
                                                    {user.role || "user"}
                                                </span>
                                            </td>

                                            <td>
                                                <select
                                                    className="role-select"
                                                    value={user.role || "user"}
                                                    disabled={isCurrentUser}
                                                    onChange={(event) =>
                                                        updateUser(
                                                            user._id,
                                                            "role",
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="user">User</option>
                                                    <option value="author">Author</option>
                                                    <option value="admin">Admin</option>
                                                </select>

                                                {isCurrentUser && (
                                                    <small className="self-note">
                                                        Your account
                                                    </small>
                                                )}
                                            </td>

                                            <td>
                                                <details className="permission-details">
                                                    <summary>View Permissions</summary>

                                                    <div className="permission-list">
                                                        {availablePermissions.map(
                                                            (permission) => (
                                                                <label key={permission.key}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Boolean(
                                                                            user.permissions?.[
                                                                                permission.key
                                                                            ]
                                                                        )}
                                                                        disabled={isCurrentUser}
                                                                        onChange={(event) =>
                                                                            updatePermission(
                                                                                user._id,
                                                                                permission.key,
                                                                                event.target.checked
                                                                            )
                                                                        }
                                                                    />

                                                                    {permission.label}
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                </details>
                                            </td>

                                            <td>
                                                <button
                                                    className="save-user-btn"
                                                    disabled={
                                                        savingId === user._id ||
                                                        isCurrentUser
                                                    }
                                                    onClick={() => saveUser(user)}
                                                >
                                                    {savingId === user._id
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="users-empty">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </section>

            <footer className="users-footer">
                © {new Date().getFullYear()} MyOwnBlog Admin Panel
            </footer>

        </div>
    );}
export default AdminUsers;
