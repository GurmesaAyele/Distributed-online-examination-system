import React, { useEffect, useState } from "react";
import "../styles/admin-dashboard.css";
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
};

type Exam = {
  id: number;
  name: string;
  max_score: number;
};

const roles = ["admin", "teacher", "student"];
const USERS_PER_PAGE = 6;

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [darkMode, setDarkMode] = useState(false);

  // Edit user modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formUser, setFormUser] = useState<any>({
    username: "",
    email: "",
    role: "student",
    is_active: true,
    profile_photo: null,
  });
  const [preview, setPreview] = useState<string>("");

  // Add user
  const [newUser, setNewUser] = useState<any>({
    username: "",
    email: "",
    role: "student",
    is_active: true,
    password: "",
    profile_photo: null,
  });
  const [newPreview, setNewPreview] = useState<string>("");

  // Reset Password Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Loading and Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------- Load Data --------------------
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/users/");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/exams/");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error("Error loading exams:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadExams();
  }, []);

  // -------------------- Search --------------------
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  // -------------------- Charts --------------------
  const activeStatusChart = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Users Status",
        data: [users.filter((u) => u.is_active).length, users.filter((u) => !u.is_active).length],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  const roleChart = {
    labels: roles,
    datasets: [
      {
        label: "Users by Role",
        data: roles.map((r) => users.filter((u) => u.role === r).length),
        backgroundColor: ["#007bff", "#ffc107", "#17a2b8"],
      },
    ],
  };

  const examChart = {
    labels: exams.map((e) => e.name),
    datasets: [
      {
        label: "Exams Max Score",
        data: exams.map((e) => e.max_score),
        backgroundColor: "#6f42c1",
      },
    ],
  };

  // -------------------- Handlers --------------------
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setFormUser({
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      profile_photo: null,
    });
    setShowEditModal(true);
    setPreview("");
  };

  const handleSaveChanges = async (userId: number) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", formUser.username);
      formData.append("email", formUser.email);
      formData.append("role", formUser.role);
      formData.append("is_active", formUser.is_active.toString());
      if (formUser.profile_photo) {
        formData.append("profile_photo", formUser.profile_photo);
      }

      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update user");

      alert("User updated successfully!");
      closeEditModal();
      loadUsers();
    } catch (err: any) {
      alert("Error updating user: " + err.message);
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordClick = (userId: number) => {
    setResettingUserId(userId);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!resettingUserId) return;

    // Validate passwords
    if (!newPassword.trim()) {
      setPasswordError("Password is required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${resettingUserId}/reset-password/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      alert("Password reset successfully!");
      closeResetPasswordModal();
      loadUsers();
    } catch (err: any) {
      alert("Error resetting password: " + err.message);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user? This action cannot be undone!");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If status is 204 (No Content), it's still successful
        if (response.status !== 204) {
          throw new Error("Failed to delete user");
        }
      }

      alert("User deleted successfully!");
      loadUsers();
      
      // If we're in edit modal for this user, close it
      if (editingUserId === userId) {
        closeEditModal();
      }
    } catch (err: any) {
      alert("Error deleting user: " + err.message);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("username", newUser.username);
      formData.append("email", newUser.email);
      formData.append("role", newUser.role);
      formData.append("is_active", newUser.is_active.toString());
      formData.append("password", newUser.password);
      if (newUser.profile_photo) {
        formData.append("profile_photo", newUser.profile_photo);
      }

      const response = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create user");

      alert("User created successfully!");
      setNewUser({ username: "", email: "", role: "student", is_active: true, password: "", profile_photo: null });
      setNewPreview("");
      loadUsers();
      setActiveTab("users");
    } catch (err: any) {
      alert("Error creating user: " + err.message);
      console.error("Create user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUserId(null);
    setFormUser({ username: "", email: "", role: "student", is_active: true, profile_photo: null });
    setPreview("");
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setResettingUserId(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Edit User Modal */}
      {showEditModal && editingUserId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username:</label>
                <input 
                  type="text" 
                  value={formUser.username} 
                  onChange={(e) => setFormUser({ ...formUser, username: e.target.value })} 
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={formUser.email} 
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} 
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Role:</label>
                <select 
                  value={formUser.role} 
                  onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
                  className="form-input"
                  disabled={loading}
                >
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Active Status:</label>
                <select 
                  value={formUser.is_active} 
                  onChange={(e) => setFormUser({ ...formUser, is_active: e.target.value === "true" })}
                  className="form-input"
                  disabled={loading}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Profile Photo:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setFormUser({ ...formUser, profile_photo: file });
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="form-input"
                  disabled={loading}
                />
                {preview && (
                  <img 
                    src={preview} 
                    className="preview-image"
                    alt="Preview" 
                  />
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => handleSaveChanges(editingUserId)}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button 
                onClick={closeEditModal}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteUser(editingUserId)}
                className="btn btn-danger"
                disabled={loading}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resettingUserId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="close-btn" onClick={closeResetPasswordModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Password:</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }} 
                  className="form-input"
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password:</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }} 
                  className="form-input"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>
              
              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}
              
              <div className="password-rules">
                <small>Password must be at least 6 characters long</small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleResetPassword}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button 
                onClick={closeResetPasswordModal}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)} disabled={loading}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <ul>
          <li onClick={() => !loading && setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>Users</li>
          <li onClick={() => !loading && setActiveTab("addUser")} className={activeTab === "addUser" ? "active" : ""}>Add User</li>
          <li onClick={() => !loading && setActiveTab("stats")} className={activeTab === "stats" ? "active" : ""}>Stats</li>
        </ul>
      </aside>

      <main className="content">
        {/* Error Message */}
        {error && (
          <div className="error-alert">
            Error: {error}
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div>
            <h2>Users</h2>

            <input
              type="text"
              placeholder="Search by username, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={loading}
            />

            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                      {loading ? "Loading users..." : "No users found"}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="avatar-placeholder">N/A</div>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => handleEditClick(user)} 
                          className="btn-edit"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleResetPasswordClick(user.id)} 
                          className="btn-reset"
                          disabled={loading}
                        >
                          Reset Password
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn-delete"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ADD USER */}
        {activeTab === "addUser" && (
          <div>
            <h2>Add User</h2>
            <form className="form-box" onSubmit={handleCreateUser}>
              <input 
                type="text" 
                placeholder="Username" 
                value={newUser.username} 
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} 
                required 
                disabled={loading}
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={newUser.email} 
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                required 
                disabled={loading}
              />
              <select 
                value={newUser.role} 
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                disabled={loading}
              >
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select 
                value={newUser.is_active} 
                onChange={(e) => setNewUser({ ...newUser, is_active: e.target.value === "true" })}
                disabled={loading}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input 
                type="password" 
                placeholder="Password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
                required 
                disabled={loading}
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setNewUser({ ...newUser, profile_photo: file });
                    setNewPreview(URL.createObjectURL(file));
                  }
                }} 
                disabled={loading}
              />
              {newPreview && <img src={newPreview} className="preview-image" alt="Preview" />}
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        )}

        {/* STATS */}
        {activeTab === "stats" && (
          <div>
            <h2>Dashboard Stats</h2>
            <div className="charts">
              <div className="chart-box"><h4>Users Active Status</h4><Pie data={activeStatusChart} /></div>
              <div className="chart-box"><h4>Users by Role</h4><Pie data={roleChart} /></div>
              <div className="chart-box"><h4>Exams Max Score</h4><Bar data={examChart} /></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;