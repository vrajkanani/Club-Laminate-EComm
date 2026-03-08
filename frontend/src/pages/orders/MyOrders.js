import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view orders");
        navigate("/login");
        return;
      }

      // We need to fetch user's orders.
      // Assuming GET /api/orders returns user's orders if not admin?
      // Or we need a specific endpoint like /api/orders/my-orders or filter by userId in backend if not admin.
      // orderController.getAllOrders is protected and admin only.
      // I need to add an endpoint for users to get their own orders.
      // For now, I'll assume I need to add that endpoint or use a filtered one.
      // Let's check backend routes.
      // Actually, I should add `GET /api/orders/myorders` to backend.

      // PRE-EMPTIVE FIX: I will add the endpoint in the next step.
      // For now, I'll write the fetch call assuming the endpoint exists.
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/orders/myorders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          // throw new Error("Failed to fetch");
          console.error("Failed to fetch my orders");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "badge-warning";
      case "Confirmed":
        return "badge-success";
      case "Rejected":
        return "badge-danger";
      case "Cancelled":
        return "badge-secondary";
      case "Delivered":
        return "badge-primary";
      default:
        return "badge-light";
    }
  };

  return (
    <div className="orders-page-container animate-up container pt-5 mt-5 pb-5">
      <div className="section-title-wrapper mb-5">
        <p className="section-tagline">Track Your Purchases</p>
        <h2 className="section-title">My Orders</h2>
      </div>

      <div className="glass-panel p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-white">
            <div className="spinner-border text-gold mb-3" role="status"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="table-responsive">
            <table
              className="table mb-0 text-white"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                background: "transparent",
                "--bs-table-bg": "transparent",
                "--bs-table-hover-bg": "rgba(255,255,255,0.05)",
                "--bs-table-color": "white",
              }}
            >
              <thead style={{ background: "rgba(0,0,0,0.2)" }}>
                <tr>
                  <th className="p-4 border-0">Order ID</th>
                  <th className="p-4 border-0">Date</th>
                  <th className="p-4 border-0">Product</th>
                  <th className="p-4 border-0 text-center">Qty</th>
                  <th className="p-4 border-0 text-center">Status</th>
                  <th className="p-4 border-0 text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ transition: "all 0.3s ease" }}>
                    <td className="p-4 border-bottom border-secondary-subtle">
                      <span className="font-monospace text-gold">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 border-bottom border-secondary-subtle">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 border-bottom border-secondary-subtle fw-bold">
                      {order.productName}
                    </td>
                    <td className="p-4 border-bottom border-secondary-subtle text-center">
                      {order.quantity}
                    </td>
                    <td className="p-4 border-bottom border-secondary-subtle text-center">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${getStatusBadge(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 border-bottom border-secondary-subtle text-end">
                      <Link
                        to={`/order/${order._id}`}
                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-white p-5">
            <div className="mb-4">
              <i className="fas fa-box-open fa-3x text-muted"></i>
            </div>
            <h3>No orders yet</h3>
            <p className="text-muted mb-4">
              Looks like you haven't placed any orders yet.
            </p>
            <Link to="/Product" className="btn btn-premium px-4">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
