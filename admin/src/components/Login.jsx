import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Handle Login / Register Submit
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/api/user/admin" : "/api/user/register";
      const payload = isLogin ? { email, password } : { name, email, password };

      const response = await axios.post(backendUrl + endpoint, payload);

      if (response.data.success) {
        setToken(response.data.token);
        toast.success(isLogin ? "Login successful!" : "Registration successful!");
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ✅ Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      if (!email) {
        toast.error("Please enter your email address.");
        return;
      }

      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      if (response.data.success) {
        toast.success("Password reset link sent to your email.");
        setIsForgotPassword(false);
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isForgotPassword
            ? "Forgot Password"
            : isLogin
            ? "Admin Login"
            : "User Registration"}
        </h1>

        {/* ✅ Forgot Password Form */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer"
              type="submit"
            >
              Send Reset Link
            </button>
            <p
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-center text-blue-600 cursor-pointer mt-4"
            >
              Back to Login
            </p>
          </form>
        ) : (
          /* ✅ Login / Register Form */
          <form onSubmit={onSubmitHandler}>
            {!isLogin && (
              <div className="mb-3 min-w-72">
                <p className="text-sm font-medium text-gray-700 mb-2">Full Name</p>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                type="password"
                placeholder="Enter your password"
                required
              />
              {/* ✅ Forgot Password Link */}
              {isLogin && (
                <p
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-blue-600 mt-2 cursor-pointer text-right"
                >
                  Forgot password?
                </p>
              )}
            </div>

            <button
              className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer"
              type="submit"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
        )}

        {/* Switch between Login and Register */}
        {!isForgotPassword && (
          <p className="text-sm text-center mt-4">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <span
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 cursor-pointer font-medium"
                >
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 cursor-pointer font-medium"
                >
                  Login
                </span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
