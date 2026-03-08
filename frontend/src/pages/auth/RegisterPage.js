import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const RegisterPage = () => {
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warn("Please fix the errors in the form");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
          }),
        },
      );

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Registration failed.");
      }

      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
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
              <h1 className="hero-title mb-4">Join Club!</h1>
              <p className="text-muted mb-0">
                Experience premium material collections with a personalized
                account.
              </p>
            </div>
          </div>
          <div className="col-md-7 form-area">
            <div className="p-5">
              <div className="section-title-wrapper text-start mb-4">
                <p className="section-tagline">Create Account</p>
                <h2 className="section-title h3">Register</h2>
              </div>
              <form onSubmit={handleRegister}>
                <div className="premium-input-group">
                  <label className="premium-label">Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="icon" />
                    <input
                      type="text"
                      name="fullName"
                      className={`premium-input ${errors.fullName ? "border-danger" : ""}`}
                      placeholder="John Doe"
                      value={data.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="validation-error">{errors.fullName}</span>
                  )}
                </div>

                <div className="premium-input-group">
                  <label className="premium-label">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="icon" />
                    <input
                      type="email"
                      name="email"
                      className={`premium-input ${errors.email ? "border-danger" : ""}`}
                      placeholder="email@example.com"
                      value={data.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && (
                    <span className="validation-error">{errors.email}</span>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="premium-input-group">
                      <label className="premium-label">Password</label>
                      <div className="input-with-icon">
                        <FaLock className="icon" />
                        <input
                          type="password"
                          name="password"
                          className={`premium-input ${errors.password ? "border-danger" : ""}`}
                          placeholder="••••••••"
                          value={data.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.password && (
                        <span className="validation-error">
                          {errors.password}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="premium-input-group">
                      <label className="premium-label">Confirm Password</label>
                      <div className="input-with-icon">
                        <FaLock className="icon" />
                        <input
                          type="password"
                          name="confirmPassword"
                          className={`premium-input ${errors.confirmPassword ? "border-danger" : ""}`}
                          placeholder="••••••••"
                          value={data.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <span className="validation-error">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-4">
                  <button
                    type="submit"
                    className="btn-premium px-5 mb-4"
                    style={{ minWidth: "250px" }}
                  >
                    Register Account
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-muted small">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-gold text-decoration-none"
                    >
                      Login here
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

export default RegisterPage;
