import React, { useState } from "react";
import { resetPassword } from "@/api/auth";

const ResetPassword = () => {
  const [form, setForm] = useState({ email: "", new_password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(form);
    alert("Password reset successful");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" />
      <input name="new_password" placeholder="New Password" onChange={handleChange} className="border p-2 w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Reset Password</button>
    </form>
  );
};

export default ResetPassword;
