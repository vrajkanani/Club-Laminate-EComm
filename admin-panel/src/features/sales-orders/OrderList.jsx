import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  MdCheckCircle,
  MdCancel,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdLocalShipping,
} from "react-icons/md";
import { orderAPI } from "../../services/api";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const result = await Swal.fire({
      title: `Mark as ${status}?`,
      text: `Are you sure you want to mark this order as ${status.toLowerCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor:
        status === "Delivered"
          ? "#0d6efd"
          : status === "Confirmed"
            ? "#198754"
            : "#ffc107",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${status}`,
    });

    if (!result.isConfirmed) return;

    try {
      await orderAPI.updateStatus(id, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete It",
    });

    if (!result.isConfirmed) return;

    try {
      await orderAPI.delete(id);
      toast.success("Order deleted");
      fetchOrders();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;
    const matchesSearch =
      order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNo?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Confirmed":
        return "bg-success text-white";
      case "Rejected":
        return "bg-danger text-white";
      case "Cancelled":
        return "bg-secondary text-white";
      case "Delivered":
        return "bg-primary text-white";
      default:
        return "bg-light text-dark";
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-success text-white";
      case "Pending":
        return "bg-warning text-dark";
      case "Failed":
        return "bg-danger text-white";
      default:
        return "bg-light text-dark";
    }
  };

  return (
    <div className="orders-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Order Management</h1>
          <p className="text-muted">Track and manage customer orders</p>
        </div>
        <button
          className="btn btn-light border shadow-sm px-3"
          onClick={fetchOrders}
          style={{ borderRadius: "10px" }}
        >
          Refresh
        </button>
      </div>

      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text bg-white border-end-0">
              <MdSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            {[
              "All",
              "Pending",
              "Confirmed",
              "Delivered",
              "Rejected",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                className={`btn px-3 ${
                  filterStatus === status ? "btn-dark" : "btn-light border"
                }`}
                onClick={() => setFilterStatus(status)}
                style={{ borderRadius: "10px", fontWeight: "600" }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="text-center p-5">Loading orders...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Date</th>
                  <th className="py-3 border-0">Customer</th>
                  <th className="py-3 border-0">Product</th>
                  <th className="py-3 border-0">Qty</th>
                  <th className="py-3 border-0">Location</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0">Payment</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 border-0">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 border-0">
                        <div className="fw-bold">{order.fullName}</div>
                        <div className="small text-muted">{order.mobileNo}</div>
                      </td>
                      <td className="py-3 border-0">{order.productName}</td>
                      <td className="py-3 border-0">{order.quantity}</td>
                      <td className="py-3 border-0">
                        {order.city}, {order.state}
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${getStatusBadge(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${getPaymentBadge(order.paymentStatus || "Pending")}`}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2 shadow-sm"
                            title="View Details"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <MdVisibility size={18} className="text-primary" />
                          </button>

                          {order.status === "Pending" && (
                            <>
                              <button
                                className="btn btn-success-subtle btn-sm p-2 rounded-circle"
                                title="Confirm"
                                onClick={() =>
                                  handleStatusUpdate(order._id, "Confirmed")
                                }
                              >
                                <MdCheckCircle
                                  size={18}
                                  className="text-success"
                                />
                              </button>
                              <button
                                className="btn btn-danger-subtle btn-sm p-2 rounded-circle"
                                title="Reject"
                                onClick={() =>
                                  handleStatusUpdate(order._id, "Rejected")
                                }
                              >
                                <MdCancel size={18} className="text-danger" />
                              </button>
                            </>
                          )}

                          {order.status === "Confirmed" && (
                            <>
                              <button
                                className="btn btn-primary-subtle btn-sm p-2 rounded-circle border-0"
                                title="Mark as Delivered"
                                onClick={() =>
                                  handleStatusUpdate(order._id, "Delivered")
                                }
                              >
                                <MdLocalShipping
                                  size={18}
                                  className="text-primary"
                                />
                              </button>
                              <button
                                className="btn btn-warning-subtle btn-sm p-2 rounded-circle border-0"
                                title="Cancel"
                                onClick={() =>
                                  handleStatusUpdate(order._id, "Cancelled")
                                }
                              >
                                <MdCancel size={18} className="text-warning" />
                              </button>
                            </>
                          )}

                          {(order.status === "Rejected" ||
                            order.status === "Cancelled") && (
                            <button
                              className="btn btn-light btn-sm rounded-circle p-2 shadow-sm"
                              onClick={() => handleDelete(order._id)}
                              title="Delete"
                            >
                              <MdDelete size={18} className="text-danger" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-5 text-muted">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow"
              style={{ borderRadius: "20px" }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Order Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <span
                    className={`badge ${getStatusBadge(selectedOrder.status)} px-3 py-2 rounded-pill`}
                  >
                    {selectedOrder.status}
                  </span>
                  <span className="text-muted small">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="small text-muted d-block">Customer</label>
                    <div className="fw-bold">{selectedOrder.fullName}</div>
                    <div className="small text-muted">
                      {selectedOrder.mobileNo}
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <label className="small text-muted d-block">Location</label>
                    <div className="fw-bold">{selectedOrder.city}</div>
                    <div className="small text-muted">
                      {selectedOrder.state}, {selectedOrder.pincode}
                    </div>
                  </div>
                  <div className="col-12 border-top pt-3">
                    <label className="small text-muted d-block">
                      Product Details
                    </label>
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">
                        {selectedOrder.productName} × {selectedOrder.quantity}
                      </span>
                      <span className="fw-bold">
                        ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="small text-muted">
                      Price per unit: ₹
                      {(
                        selectedOrder.totalAmount / selectedOrder.quantity || 0
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-12 border-top pt-3">
                    <label className="small text-muted d-block">
                      Shipping Address
                    </label>
                    <div className="small">{selectedOrder.address}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-dark w-100 py-2"
                  style={{ borderRadius: "10px" }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderList;
