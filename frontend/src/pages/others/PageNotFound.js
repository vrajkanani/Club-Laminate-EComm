import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => (
  <div className="bn-page-container text-center animate-up">
    <h1 className="hero-title" style={{ fontSize: "10rem", opacity: 0.1 }}>
      404
    </h1>
    <div
      className="glass-panel p-5 mt-n5"
      style={{ marginTop: "-5rem", position: "relative", zIndex: 1 }}
    >
      <h2 className="font-luxury text-gold mb-3">Page Not Found</h2>
      <p className="text-muted mb-4">
        The atmospheric coordinates you seek do not exist in our current
        collection.
      </p>
      <Link to="/" className="btn-premium px-5">
        Return To Gallery
      </Link>
    </div>
  </div>
);

export default PageNotFound;
