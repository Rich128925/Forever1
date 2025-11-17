import React, { useState, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(""); // JWT token
  const navigate = useNavigate();

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // Keep cart in sync with localStorage
  useEffect(() => {
    if (Object.keys(cartItems).length === 0) {
      localStorage.removeItem("cartItems");
    } else {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Fetch cart from backend on login
  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (!token) return;

      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.cartData) setCartItems(res.data.cartData);
      } catch (error) {
        console.error("Failed to fetch cart:", error.response?.data || error.message);
      }
    };

    fetchCartFromServer();
  }, [token]);

  // ✅ Add to Cart
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    const updatedCart = { ...cartItems };
    if (updatedCart[itemId]) {
      updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + 1;
    } else {
      updatedCart[itemId] = { [size]: 1 };
    }
    setCartItems(updatedCart);

    if (!token) {
      toast.error("You must log in first");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) toast.success("Added to cart");
      else toast.error(response.data.message || "Failed to add to cart");
    } catch (error) {
      console.error("Error saving cart:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to sync cart with server");
    }
  };

  // ✅ Update Quantity
  const updateQuantity = async (itemId, size, quantity) => {
    const updatedCart = structuredClone(cartItems);
    if (!updatedCart[itemId]) updatedCart[itemId] = {};
    updatedCart[itemId][size] = quantity;
    setCartItems(updatedCart);

    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Cart updated on server:", response.data);
    } catch (error) {
      console.error("Failed to update cart on server:", error);
      toast.error("Failed to sync cart with server");
    }
  };

  // ✅ Remove Item from Cart
  const removeFromCart = async (itemId, size) => {
    const updatedCart = { ...cartItems };
    if (updatedCart[itemId] && updatedCart[itemId][size]) {
      delete updatedCart[itemId][size];
      if (Object.keys(updatedCart[itemId]).length === 0) {
        delete updatedCart[itemId];
      }
      setCartItems(updatedCart);
    }

    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item from server:", error);
      toast.error("Failed to update cart on server");
    }
  };

  // ✅ Clear Cart
  const clearCart = async () => {
    setCartItems({});
    localStorage.removeItem("cartItems");

    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) toast.success("Cart cleared 🧹");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart on server");
    }
  };

  // ✅ Utility functions
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        totalCount += cartItems[itemId][size] || 0;
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;
      for (const size in cartItems[productId]) {
        totalAmount += product.price * cartItems[productId][size];
      }
    }
    return totalAmount;
  };

  const getTotalWithDelivery = () => {
    const subtotal = getCartAmount();
    return subtotal > 100 ? subtotal : subtotal + delivery_fee;
  };

  // ✅ Fetch products
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) setProducts(response.data.products);
      else toast.warn("No products found.");
    } catch (error) {
      console.error("Error loading products:", error.message);
      if (!products.length) toast.error("Failed to load products. Check your backend.");
    }
  };

  const logout = () => {
  setToken(""); 
  setCartItems({});
  localStorage.removeItem("token");
  toast.success("Logged out successfully");
};

  useEffect(() => {
    getProductsData();
  }, []);

  
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartAmount,
    getTotalWithDelivery,
    navigate,
    backendUrl,
    token,
    setToken,
    setCartItems,
    logout
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
