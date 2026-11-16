import { Link } from "react-router-dom";

function AdminDashboard() {
    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <p>Manage your BlogSpace website.</p>

            <div>
                <Link to="/admin/users">Manage Users</Link>
            </div>

            <div>
                <Link to="/admin/posts">Manage Posts</Link>
            </div>
        </div>
    );
}

export default AdminDashboard;
