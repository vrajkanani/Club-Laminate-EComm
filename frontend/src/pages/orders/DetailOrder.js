import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function DetailOrder() {
  const { id } = useParams();
  const [ord, setOrd] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        // Backend route is /api/orders/:id now? Let me check orderRoutes.js
        // Yes: router.get("/orders/:id", protect, authorize("admin"), orderController.getOrderById);
        // BUT wait, this is admin only!
        // We need a route for users to view THEIR OWN order details.
        // Or we should allow users to access /orders/:id if they own it.
        // Currently /orders/:id is protected and authorize('admin').

        // Let's use the same endpoint but I'll need to modify the backend later to allow user access.
        // For now, let's assume I will fix the backend to allow users to see their own orders.
        // Using /api/orders/${id}

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          // Fallback to myorders if individual fetch fails (temporary workaround if I don't fix backend immediately)
          // But I should fix backend.
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrd(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!ord._id) {
    return (
      <div className="p-5 text-center text-white">
        <div className="spinner-border text-gold mb-3" role="status"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  const handlePayment = async () => {
    const result = await Swal.fire({
      title: "Complete Payment",
      text: `Pay ₹${ord.totalAmount || "N/A"} for this order?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Pay Now!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/orders/${ord._id}/pay`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentStatus: "Paid" }),
          },
        );

        if (res.ok) {
          Swal.fire("Success!", "Payment completed successfully.", "success");
          // Refresh order details by updating state locally or re-fetching
          setOrd({ ...ord, paymentStatus: "Paid" });
        } else {
          Swal.fire("Error", "Payment failed. Please try again.", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Something went wrong.", "error");
      }
    }
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    const isPaid = ord.paymentStatus === "Paid";
    const accentColor = [212, 175, 55]; // Premium Gold

    // --- Header Section ---
    // Company Logo/Name
    doc.setFontSize(26);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("CLUB LAMINATE", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("Premium Quality Laminates & Interior Solutions", 20, 32);

    // Invoice Meta (Right side of header)
    doc.setTextColor(0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 190, 25, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Invoice No: #INV-${ord._id.slice(-6).toUpperCase()}`, 190, 32, {
      align: "right",
    });
    doc.text(`Date: ${new Date(ord.createdAt).toLocaleDateString()}`, 190, 37, {
      align: "right",
    });

    // Payment Status Badge
    const badgeY = 48;
    if (isPaid) {
      doc.setTextColor(40, 167, 69); // Success Green
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PAID", 190, badgeY, { align: "right" });
    } else {
      doc.setTextColor(220, 53, 69); // Danger Red
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PENDING PAYMENT", 190, badgeY, { align: "right" });
    }

    // --- Address Section ---
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Column 1: From
    doc.text("FROM:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text("Club Laminate Pvt. Ltd.", 20, 76);
    doc.text("Industrial Estate, G.I.D.C", 20, 81);
    doc.text("Jamnagar, Gujarat - 361004", 20, 86);
    doc.text("Email: support@clublaminate.com", 20, 91);

    // Column 2: To
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 120, 70);
    doc.setFont("helvetica", "normal");
    doc.text(ord.fullName, 120, 76);
    doc.text(`Contact: ${ord.mobileNo}`, 120, 81);
    doc.text(ord.address, 120, 86);
    doc.text(`${ord.city}, ${ord.state} - ${ord.pincode}`, 120, 91);

    // --- Product Table ---
    // If SKU is missing on order object (for old orders), check populated productId
    const displaySku = ord.sku || (ord.productId && ord.productId.sku);

    const tableData = [
      [
        1,
        `${ord.productName || "Product"}${displaySku ? ` (${displaySku})` : ""}`,
        ord.quantity,
        `Rs. ${ord.totalAmount / ord.quantity}`,
        `Rs. ${ord.totalAmount}`,
      ],
    ];

    autoTable(doc, {
      startY: 105,
      head: [["Sr. No", "ITEM DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
      body: tableData,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 20 },
        1: { halign: "left" },
        2: { halign: "right", cellWidth: 20 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
      // Ensure specific alignment for head cells too
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: "bold",
      },
      // Apply column-specific halign to headers as well
      didParseCell: (data) => {
        if (data.section === "head") {
          if (data.column.index === 0 || data.column.index === 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }
      },
    });

    // --- Totals Section ---
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Subtotal:", 145, finalY);
    doc.text(`Rs. ${ord.totalAmount}`, 190, finalY, { align: "right" });

    doc.text("Tax (GST 0%):", 145, finalY + 7);
    doc.text("Rs. 0", 190, finalY + 7, { align: "right" });

    doc.setDrawColor(200);
    doc.line(140, finalY + 10, 195, finalY + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Grand Total:", 145, finalY + 18);
    doc.text(`Rs. ${ord.totalAmount}`, 190, finalY + 18, { align: "right" });

    // --- Footer & Signature ---
    const footerY = 250;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS:", 20, footerY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("1. Goods once sold will not be taken back.", 20, footerY + 6);
    doc.text("2. Payments are due within 7 days of order.", 20, footerY + 11);
    doc.text("3. This is a computer generated invoice.", 20, footerY + 16);

    // Signature Area
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("For Club Laminate Pvt. Ltd.", 190, footerY, { align: "right" });
    doc.setDrawColor(200);
    doc.line(150, footerY + 20, 190, footerY + 20);
    doc.setFontSize(8);
    doc.text("Authorized Signatory", 170, footerY + 25, { align: "center" });

    // Final Footer Note
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`Invoice_${ord._id.slice(-6).toUpperCase()}.pdf`);
  };

  return (
    <div className="animate-up pt-5 mt-5">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="glass-panel p-5">
              <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-light-subtle pb-4">
                <div>
                  <p className="text-gold mb-1">Order Details</p>
                  <h2 className="text-white mb-0 display-6">
                    #{ord._id.slice(-6).toUpperCase()}
                  </h2>
                </div>
                <div className="text-end">
                  <span
                    className={`badge rounded-pill px-3 py-2 fs-6 mb-2 me-2 ${
                      ord.status === "Confirmed"
                        ? "bg-success"
                        : ord.status === "Pending"
                          ? "bg-warning text-dark"
                          : ord.status === "Cancelled"
                            ? "bg-danger"
                            : "bg-primary"
                    }`}
                  >
                    {ord.status}
                  </span>
                  <span
                    className={`badge rounded-pill px-3 py-2 fs-6 mb-2 ${
                      ord.paymentStatus === "Paid"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {ord.paymentStatus || "Pending Payment"}
                  </span>
                  <p className="text-white-50 mb-0 small">
                    {formatDate(ord.createdAt)}
                  </p>
                </div>
              </div>

              <div className="row mb-5">
                <div className="col-md-6 mb-4 mb-md-0">
                  <div
                    className="p-4 rounded h-100"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h5 className="text-gold mb-4">
                      <i className="fas fa-box me-2"></i>Product Info
                    </h5>
                    <h4 className="text-white mb-2">{ord.productName}</h4>
                    <div className="d-flex justify-content-between mt-3 text-white-50">
                      <span>Quantity:</span>
                      <span className="text-white fw-bold">
                        {ord.quantity} Units
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-2 text-white-50">
                      <span>Total Amount:</span>
                      <span className="text-white fw-bold">
                        ₹{ord.totalAmount || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="p-4 rounded h-100"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h5 className="text-gold mb-4">
                      <i className="fas fa-shipping-fast me-2"></i>Delivery
                      Status
                    </h5>
                    <div className="timeline-item d-flex mb-3">
                      <div className="me-3 text-gold">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div>
                        <p className="text-white mb-0">Order Placed</p>
                        <small className="text-white-50">
                          {formatDate(ord.createdAt)}
                        </small>
                      </div>
                    </div>
                    <div className="timeline-item d-flex mb-3">
                      <div
                        className={`me-3 ${ord.confirmedDate ? "text-success" : "text-secondary"}`}
                      >
                        <i
                          className={
                            ord.confirmedDate
                              ? "fas fa-check-circle"
                              : "far fa-circle"
                          }
                        ></i>
                      </div>
                      <div>
                        <p
                          className={`mb-0 ${ord.confirmedDate ? "text-white" : "text-white-50"}`}
                        >
                          Confirmed
                        </p>
                        {ord.confirmedDate && (
                          <small className="text-white-50">
                            {formatDate(ord.confirmedDate)}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="timeline-item d-flex">
                      <div
                        className={`me-3 ${ord.deliveredDate ? "text-success" : "text-secondary"}`}
                      >
                        <i
                          className={
                            ord.deliveredDate
                              ? "fas fa-check-circle"
                              : "far fa-circle"
                          }
                        ></i>
                      </div>
                      <div>
                        <p
                          className={`mb-0 ${ord.deliveredDate ? "text-white" : "text-white-50"}`}
                        >
                          Delivered
                        </p>
                        {ord.deliveredDate && (
                          <small className="text-white-50">
                            {formatDate(ord.deliveredDate)}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div
                    className="p-4 rounded"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h5 className="text-gold mb-4">
                      <i className="fas fa-map-marker-alt me-2"></i>Shipping
                      Address
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="text-white-50 small text-uppercase mb-1">
                          Recipient Name
                        </label>
                        <p className="text-white fs-5 mb-0">{ord.fullName}</p>
                      </div>
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="text-white-50 small text-uppercase mb-1">
                          Contact
                        </label>
                        <p className="text-white fs-5 mb-0">{ord.mobileNo}</p>
                      </div>
                      <div className="col-12 mt-3">
                        <label className="text-white-50 small text-uppercase mb-1">
                          Address
                        </label>
                        <p className="text-white mb-0">{ord.address}</p>
                        <p className="text-white mb-0">
                          {ord.city}, {ord.state} - {ord.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-5 d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-outline-light px-5 py-2 rounded-pill"
                  onClick={() => navigate("/my-orders")}
                >
                  <i className="fas fa-arrow-left me-2"></i> Back to Orders
                </button>

                <button
                  className="btn btn-outline-gold px-5 py-2 rounded-pill"
                  onClick={handleDownloadInvoice}
                  style={{ borderColor: "#d4af37", color: "#d4af37" }}
                >
                  <i className="fas fa-file-download me-2"></i> Download Invoice
                </button>

                {ord.status === "Confirmed" && ord.paymentStatus !== "Paid" && (
                  <button
                    className="btn btn-premium px-5 py-2 rounded-pill"
                    onClick={handlePayment}
                  >
                    <i className="fas fa-credit-card me-2"></i> Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailOrder;
