import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warn("Please provide all required fields");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Invalid email or password.");
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("fullName", res.fullName);

      toast.success(`Welcome back, ${res.fullName}!`);
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-container glass-panel animate-up">
        <div className="row g-0 h-100">
          <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center welcome-panel">
            <div className="text-center p-4">
              <h1 className="hero-title mb-4">Welcome Back!</h1>
              <p className="text-muted mb-0">
                Authorized access for Club Laminate Administrative Portal and
                Customer Lounge.
              </p>
            </div>
          </div>
          <div className="col-md-7 form-area">
            <div className="p-5">
              <div className="section-title-wrapper text-start mb-5">
                <p className="section-tagline">Secure Entry</p>
                <h2 className="section-title h3">Account Login</h2>
              </div>
              <form onSubmit={handleLogin}>
                <div className="premium-input-group">
                  <label className="premium-label">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="icon" />
                    <input
                      type="email"
                      className={`premium-input ${errors.email ? "border-danger" : ""}`}
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                    />
                  </div>
                  {errors.email && (
                    <span className="validation-error">{errors.email}</span>
                  )}
                </div>

                <div className="premium-input-group">
                  <label className="premium-label">Password</label>
                  <div className="input-with-icon">
                    <FaLock className="icon" />
                    <input
                      type="password"
                      className={`premium-input ${errors.password ? "border-danger" : ""}`}
                      placeholder="Enter secure password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: "" });
                      }}
                    />
                  </div>
                  {errors.password && (
                    <span className="validation-error">{errors.password}</span>
                  )}
                </div>

                <div className="d-flex justify-content-center mt-4">
                  <button
                    type="submit"
                    className="btn-premium px-5 mb-4"
                    style={{ minWidth: "250px" }}
                  >
                    Authenticate Access
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-muted small">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-gold text-decoration-none"
                    >
                      Register Now
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
