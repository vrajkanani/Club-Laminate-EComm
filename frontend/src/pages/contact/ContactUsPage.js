import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/contact`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!data.name.trim()) newErrors.name = "Full Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!data.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warn("Please fill out all fields correctly.");
      return;
    }

    Swal.fire({
      title: "Confirm Submission",
      text: "Do you want to send this message to our team?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#c5a059",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Send Now!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          if (response.ok) {
            toast.success("Message sent successfully!");
            setData({ name: "", email: "", message: "" });
            navigate("/");
          } else {
            const errorData = await response.json();
            toast.error(
              errorData.message || "Failed to send message. Please try again.",
            );
          }
        } catch (error) {
          toast.error("Failed to send message. Please try again.");
          console.error("Error occurred while submitting:", error.message);
        }
      }
    });
  };

  return (
    <div className="bn-page-container animate-up">
      <div className="section-title-wrapper mb-5">
        <p className="section-tagline">Communication</p>
        <h2 className="section-title">Contact Our Team</h2>
      </div>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="glass-panel p-5 h-100">
            <h3 className="font-luxury text-gold mb-4">Get In Touch</h3>
            <div className="mb-4">
              <p className="premium-label mb-1">Our Studio</p>
              <p className="text-white small">
                Nana mauva road, opp. Marvadi Share Market,
                <br />L Shivganga Society, Rajkot, Gujarat 360005
              </p>
            </div>
            <div className="mb-4">
              <p className="premium-label mb-1">Direct Contact</p>
              <p className="text-white small">
                Email: info@clubmaterialstudio.com
              </p>
              <p className="text-white small">Phone: +91 9876543210</p>
            </div>
            <div>
              <p className="premium-label mb-1">Buisness Hours</p>
              <p className="text-white small">Mon - Fri: 9:00 AM - 6:00 PM</p>
              <p className="text-white small">Sat: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass-panel p-5">
            <h3 className="font-luxury text-gold mb-4">Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="premium-input-group">
                <label className="premium-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className={`premium-input ${errors.name ? "border-danger" : ""}`}
                  placeholder="John Doe"
                  value={data.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <span className="validation-error">{errors.name}</span>
                )}
              </div>
              <div className="premium-input-group">
                <label className="premium-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`premium-input ${errors.email ? "border-danger" : ""}`}
                  placeholder="john@example.com"
                  value={data.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="validation-error">{errors.email}</span>
                )}
              </div>
              <div className="premium-input-group mb-4">
                <label className="premium-label">Your Message</label>
                <textarea
                  name="message"
                  className={`premium-textarea ${errors.message ? "border-danger" : ""}`}
                  rows="5"
                  placeholder="How can we help you?"
                  value={data.message}
                  onChange={handleChange}
                ></textarea>
                {errors.message && (
                  <span className="validation-error">{errors.message}</span>
                )}
              </div>
              <div className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn-premium px-5"
                  style={{ minWidth: "250px" }}
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
