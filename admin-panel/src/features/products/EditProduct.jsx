import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdKeyboardBackspace } from "react-icons/md";
import Select from "react-select";
import { productAPI, categoryAPI } from "../../services/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030/api/";

  const [data, setData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    categories: [],
    stock: 0,
    reorderLevel: 10,
    image: "",
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = response.data;
      const options = data.map((cat) => ({
        value: cat._id,
        label: cat.name,
      }));
      setAvailableCategories(options);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    // Fetch product data
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getById(id);
        const product = response.data;
        // Transform product categories into react-select format
        const productCats = (product.categories || []).map((c) => ({
          value: c._id,
          label: c.name,
        }));
        setData({
          ...product,
          sku: product.sku || "",
          categories: productCats,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleCategoryChange = (selectedOptions) => {
    setData({ ...data, categories: selectedOptions });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!data.name.trim()) errors.name = "Product Name is required";
    if (!data.description.trim())
      errors.description = "Product Description is required";
    if (data.categories.length === 0)
      errors.categories = "At least one category is required";
    if (!data.price.toString().trim()) {
      errors.price = "Product Price is required";
    } else if (isNaN(data.price)) {
      errors.price = "Product Price must be a number";
    }

    if (Object.keys(errors).length === 0) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sku", data.sku || "");
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("stock", data.stock || 0);
      formData.append("reorderLevel", data.reorderLevel || 10);

      const categoryIds = data.categories.map((c) => c.value);
      formData.append("categories", JSON.stringify(categoryIds));

      if (image) {
        formData.append("image", image);
      }

      const updateProductAction = async () => {
        try {
          await productAPI.update(id, formData);
          toast.success("Product updated successfully!");
          navigate("/products");
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "An error occurred while updating the product",
          );
          console.error("Error updating product:", error);
        }
      };

      updateProductAction();
    } else {
      setErrors(errors);
      toast.warn("Please fix the errors in the form");
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      background: "rgba(255, 255, 255, 0.9)",
      border: state.isFocused ? "1px solid #667eea" : "1px solid #e0e0e0",
      borderRadius: "10px",
      padding: "5px",
      boxShadow: state.isFocused
        ? "0 0 0 3px rgba(102, 126, 234, 0.1)"
        : "none",
      "&:hover": {
        borderColor: "#667eea",
      },
    }),
    menu: (provided) => ({
      ...provided,
      background: "white",
      borderRadius: "10px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused ? "#f0f2ff" : "transparent",
      color: state.isFocused ? "#667eea" : "#333",
      "&:active": {
        background: "#e0e4ff",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      background: "#f0f2ff",
      borderRadius: "6px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#667eea",
      fontWeight: "500",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#667eea",
      "&:hover": {
        background: "#e0e4ff",
        color: "#667eea",
      },
    }),
  };

  if (loading) {
    return <div className="p-5 text-center">Loading product data...</div>;
  }

  return (
    <div className="product-form-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit Product</h1>
        <Link
          to="/products"
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
        >
          <MdKeyboardBackspace /> Back to Products
        </Link>
      </div>

      <div
        className="card shadow-sm border-0 p-4"
        style={{ borderRadius: "15px" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label fw-bold">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={data.name}
                  onChange={handleInputChange}
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">SKU (Unique ID)</label>
                  <input
                    type="text"
                    name="sku"
                    className="form-control"
                    value={data.sku || ""}
                    onChange={handleInputChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Price (₹)</label>
                  <input
                    type="text"
                    name="price"
                    className={`form-control ${errors.price ? "is-invalid" : ""}`}
                    value={data.price}
                    onChange={handleInputChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {errors.price && (
                    <div className="invalid-feedback">{errors.price}</div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    value={data.stock}
                    onChange={handleInputChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Reorder Level (Low Stock Limit)
                  </label>
                  <input
                    type="number"
                    name="reorderLevel"
                    className="form-control"
                    value={data.reorderLevel}
                    onChange={handleInputChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Categories</label>
                <Select
                  isMulti
                  options={availableCategories}
                  value={data.categories}
                  onChange={handleCategoryChange}
                  styles={customStyles}
                  placeholder="Select categories..."
                />
                {errors.categories && (
                  <div className="text-danger small mt-1">
                    {errors.categories}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label fw-bold">Product Image</label>
                <div
                  className="image-upload-wrapper border rounded-3 p-3 text-center"
                  style={{
                    borderStyle: "dashed !important",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {image ? (
                    <div className="position-relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: "150px" }}
                      />
                      <p className="small text-muted mb-0">{image.name}</p>
                    </div>
                  ) : data.image ? (
                    <div className="position-relative">
                      <img
                        src={`${API_URL.replace("/api/", "")}/${data.image.replace(/\\/g, "/")}`}
                        alt="Current"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: "150px" }}
                      />
                      <p className="small text-muted mb-0">Current Image</p>
                    </div>
                  ) : (
                    <div className="text-muted">
                      <div style={{ fontSize: "40px" }}>🖼️</div>
                      <p className="small mb-0">Change image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    className="form-control mt-2"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Product Description</label>
            <textarea
              name="description"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              rows="4"
              value={data.description || ""}
              onChange={handleInputChange}
              style={{ borderRadius: "10px", padding: "12px" }}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="px-5 py-3"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
              }}
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
