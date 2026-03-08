import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { MdKeyboardBackspace, MdPrint } from "react-icons/md";
import { orderAPI } from "../../services/api";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await orderAPI.getConfirmedById(id);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="p-5 text-center">Loading details...</div>;
  if (!order) return <div className="p-5 text-center">Order not found.</div>;

  return (
    <div className="order-details-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link
            to="/sales-orders/history"
            className="text-decoration-none text-muted small d-flex align-items-center gap-1 mb-2"
          >
            <MdKeyboardBackspace /> Back to History
          </Link>
          <h1>Order # {order._id.slice(-6).toUpperCase()}</h1>
        </div>
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => window.print()}
        >
          <MdPrint /> Print Invoice
        </button>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div
            className="card shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Customer Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row mb-3">
                <div className="col-sm-4 text-muted">Full Name</div>
                <div className="col-sm-8 fw-bold">{order.fullName}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 text-muted">Mobile Number</div>
                <div className="col-sm-8">{order.mobileNo}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 text-muted">Address</div>
                <div className="col-sm-8">{order.address}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 text-muted">Location</div>
                <div className="col-sm-8">
                  {order.city}, {order.state}, {order.pincode}
                </div>
              </div>
            </div>
          </div>

          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Product Details</h5>
            </div>
            <div className="card-body p-4">
              <table className="table table-borderless">
                <thead>
                  <tr className="border-bottom">
                    <th>Product Name</th>
                    <th className="text-end">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3">
                      <div className="fw-bold">
                        {order.productName || "Standard Laminate"}
                      </div>
                      <div className="small text-muted">
                        Laminate Collection
                      </div>
                    </td>
                    <td className="py-3 text-end fw-bold">
                      {order.quantity} Units
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card shadow-sm border-0 mb-4"
            style={{
              borderRadius: "15px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <div className="card-body p-4">
              <div className="small opacity-75 mb-1">Status</div>
              <h4 className="fw-bold mb-4">{order.status}</h4>
              <div className="small opacity-75 mb-1">Payment Status</div>
              <h4 className="fw-bold mb-4">
                {order.paymentStatus || "Pending"}
              </h4>
              <div className="small opacity-75 mb-1">Order Date</div>
              <div className="fw-bold mb-4">{formatDate(order.orderDate)}</div>
              {order.status === "Confirmed" && (
                <button
                  className="btn btn-light w-100 py-2 mb-4"
                  style={{ borderRadius: "10px", fontWeight: "600" }}
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Mark as Delivered?",
                      text: "Are you sure you want to mark this order as delivered?",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonColor: "#0d6efd",
                      cancelButtonColor: "#6c757d",
                      confirmButtonText: "Yes, Delivered",
                    });

                    if (result.isConfirmed) {
                      try {
                        await orderAPI.updateStatus(order._id, "Delivered");
                        setOrder({ ...order, status: "Delivered" });
                        Swal.fire({
                          title: "Delivered!",
                          text: "Order has been marked as delivered.",
                          icon: "success",
                          timer: 2000,
                          showConfirmButton: false,
                        });
                      } catch (err) {
                        Swal.fire("Error", "Update failed", "error");
                      }
                    }
                  }}
                >
                  Mark as Delivered
                </button>
              )}
              {order.paymentDate && (
                <>
                  <div className="small opacity-75 mb-1">Payment Date</div>
                  <div className="fw-bold mb-4">
                    {formatDate(order.paymentDate)}
                  </div>
                </>
              )}
              <div className="small opacity-75 mb-1">Processed At</div>
              <div className="fw-bold">{formatDate(order.createdAt)}</div>
            </div>
          </div>

          <div
            className="card shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Internal Notes</h5>
              <p className="small text-muted mb-0">
                This order was processed and confirmed by the administration
                system on {formatDate(order.createdAt)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
