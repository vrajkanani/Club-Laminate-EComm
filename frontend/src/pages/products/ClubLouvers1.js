import React, { useEffect, useState } from "react";

function ClubLouvers1({ limit }) {
  const [products, setProducts] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3030";

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetching specifically for louvers if possible, otherwise filter
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter for products that might be louvers or belong to a louver category
        // For now, showing all products but limited as requested
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching louvers: ", error);
    }
  };

  const productList = limit ? products.slice(0, limit) : products;

  return (
    <div className="row g-4">
      {productList.map((product) => (
        <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
          <div className="premium-card h-100 p-0 overflow-hidden">
            <div className="product-image-wrapper">
              <img
                src={
                  product.image
                    ? `${API_URL}/${product.image.replace(/\\/g, "/")}`
                    : ""
                }
                alt={product.name}
                className="product-image"
              />
            </div>
            <div className="p-4 d-flex flex-column">
              <div className="mb-3">
                <span className="text-gold small fw-bold text-uppercase letter-spacing-1">
                  Louvers
                </span>
                <h4 className="text-white mt-1 mb-1">{product.name}</h4>
                <div className="text-gold fw-bold fs-5">₹{product.price}</div>
              </div>
              <p className="text-muted small mb-4">{product.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ClubLouvers1;
