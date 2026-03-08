import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const BookNow = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    fullName: "",
    mobileNo: "",
    pincode: "",
    productName: "",
    quantity: 1,
    city: "",
    state: "",
    address: "",
    orderDate: new Date().toISOString().split("T")[0],
    productId: "",
  });
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "productName") {
      const selectedProduct = products.find((p) => p.name === value);
      setData({
        ...data,
        productName: value,
        productId: selectedProduct ? selectedProduct._id : "",
      });
    } else {
      setData({ ...data, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!data.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!/^\d{10}$/.test(data.mobileNo)) {
      newErrors.mobileNo = "Invalid mobile number (10 digits required)";
    }
    if (!data.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(data.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits required)";
    }
    if (!data.productName)
      newErrors.productName = "Product selection is required";
    if (data.quantity <= 0) newErrors.quantity = "Quantity must be at least 1";
    if (!data.city.trim()) newErrors.city = "City is required";
    if (!data.state.trim()) newErrors.state = "State is required";
    if (!data.address.trim()) newErrors.address = "Address is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warn("Please complete the form correctly.");
      return;
    }

    Swal.fire({
      title: "Confirm Booking",
      text: `Do you want to book ${data.quantity} units of ${data.productName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#c5a059",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Book Now!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${process.env.REACT_APP_API_URL}/api/orders/book`, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => {
          if (res.ok) {
            toast.success(
              "Order booked successfully! We will contact you soon.",
            );
            navigate("/Product");
          } else {
            toast.error("Booking failed. Please try again.");
          }
        });
      }
    });
  };

  return (
    <div className="bn-page-container animate-up">
      <div className="section-title-wrapper mb-5">
        <p className="section-tagline">Quality Products</p>
        <h2 className="section-title">Place Your Order</h2>
      </div>

      <div className="bn-form-wrapper glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="premium-input-group">
                <label className="premium-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className={`premium-input ${errors.fullName ? "border-danger" : ""}`}
                  placeholder="Enter your full name"
                  value={data.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && (
                  <span className="validation-error">{errors.fullName}</span>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="premium-input-group">
                <label className="premium-label">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNo"
                  className={`premium-input ${errors.mobileNo ? "border-danger" : ""}`}
                  placeholder="10-digit mobile number"
                  value={data.mobileNo}
                  onChange={handleInputChange}
                />
                {errors.mobileNo && (
                  <span className="validation-error">{errors.mobileNo}</span>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="premium-input-group">
                <label className="premium-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className={`premium-input ${errors.pincode ? "border-danger" : ""}`}
                  placeholder="6-digit pincode"
                  value={data.pincode}
                  onChange={handleInputChange}
                />
                {errors.pincode && (
                  <span className="validation-error">{errors.pincode}</span>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="premium-input-group">
                <label className="premium-label">City</label>
                <input
                  type="text"
                  name="city"
                  className={`premium-input ${errors.city ? "border-danger" : ""}`}
                  placeholder="Your city"
                  value={data.city}
                  onChange={handleInputChange}
                />
                {errors.city && (
                  <span className="validation-error">{errors.city}</span>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="premium-input-group">
                <label className="premium-label">State</label>
                <input
                  type="text"
                  name="state"
                  className={`premium-input ${errors.state ? "border-danger" : ""}`}
                  placeholder="Your state"
                  value={data.state}
                  onChange={handleInputChange}
                />
                {errors.state && (
                  <span className="validation-error">{errors.state}</span>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="premium-input-group">
                <label className="premium-label">Select Product</label>
                <select
                  name="productName"
                  className={`premium-select ${errors.productName ? "border-danger" : ""}`}
                  style={{ appearance: "auto" }}
                  value={data.productName}
                  onChange={handleInputChange}
                >
                  <option value="">Choose a texture...</option>
                  {products.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errors.productName && (
                  <span className="validation-error">{errors.productName}</span>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="premium-input-group">
                <label className="premium-label">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className={`premium-input ${errors.quantity ? "border-danger" : ""}`}
                  min="1"
                  value={data.quantity}
                  onChange={handleInputChange}
                />
                {errors.quantity && (
                  <span className="validation-error">{errors.quantity}</span>
                )}
              </div>
            </div>
          </div>

          <div className="premium-input-group">
            <label className="premium-label">Order Date</label>
            <input
              type="date"
              name="orderDate"
              className={`premium-input ${errors.orderDate ? "border-danger" : ""}`}
              value={data.orderDate}
              onChange={handleInputChange}
            />
            {errors.orderDate && (
              <span className="validation-error">{errors.orderDate}</span>
            )}
          </div>

          <div className="premium-input-group">
            <label className="premium-label">Full Shipping Address</label>
            <textarea
              name="address"
              className={`premium-textarea ${errors.address ? "border-danger" : ""}`}
              placeholder="House no, Street name, Landmark..."
              rows="4"
              value={data.address}
              onChange={handleInputChange}
            ></textarea>
            {errors.address && (
              <span className="validation-error">{errors.address}</span>
            )}
            <p className="text-gold small mt-2">
              *Standard size: 8ft x 4ft (2440mm x 1220mm)
            </p>
          </div>

          <div className="text-center mt-5">
            <button type="submit" className="btn-premium px-5">
              Confirm & Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookNow;
