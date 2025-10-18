import React, { useState } from "react";
import { register } from "@/api/auth";

const Signup = () => {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", password: "", role: "student" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
    alert("Account created!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" />
      <input name="first_name" placeholder="First Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full" />
      <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="examiner">Examiner</option>
      </select>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  );
};

export default Signup;
