import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdCheck, MdClose, MdRefresh } from "react-icons/md";
import { orderAPI } from "../../services/api";

function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getPending();
      const data = response.data;
      if (Array.isArray(data)) setOrders(data);
      else setOrders([]);
    } catch (error) {
      toast.error("Failed to fetch pending orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Cancel It",
    });

    if (result.isConfirmed) {
      try {
        await orderAPI.deletePending(orderId);
        setOrders(orders.filter((order) => order._id !== orderId));
        toast.success("Order has been removed.");
      } catch (error) {
        toast.error("Failed to cancel order.");
      }
    }
  };

  const handleComplete = async (order) => {
    const result = await Swal.fire({
      title: "Complete Order?",
      text: `Mark order for ${order.fullName} as completed?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#43e97b",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Complete It",
    });

    if (result.isConfirmed) {
      try {
        await orderAPI.confirm(order._id);
        setOrders((prevOrders) =>
          prevOrders.filter((o) => o._id !== order._id),
        );
        toast.success("The order has been moved to history.");
      } catch (error) {
        toast.error("Error fulfilling order.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="pending-orders-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Pending Sales Orders</h1>
          <p className="text-muted">
            Review and fulfill incoming customer inquiries
          </p>
        </div>
        <button
          className="btn btn-light d-flex align-items-center gap-2"
          onClick={fetchOrders}
          style={{ borderRadius: "10px" }}
        >
          <MdRefresh /> Refresh
        </button>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading orders...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Customer</th>
                  <th className="py-3 border-0">Product</th>
                  <th className="py-3 border-0">Quantity</th>
                  <th className="py-3 border-0">Location</th>
                  <th className="py-3 border-0">Date</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 border-0">
                        <div className="fw-bold">{order.fullName}</div>
                        <div className="small text-muted">{order.mobileNo}</div>
                      </td>
                      <td className="py-3 border-0">{order.productName}</td>
                      <td className="py-3 border-0 text-center">
                        {order.quantity}
                      </td>
                      <td className="py-3 border-0">
                        <div
                          className="small text-truncate"
                          style={{ maxWidth: "150px" }}
                        >
                          {order.city}, {order.state}
                        </div>
                      </td>
                      <td className="py-3 border-0 small">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-success btn-sm rounded-circle p-2"
                            onClick={() => handleComplete(order)}
                            title="Complete"
                          >
                            <MdCheck size={18} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-circle p-2"
                            onClick={() => handleCancel(order._id)}
                            title="Cancel"
                          >
                            <MdClose size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-5 text-muted">
                      No pending orders. All caught up!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingOrders;
