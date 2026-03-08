import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const Feedback = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState([]);
  const [replyEmail, setReplyEmail] = useState("");
  const form = useRef();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessage(data);
      });
  }, [token]);

  const handleCancel = async (msgId, event) => {
    event.preventDefault();
    const result = await Swal.fire({
      title: "Delete Message?",
      text: "This message will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1a1a1a",
      confirmButtonText: "Delete",
      background: "#0a0a0b",
      color: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${msgId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Message removed successfully.");
      } catch (error) {
        toast.error("Failed to delete message.");
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleReply = (email) => {
    setReplyEmail(email);
    setShowModal(true);
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const recipientEmail = form.current["from_email"].value;
    emailjs
      .sendForm("service_c34k6c5", "template_blv462o", form.current, {
        to_email: recipientEmail,
        publicKey: "6SXlrsmeiD695P7x9",
      })
      .then(
        async () => {
          toast.success("Your message has been delivered.");
          setShowModal(false);
          form.current.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
        },
      );
  };

  return (
    <div className="bn-page-container animate-up">
      <div className="section-title-wrapper">
        <p className="section-tagline">Client Relations</p>
        <h2 className="section-title">Feedback Hub</h2>
      </div>

      <div className="row g-4">
        {message.length > 0 ? (
          message.map((msg) => (
            <div className="col-lg-4 col-md-6" key={msg._id}>
              <div className="premium-card h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="font-luxury text-white mb-0">{msg.name}</h4>
                    <span className="text-gold small opacity-75">Message</span>
                  </div>

                  <div className="mb-4">
                    <label className="premium-label small mb-1">Email</label>
                    <p className="text-white small mb-3">{msg.email}</p>

                    <label className="premium-label small mb-1">Inquiry</label>
                    <div
                      className="glass-panel p-3 border-0"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <p
                        className="text-muted small mb-0 font-italic"
                        style={{ lineHeight: "1.6" }}
                      >
                        "{msg.message}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <button
                    className="btn-premium flex-grow-1 justify-content-center"
                    onClick={() => handleReply(msg.email)}
                  >
                    Reply
                  </button>
                  <button
                    className="btn-premium-outline flex-grow-1 justify-content-center text-danger border-danger"
                    style={{ borderColor: "rgba(220, 53, 69, 0.3)" }}
                    onClick={(event) => handleCancel(msg._id, event)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="glass-panel p-5 text-center">
              <h3 className="text-muted">Inbox Empty</h3>
              <p className="text-muted small">
                No client messages to display at the moment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="glass-panel p-5 modal-content-premium animate-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <h2 className="font-luxury text-gold mb-2">Refined Reply</h2>
              <p className="text-muted small">Responding to: {replyEmail}</p>
            </div>

            <form ref={form} onSubmit={sendEmail}>
              <div className="premium-input-group">
                <label className="premium-label">Professional Name</label>
                <input
                  type="text"
                  name="from_name"
                  className="premium-input"
                  placeholder="Club Management"
                  required
                />
              </div>

              <input type="hidden" name="from_email" value={replyEmail} />

              <div className="premium-input-group mt-4">
                <label className="premium-label">Response Message</label>
                <textarea
                  name="message"
                  className="premium-textarea"
                  rows="6"
                  placeholder="Draft your professional response..."
                  required
                />
              </div>

              <div className="d-flex gap-3 mt-5">
                <button
                  type="submit"
                  className="btn-premium flex-grow-1 justify-content-center"
                >
                  Send Response
                </button>
                <button
                  type="button"
                  className="btn-premium-outline flex-grow-1 justify-content-center"
                  onClick={() => setShowModal(false)}
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
