import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        password,
      });

      if (res.data.success) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <form
      onSubmit={handleReset}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-1/3 px-3 py-2 border border-gray-800"
        placeholder="Enter new password"
        required
      />

      <button className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer">
        Reset Password
      </button>
    </form>
  );
};

export default ResetPassword;
