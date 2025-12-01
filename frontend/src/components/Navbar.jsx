import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [openProfile, setOpenProfile] = useState(false); // ✅ FIXED DROPDOWN
  const navigate = useNavigate();

  const {
    setShowSearch,
    getCartCount,
    token,
    setToken,
    setCartItems,
    backendUrl,
  } = useContext(ShopContext);

  const logout = async () => {
    try {
      if (backendUrl && token) {
        await axios.post(
          `${backendUrl}/api/user/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setToken("");
      localStorage.removeItem("token");
      setCartItems({});
      setOpenProfile(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const activeLink = ({ isActive }) =>
    `flex flex-col items-center gap-1 ${
      isActive ? "text-black font-bold" : "text-gray-700"
    }`;

  return (
    <div className="flex items-center justify-between py-5 font-medium relative">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src={assets.logo} className="w-36 cursor-pointer" alt="Logo" />
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex gap-5 text-sm">
        <NavLink to="/" className={activeLink}>
          <p>HOME</p>
        </NavLink>
        <NavLink to="/collection" className={activeLink}>
          <p>COLLECTION</p>
        </NavLink>
        <NavLink to="/about" className={activeLink}>
          <p>ABOUT</p>
        </NavLink>
        <NavLink to="/contact" className={activeLink}>
          <p>CONTACT</p>
        </NavLink>
      </ul>

      {/* Icons */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* FIXED PROFILE DROPDOWN */}
        <div className="relative">
          <img
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="Profile"
            onClick={() => setOpenProfile((prev) => !prev)}
          />

          {openProfile && (
            <div
              className="
                absolute z-50 pt-4
                right-0 sm:right-0
                left-1/2 sm:left-auto
                -translate-x-1/2 sm:translate-x-0
                top-6
              "
            >
              <div
                className="
                  flex flex-col gap-2
                  w-[90vw] sm:w-36
                  max-w-xs
                  py-3 px-5
                  bg-slate-100 text-gray-600
                  rounded shadow-lg
                  text-center sm:text-left
                "
              >
                {token ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setOpenProfile(false)}
                      className="hover:text-black"
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setOpenProfile(false)}
                      className="hover:text-black"
                    >
                      Orders
                    </Link>

                    <p
                      onClick={logout}
                      className="cursor-pointer hover:text-black"
                    >
                      Logout
                    </p>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpenProfile(false)}
                    className="
                      hover:text-black
                      cursor-pointer
                    "
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-50 ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>

          <NavLink
            onClick={() => setVisible(false)}
            to="/"
            className={activeLink}
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/collection"
            className={activeLink}
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/about"
            className={activeLink}
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/contact"
            className={activeLink}
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
