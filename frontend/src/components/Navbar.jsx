import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { setShowSearch, getCartCount, token, setToken, setCartItems, backendUrl } = useContext(ShopContext);

  const logout = async () => {
    try {
      // Optional logout API call
      if (backendUrl && token) {
        await axios.post(`${backendUrl}/api/user/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      
      setToken('');
      localStorage.removeItem('token');
      setCartItems({});
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Active link styling
  const activeLink = ({ isActive }) =>
    `flex flex-col items-center gap-1 ${isActive ? 'text-black font-bold' : 'text-gray-700'}`;

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      
      {/* Logo navigates to Home */}
      <Link to='/' className='flex items-center'>
        <img src={assets.logo} className='w-36 cursor-pointer' alt="Logo" />
      </Link>

      {/* Desktop Menu */}
      <ul className='hidden sm:flex gap-5 text-sm'>
        <NavLink to='/' className={activeLink}><p>HOME</p></NavLink>
        <NavLink to='/collection' className={activeLink}><p>COLLECTION</p></NavLink>
        <NavLink to='/about' className={activeLink}><p>ABOUT</p></NavLink>
        <NavLink to='/contact' className={activeLink}><p>CONTACT</p></NavLink>
      </ul>

      {/* Icons and Dropdown */}
      <div className='flex items-center gap-6'>
        <img onClick={() => setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt="Search" />

        {/* Profile Dropdown */}
        <div className='relative group'>
          <img className='w-5 cursor-pointer' src={assets.profile_icon} alt="Profile" />
          {token ? (
            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
              <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                <Link to='/profile' className='cursor-pointer hover:text-black'>My Profile</Link>
                <Link to='/orders' className='cursor-pointer hover:text-black'>Orders</Link>
                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>
          ) : (
            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
              <Link to='/login' className='cursor-pointer hover:text-black px-4 py-2 bg-slate-100 rounded'>Login</Link>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
          <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
            {getCartCount()}
          </p>
        </Link>

        {/* Mobile Menu Icon */}
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="Menu" />
      </div>

      {/* Mobile Sidebar Menu */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} to='/' className={activeLink}>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} to='/collection' className={activeLink}>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} to='/about' className={activeLink}>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} to='/contact' className={activeLink}>CONTACT</NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
