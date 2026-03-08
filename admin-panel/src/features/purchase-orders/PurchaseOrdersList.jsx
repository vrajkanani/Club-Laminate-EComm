import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  MdAdd,
  MdVisibility,
  MdCheckCircle,
  MdLocalShipping,
  MdCancel,
  MdSearch,
  MdRefresh,
  MdDelete,
} from "react-icons/md";
import { purchaseOrderAPI } from "../../services/api";

function PurchaseOrdersList() {
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await purchaseOrderAPI.getAll();
      setPOs(res.data);
    } catch (err) {
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve Purchase Order?",
      text: "This will move the order to 'Approved' status.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      confirmButtonColor: "#28a745",
    });

    if (result.isConfirmed) {
      try {
        await purchaseOrderAPI.approve(id);
        toast.success("Order approved");
        fetchPOs();
      } catch (err) {
        toast.error(err.response?.data?.message || "Approve failed");
      }
    }
  };

  const handleReceive = async (id) => {
    const result = await Swal.fire({
      title: "Receive Items?",
      text: "This will add the items to your inventory and mark the order as 'Received'.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Receive",
      confirmButtonColor: "#17a2b8",
    });

    if (result.isConfirmed) {
      try {
        await purchaseOrderAPI.receive(id);
        toast.success("Inventory updated and marked as received");
        fetchPOs();
      } catch (err) {
        toast.error(err.response?.data?.message || "Receive failed");
      }
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this purchase order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await purchaseOrderAPI.cancel(id);
        toast.success("Order cancelled");
        fetchPOs();
      } catch (err) {
        toast.error(err.response?.data?.message || "Cancel failed");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return "bg-secondary text-white";
      case "approved":
        return "bg-primary text-white";
      case "received":
        return "bg-success text-white";
      case "cancelled":
        return "bg-danger text-white";
      default:
        return "bg-light text-dark";
    }
  };

  const filteredPOs = pos.filter((po) => {
    const matchesStatus =
      filterStatus === "All" ||
      po.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="po-list-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Purchase Orders</h1>
          <p className="text-muted">
            Manage inventory procurement from suppliers
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border shadow-sm px-3 d-flex align-items-center gap-2"
            onClick={fetchPOs}
            style={{ borderRadius: "10px", fontWeight: "600" }}
          >
            <MdRefresh size={20} /> Refresh
          </button>
          <Link
            to="/purchase-orders/new"
            className="btn px-4 py-2 d-flex align-items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            <MdAdd size={20} /> New Purchase Order
          </Link>
        </div>
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
              placeholder="Search POs or Suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            {["All", "Draft", "Approved", "Received", "Cancelled"].map(
              (status) => (
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
              ),
            )}
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading purchase orders...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">PO Number</th>
                  <th className="py-3 border-0">Supplier</th>
                  <th className="py-3 border-0">Order Date</th>
                  <th className="py-3 border-0">Total</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.length > 0 ? (
                  filteredPOs.map((po) => (
                    <tr key={po._id}>
                      <td className="px-4 py-3 border-0 fw-bold">
                        {po.poNumber}
                      </td>
                      <td className="py-3 border-0">
                        {po.supplierId?.name || "Unknown"}
                      </td>
                      <td className="py-3 border-0 text-muted">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 border-0 fw-bold">
                        ₹{po.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge px-3 py-2 ${getStatusBadge(po.status)}`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2 shadow-sm"
                            title="View Details"
                            onClick={() => setSelectedPO(po)}
                          >
                            <MdVisibility size={18} className="text-primary" />
                          </button>

                          {po.status === "draft" && (
                            <button
                              className="btn btn-success-subtle btn-sm p-2 rounded-circle"
                              title="Approve"
                              onClick={() => handleApprove(po._id)}
                            >
                              <MdCheckCircle
                                size={18}
                                className="text-success"
                              />
                            </button>
                          )}

                          {po.status === "approved" && (
                            <button
                              className="btn btn-info-subtle btn-sm p-2 rounded-circle"
                              title="Receive Items"
                              onClick={() => handleReceive(po._id)}
                            >
                              <MdLocalShipping
                                size={18}
                                className="text-info"
                              />
                            </button>
                          )}

                          {(po.status === "draft" ||
                            po.status === "approved") && (
                            <button
                              className="btn btn-danger-subtle btn-sm p-2 rounded-circle"
                              title="Cancel Order"
                              onClick={() => handleCancel(po._id)}
                            >
                              <MdCancel size={18} className="text-danger" />
                            </button>
                          )}

                          {po.status === "cancelled" && (
                            <button
                              className="btn btn-light btn-sm rounded-circle p-2 shadow-sm"
                              title="Delete (Permanent)"
                              onClick={() => {
                                toast.info("Order history preserved.");
                              }}
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
                    <td colSpan="6" className="text-center p-5 text-muted">
                      No purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PO Details Modal */}
      {selectedPO && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow"
              style={{ borderRadius: "20px" }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Purchase Order Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPO(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 text-muted">PO Number</h6>
                    <h4 className="fw-bold mb-0">{selectedPO.poNumber}</h4>
                  </div>
                  <div className="text-end">
                    <span
                      className={`badge px-4 py-2 rounded-pill ${getStatusBadge(selectedPO.status)}`}
                    >
                      {selectedPO.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6 border-end">
                    <h6 className="text-muted mb-2">Supplier Info</h6>
                    <div className="fw-bold fs-5">
                      {selectedPO.supplierId?.name}
                    </div>
                    <div className="text-muted">
                      {selectedPO.supplierId?.email}
                    </div>
                    <div className="text-muted">
                      {selectedPO.supplierId?.phone}
                    </div>
                    <div className="text-muted small mt-1">
                      {selectedPO.supplierId?.address}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Order Info</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Order Date:</span>
                      <span className="fw-bold">
                        {new Date(selectedPO.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Expected Delivery:</span>
                      <span className="fw-bold">
                        {selectedPO.expectedDeliveryDate
                          ? new Date(
                              selectedPO.expectedDeliveryDate,
                            ).toLocaleDateString()
                          : "Not Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="table-responsive bg-light rounded-3 p-2 mb-3">
                  <table className="table table-borderless align-middle mb-0">
                    <thead>
                      <tr className="text-muted small">
                        <th>Product</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items?.map((item, idx) => (
                        <tr key={idx} className="border-bottom border-white">
                          <td className="fw-bold">
                            {item.productId?.name || "Product"}
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            ₹{item.purchasePrice?.toLocaleString()}
                          </td>
                          <td className="text-end fw-bold">
                            ₹
                            {(
                              item.quantity * item.purchasePrice
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end pt-3 border-top">
                  <div className="text-end">
                    <h6 className="text-muted mb-0">Grand Total</h6>
                    <h3 className="fw-bold text-primary mb-0">
                      ₹{selectedPO.totalAmount?.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  type="button"
                  className="btn btn-dark w-100 py-3"
                  style={{ borderRadius: "12px", fontWeight: "600" }}
                  onClick={() => setSelectedPO(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrdersList;
