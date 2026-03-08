import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdHistory, MdVisibility, MdRefresh } from "react-icons/md";
import { orderAPI } from "../../services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll(); // Fetch all and we will show only relevant ones or filter by status
      const data = response.data;
      if (Array.isArray(data)) {
        // Show Confirmed, Delivered, Cancelled, Rejected in history?
        // Usually history is Confirmed and Delivered.
        const historyData = data.filter((o) =>
          ["Confirmed", "Delivered"].includes(o.status),
        );
        setOrders(historyData);
      } else setOrders([]);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="order-history-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Sales Order History</h1>
          <p className="text-muted">Archives of fulfilled product inquiries</p>
        </div>
        <button
          className="btn btn-light d-flex align-items-center gap-2"
          onClick={fetchHistory}
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
          <div className="p-5 text-center">Loading history...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Customer</th>
                  <th className="py-3 border-0">Product</th>
                  <th className="py-3 border-0">Quantity</th>
                  <th className="py-3 border-0">Ordered On</th>
                  <th className="px-4 py-3 border-0 text-end">Details</th>
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
                      <td className="py-3 border-0">{order.quantity}</td>
                      <td className="py-3 border-0 small">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <button
                          className="btn btn-light btn-sm rounded-circle p-2"
                          onClick={() => navigate(`/sales-orders/${order._id}`)}
                          title="View Details"
                        >
                          <MdVisibility size={18} className="text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No order history found.
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

export default OrderHistory;
