import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthForm = () => {
  const { backendUrl, setToken } = useContext(ShopContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("Sign Up"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = mode === "Sign Up" ? "/register" : "/login";
      const payload =
        mode === "Sign Up" ? { name, email, password } : { email, password };

      const { data } = await axios.post(
        `${backendUrl}/api/user${endpoint}`,
        payload
      );

      if (data.success) {
        toast.success(`${mode} successful!`);

        // ✅ Save token for auto-login
        setToken(data.token);
        localStorage.setItem("token", data.token);

        // Redirect to home page
        navigate("/");
      } else {
        toast.error(data.message || `${mode} failed`);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <h2 className="text-3xl font-semibold">{mode}</h2>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Name input only for Sign Up */}
      {mode === "Sign Up" && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full px-3 py-2 border border-gray-800 rounded"
          required
        />
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-3 py-2 border border-gray-800 rounded"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-3 py-2 border border-gray-800 rounded"
        required
      />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p
          className="cursor-pointer text-blue-600"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot your password?
        </p>

        {mode === "Login" ? (
          <p className="cursor-pointer" onClick={() => setMode("Sign Up")}>
            Create Account
          </p>
        ) : (
          <p className="cursor-pointer" onClick={() => setMode("Login")}>
            Login Here
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4 rounded cursor-pointer"
      >
        {mode === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default AuthForm;
