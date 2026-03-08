import React, { useState, useEffect, useRef } from "react";
import { contactAPI } from "../../services/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
import {
  MdEmail,
  MdDelete,
  MdReply,
  MdAccessTime,
  MdCheckCircle,
} from "react-icons/md";

function InquiryList() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const form = useRef();

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await contactAPI.getAll();
      setInquiries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await contactAPI.delete(id);
        toast.success("Inquiry deleted successfully");
        fetchInquiries();
      } catch (error) {
        toast.error("Failed to delete inquiry");
      }
    }
  };

  const handleReply = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Use the same credentials as in the client-side Feedback.js
    const recipientEmail = form.current["from_email"].value;
    emailjs
      .sendForm("service_c34k6c5", "template_blv462o", form.current, {
        to_email: recipientEmail,
        publicKey: "6SXlrsmeiD695P7x9",
      })
      .then(
        async () => {
          toast.success("Reply sent successfully!");
          setShowModal(false);
          // Update status in backend
          try {
            await contactAPI.updateStatus(selectedInquiry._id, "Replied");
            fetchInquiries();
          } catch (err) {
            console.error("Error updating status:", err);
          }
        },
        (error) => {
          toast.error("Failed to send email");
          console.error("EmailJS Error:", error);
        },
      );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title h2 fw-bold mb-1">Client Inquiries</h1>
          <p className="text-secondary small">
            Manage and respond to client feedback
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm px-3 shadow"
          onClick={fetchInquiries}
        >
          Refresh
        </button>
      </div>

      <div className="row g-4">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <div key={inquiry._id} className="col-xl-4 col-md-6">
              <div className="card shadow-sm h-100 border-0 overflow-hidden inquiry-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                    <div className="d-flex align-items-center overflow-hidden">
                      <div
                        className="rounded-3 p-2 me-3 shadow-sm text-white flex-shrink-0"
                        style={{
                          background:
                            inquiry.status === "Replied"
                              ? "var(--success-gradient, linear-gradient(135deg, #28a745 0%, #20c997 100%))"
                              : "var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%))",
                        }}
                      >
                        <MdEmail size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <h6 className="fw-bold mb-0 text-truncate">
                          {inquiry.name}
                        </h6>
                        <p className="text-muted small mb-0 text-truncate">
                          {inquiry.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge flex-shrink-0 ${inquiry.status === "Replied" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                    >
                      {inquiry.status === "Replied" ? (
                        <MdCheckCircle className="me-1" />
                      ) : (
                        <MdAccessTime className="me-1" />
                      )}
                      {inquiry.status || "Pending"}
                    </span>
                  </div>

                  <div
                    className="bg-light-subtle rounded-3 p-3 mb-4 border"
                    style={{ minHeight: "100px", backgroundColor: "#f8f9fa" }}
                  >
                    <p
                      className="small text-secondary mb-0 fw-medium"
                      style={{ whiteSpace: "pre-wrap", fontStyle: "italic" }}
                    >
                      "{inquiry.message}"
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm border-0"
                      style={{
                        background:
                          "var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%))",
                      }}
                      onClick={() => handleReply(inquiry)}
                    >
                      <MdReply /> Reply
                    </button>
                    <button
                      className="btn btn-white border d-flex align-items-center justify-content-center px-3 shadow-sm text-danger"
                      onClick={() => handleDelete(inquiry._id)}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
                <div className="card-footer bg-light border-0 px-4 py-2">
                  <small className="text-muted extra-small">
                    Received: {new Date(inquiry.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card shadow-sm border-0 p-5 text-center">
              <div className="mb-3">
                <MdEmail size={48} className="text-muted opacity-25" />
              </div>
              <h5 className="text-muted">No Inquiries Found</h5>
              <p className="text-secondary small">Everything is up to date!</p>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Send Reply</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">
                  Responding to: <strong>{selectedInquiry?.email}</strong>
                </p>

                <form ref={form} onSubmit={sendEmail}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Professional Name
                    </label>
                    <input
                      type="text"
                      name="from_name"
                      className="form-control"
                      defaultValue="Club Laminate Management"
                      required
                    />
                  </div>

                  <input
                    type="hidden"
                    name="from_email"
                    value={selectedInquiry?.email}
                  />

                  <div className="mb-4">
                    <label className="form-label small fw-bold">
                      Response Message
                    </label>
                    <textarea
                      name="message"
                      className="form-control"
                      rows="5"
                      placeholder="Type your response here..."
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                    >
                      Send Response
                    </button>
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InquiryList;
