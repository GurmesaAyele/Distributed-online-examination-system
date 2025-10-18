import React, { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from "@/api/users";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "student" });
  const [editId, setEditId] = useState<number | null>(null);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await updateUser(editId, form);
    else await createUser(form);
    setEditId(null);
    setForm({ email: "", first_name: "", last_name: "", role: "student" });
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleResetPassword = async (id: number) => {
    const new_password = prompt("Enter new password:");
    if (new_password) await resetUserPassword(id, new_password);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2" />
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="border p-2" />
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="border p-2" />
        <select name="role" value={form.role} onChange={handleChange} className="border p-2">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="examiner">Examiner</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t text-center">
              <td>{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.role}</td>
              <td className="space-x-2">
                <button onClick={() => { setForm(u); setEditId(u.id); }} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(u.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                <button onClick={() => handleResetPassword(u.id)} className="bg-green-600 text-white px-2 py-1 rounded">Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
