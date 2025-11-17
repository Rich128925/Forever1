// frontend/src/pages/VerifyOtp.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // from the forgot password page

  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email,
        otp,
      });

      if (res.data.success) {
        toast.success("OTP verified successfully!");
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    }
  };

  return (
    <form
      onSubmit={handleVerify}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Verify OTP</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-1/3 px-3 py-2 border border-gray-800"
        placeholder="Enter OTP"
        required
      />

      <button className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer">
        Verify OTP
      </button>
    </form>
  );
};

export default VerifyOtp;
