import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function CategoryProducts() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryExists, setCategoryExists] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch category details first to validate slug
        const catRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/categories/${slug}`,
        );

        if (catRes.ok) {
          const currentCat = await catRes.json();
          setCategoryExists(true);
          setCategoryName(currentCat.name);

          // Fetch products for this validated category
          const prodRes = await fetch(
            `${process.env.REACT_APP_API_URL}/api/products?category=${slug}`,
          );
          const prodData = await prodRes.json();
          setProducts(prodData);
        } else {
          setCategoryExists(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  return (
    <div className="bn-page-container animate-up">
      <div className="section-title-wrapper text-start mb-5">
        <p className="section-tagline">Collection</p>
        <h2 className="section-title">
          {categoryName}{" "}
          {products.length > 0 && (
            <span className="text-muted fs-6 fw-normal">
              ({products.length}{" "}
              {products.length === 1 ? "product" : "products"})
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="text-center p-5">Loading collection...</div>
      ) : !categoryExists ? (
        <div className="text-center p-5 glass-panel">
          <h2 className="hero-title text-gold mb-3">404</h2>
          <h4 className="text-white mb-4">Category Not Found</h4>
          <p className="text-muted mb-4">
            The collection you are looking for does not exist or has been moved.
          </p>
          <Link to="/Product" className="btn-premium">
            Explore All Products
          </Link>
        </div>
      ) : products.length > 0 ? (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="premium-card h-100 p-0 overflow-hidden">
                <div className="product-image-wrapper">
                  <img
                    src={
                      product.image
                        ? `${process.env.REACT_APP_API_URL}/${product.image.replace(/\\/g, "/")}`
                        : ""
                    }
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="p-4 d-flex flex-column">
                  <div className="mb-3">
                    <span className="text-gold small fw-bold text-uppercase letter-spacing-1">
                      {product.categories?.map((c) => c.name).join(", ") ||
                        "Laminate"}
                    </span>
                    <h4 className="text-white mt-1 mb-1">{product.name}</h4>
                    <div className="text-gold fw-bold fs-5">
                      ₹{product.price}
                    </div>
                  </div>
                  <p className="text-muted small">{product.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5 glass-panel">
          <h4 className="text-muted">No products found in this category.</h4>
          <Link to="/Product" className="btn-premium mt-3">
            View All Products
          </Link>
        </div>
      )}

      <div className="mt-5">
        <Link
          to="/Product"
          className="text-gold text-decoration-none d-flex align-items-center gap-2 small hover-opacity"
        >
          <MdKeyboardBackspace size={20} /> Back to All Products
        </Link>
      </div>
    </div>
  );
}

export default CategoryProducts;
