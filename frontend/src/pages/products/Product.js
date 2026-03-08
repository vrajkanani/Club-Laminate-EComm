import React, { useEffect, useState } from "react";

function Products({ limit }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  const productList = limit ? products.slice(0, limit) : products;

  const content = (
    <div className="row g-4">
      {productList.map((product) => (
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
                  {product.categories && product.categories.length > 0
                    ? product.categories.map((c) => c.name).join(", ")
                    : "Laminate"}
                </span>
                <h4 className="text-white mt-1 mb-1">{product.name}</h4>
                <div className="text-gold fw-bold fs-5">₹{product.price}</div>
              </div>
              <p className="text-muted small">{product.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (limit) return content;

  return (
    <div className="product-page">
      <header className="hero thin-hero">
        <div className="hero-content animate-up">
          <span className="hero-subtitle">Our Collection</span>
          <h1 className="hero-title">Discover Excellence</h1>
          <p className="lead text-muted mx-auto max-width-600">
            A curated Selection of high-performance surfaces designed for
            architectural brilliance and lasting durability.
          </p>
        </div>
      </header>

      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper text-start mb-5">
            <p className="section-tagline">Signature Surfaces</p>
            <h2 className="section-title">All Products</h2>
          </div>
          {content}
        </div>
      </section>
    </div>
  );
}

export default Products;
