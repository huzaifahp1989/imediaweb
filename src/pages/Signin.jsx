import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    localStorage.setItem("user", JSON.stringify({ username, password }));
    setSuccess(true);
    setTimeout(() => {
      navigate("/Login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">Account created! Redirecting to login...</div>}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded hover:scale-105 transition-transform">Sign Up</button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <a href="/Login" className="text-blue-600 font-semibold">Login</a>
        </div>
      </form>
    </div>
  );
}
