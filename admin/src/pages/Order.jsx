import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);

  // 🧩 Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log("All orders:", response.data.orders);
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⚙️ Handle order status change
  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;

      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Order status updated!");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">All Orders</h3>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.5fr_2fr_1fr_1fr] gap-5 items-start border-2 border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition"
            >
              {/* Order header */}
              <div className="flex items-center gap-3">
                <img
                  src={assets.parcel_icon}
                  alt="Order parcel"
                  className="w-10 h-10"
                />
                <h4 className="font-semibold text-lg">Order #{index + 1}</h4>
              </div>

              {/* Ordered items */}
              <div>
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-gray-700">
                    {item.name} x {item.quantity}{" "}
                    <span className="text-sm text-gray-500">({item.size})</span>
                  </p>
                ))}
              </div>

              {/* Order details */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Amount:</strong> {currency} {order.amount}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.payment ? "Done" : "Pending"} via{" "}
                  {order.paymentMethod.toUpperCase()}
                </p>
                <p>
                  <strong>Items:</strong> {order.items.length}
                </p>
              </div>

              {/* Customer & Address */}
              {order.address && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {order.address.street}, {order.address.city},{" "}
                    {order.address.state}, {order.address.country},{" "}
                    {order.address.zipcode}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.address.phone}
                  </p>
                </div>
              )}

              {/* Status dropdown */}
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Order Status:
                </label>
                <select
                  defaultValue={order.status || "Order Placed"}
                  onChange={(event) => statusHandler(event, order._id)}    
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer hover:border-gray-400"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Order;
