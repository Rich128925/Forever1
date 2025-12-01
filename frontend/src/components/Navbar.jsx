import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const Navbar1 = () => {
  const [visible, setVisible] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    setShowSearch,
    getCartCount,
    token,
    setToken,
    setCartItems,
    backendUrl,
  } = useContext(ShopContext);

  const linkRefs = useRef({});
  const [underlineStyle, setUnderlineStyle] = useState({});

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
  }, [visible]);

  // Update underline position on route change
  useEffect(() => {
    const activeLink = linkRefs.current[location.pathname];
    if (activeLink) {
      setUnderlineStyle({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    }
  }, [location, visible]);

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

  return (
    <div className="flex items-center justify-between py-5 font-medium relative">

      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src={assets.logo} className="w-36 cursor-pointer" alt="Logo" />
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex gap-5 text-sm relative">
        {["/", "/collection", "/about", "/contact"].map((path) => (
          <NavLink
            key={path}
            to={path}
            ref={(el) => (linkRefs.current[path] = el)}
            className={({ isActive }) =>
              `relative px-1 ${
                isActive ? "font-bold text-black" : "text-gray-700 hover:text-black"
              }`
            }
          >
            {path === "/" ? "HOME" : path.slice(1).toUpperCase()}
          </NavLink>
        ))}

        {/* Sliding underline */}
        <span
          className="absolute bottom-0 h-[2px] bg-black rounded-full transition-all duration-300"
          style={underlineStyle}
        />
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* Profile Dropdown */}
        <div className="relative">
          <img
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="Profile"
            onClick={() => setOpenProfile((prev) => !prev)}
          />

          {openProfile && (
            <div className="absolute right-0 top-8 z-50">
              <div className="flex flex-col gap-2 w-36 py-3 px-4 bg-slate-100 text-gray-600 rounded shadow-lg">
                {token ? (
                  <>
                    <Link to="/profile" onClick={() => setOpenProfile(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setOpenProfile(false)}>
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
                  <Link to="/login" onClick={() => setOpenProfile(false)}>
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
          <p className="absolute -right-1 -bottom-1 w-4 text-center leading-4 bg-black text-white rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Animated Hamburger */}
        <button
          onClick={() => setVisible(!visible)}
          className="sm:hidden flex flex-col gap-1.5 z-[1001]"
        >
          <span
            className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
              visible ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
              visible ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
              visible ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Dark Overlay */}
      {visible && (
        <div
          onClick={() => setVisible(false)}
          className="fixed inset-0 bg-black/40 z-[999] sm:hidden"
        />
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[75%] bg-white z-[1000]
          transition-transform duration-300 ease-in-out
          ${visible ? "translate-x-0" : "translate-x-full"}
          sm:hidden
        `}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-lg font-medium">
          {["/", "/collection", "/about", "/contact"].map((path) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setVisible(false)}
              className={({ isActive }) =>
                `px-2 ${
                  isActive ? "font-bold text-black" : "text-gray-700 hover:text-black"
                }`
              }
            >
              {path === "/" ? "HOME" : path.slice(1).toUpperCase()}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar1;
