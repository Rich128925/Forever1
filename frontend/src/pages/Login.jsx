import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { backendUrl, setToken } = useContext(ShopContext); // Access backendUrl & setToken
  const navigate = useNavigate();

  const [currentState, setCurrentState] = useState("Sign Up"); // Sign Up or Login
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form submission handler
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const endpoint = currentState === "Sign Up" ? "/register" : "/login";
      const payload =
        currentState === "Sign Up"
          ? { name, email, password }
          : { email, password };

      const response = await axios.post(
        `${backendUrl}/api/user${endpoint}`,
        payload
      );

      if (response.data.success) {
        toast.success(`${currentState} successful!`);

        // Save token in context + localStorage for persistent login
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);

        // Redirect to home page
        navigate("/");
      } else {
        toast.error(response.data.message || `${currentState} failed`);
      }
    } catch (error) {
      console.error("❌ Auth Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%]sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Name input only for Sign Up */}
      {currentState === "Sign Up" && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-1/3 px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-1/3 px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-1/3 px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />

      <div className="w-1/3 flex justify-between text-sm mt-[-8px]">
  <p
    className="cursor-pointer text-blue-600"
    onClick={() => navigate("/forgot-password")}
  >
    Forgot your password?
  </p>

  {currentState === "Login" ? (
    <p
      onClick={() => setCurrentState("Sign Up")}
      className="cursor-pointer"
    >
      Create Account
    </p>
  ) : (
    <p
      onClick={() => setCurrentState("Login")}
      className="cursor-pointer"
    >
      Login Here
    </p>
  )}
</div>


      <button className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
      
    </form>
  );
};

export default Login;
