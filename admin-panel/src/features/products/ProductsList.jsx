import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { productAPI } from "../../services/api";

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030/api/";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      const data = response.data;
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This will remove the product from your collection forever.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      try {
        await productAPI.delete(productId);
        toast.success("Product removed successfully.");
        fetchProducts();
      } catch (error) {
        toast.error("An error occurred during deletion.");
        console.error("Error deleting product: ", error);
      }
    }
  };

  return (
    <div className="products-list-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Products</h1>
          <p className="text-muted">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border shadow-sm px-3"
            onClick={fetchProducts}
            style={{ borderRadius: "10px", fontWeight: "600" }}
          >
            Refresh
          </button>
          <Link
            to="/products/new"
            className="btn px-4 py-2 d-flex align-items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            <MdAdd size={20} /> Add Product
          </Link>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading products...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Product</th>
                  <th className="py-3 border-0">Category</th>
                  <th className="py-3 border-0">Price</th>
                  <th className="py-3 border-0">Stock</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              product.image
                                ? `${API_URL.replace("/api/", "")}/${product.image.replace(/\\/g, "/")}`
                                : ""
                            }
                            alt={product.name}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="d-flex flex-column">
                            <span className="fw-bold">{product.name}</span>
                            <span className="small text-muted">
                              {product.sku || "No SKU"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 border-0">
                        {product.categories?.map((c) => (
                          <span
                            key={c._id}
                            className="badge bg-light text-primary me-1 border"
                          >
                            {c.name}
                          </span>
                        )) || "Uncategorized"}
                      </td>
                      <td className="py-3 border-0">₹{product.price}</td>
                      <td className="py-3 border-0">
                        {(() => {
                          const currentStock =
                            product.stockQuantity || product.stock || 0;
                          const reorderLevel = product.reorderLevel || 10;
                          const isLow = currentStock <= reorderLevel;
                          return (
                            <span
                              className={`badge ${isLow ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}
                            >
                              {currentStock} in stock
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() =>
                              navigate(`/products/edit/${product._id}`)
                            }
                            title="Edit"
                          >
                            <MdEdit size={18} className="text-primary" />
                          </button>
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Delete"
                          >
                            <MdDelete size={18} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No products found. Start by adding one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsList;
