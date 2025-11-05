import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple local-only login logic (for demo)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.username === username && storedUser.password === password) {
      localStorage.setItem("loggedIn", "true");
      navigate("/Games");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded hover:scale-105 transition-transform">Login</button>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <a href="/Welcome" className="text-blue-600 font-semibold">Sign up</a>
        </div>
      </form>
    </div>
  