import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import { categoryAPI, productAPI } from "../../services/api";

function CategoryProducts() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030/api/";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await categoryAPI.getById(slug);
        const currentCat = catRes.data;
        setCategoryName(currentCat.name);

        const prodRes = await productAPI.getAll({ category: slug });
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="category-products-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Category: {categoryName}</h1>
          <p className="text-muted">Products in this collection</p>
        </div>
        <Link
          to="/categories"
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
        >
          <MdKeyboardBackspace /> Back to Categories
        </Link>
      </div>

      <div
        className="card shadow-sm border-0 p-4"
        style={{ borderRadius: "15px" }}
      >
        {loading ? (
          <div className="text-center p-5">Loading collection...</div>
        ) : products.length > 0 ? (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product._id} className="col-md-3">
                <div
                  className="card h-100 border-0 shadow-sm overflow-hidden"
                  style={{ borderRadius: "12px" }}
                >
                  <img
                    src={
                      product.image
                        ? `${API_URL.replace("/api/", "")}/${product.image.replace(/\\/g, "/")}`
                        : ""
                    }
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{product.name}</h5>
                    <p
                      className="card-text text-muted small text-truncate-2"
                      style={{ fontSize: "13px" }}
                    >
                      {product.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="fw-bold">₹{product.price}</span>
                      <span className="badge bg-light text-primary border">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-5">
            <p className="text-muted">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;
