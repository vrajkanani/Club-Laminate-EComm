import React from "react";

const Services = () => {
  return (
    <div className="bn-page-container animate-up">
      <div className="section-title-wrapper mb-5">
        <p className="section-tagline">Excellence & Quality</p>
        <h2 className="section-title">Our Specialized Services</h2>
      </div>

      <div className="glass-panel section-padding text-center mb-5">
        <p className="lead text-white px-5">
          We offer premium laminate solutions on high-quality plywood, designed
          to elevate the aesthetics and durability of your professional and
          personal spaces.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="premium-card h-100 p-4">
            <h3 className="font-luxury text-gold mb-3 h4">Customized Design</h3>
            <p className="text-muted small">
              We provide tailored laminate options to suit your unique design
              preferences, with a wide variety of colors, textures, and
              finishes.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="premium-card h-100 p-4">
            <h3 className="font-luxury text-gold mb-3 h4">
              Sourcing & Installation
            </h3>
            <p className="text-muted small">
              Our team sources the finest plywood materials and offers
              professional installation services to ensure lasting performance.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="premium-card h-100 p-4">
            <h3 className="font-luxury text-gold mb-3 h4">Project Solutions</h3>
            <p className="text-muted small">
              Whether it's for home or business, our solutions are crafted to
              meet diverse project requirements and luxury standards.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="premium-card h-100 p-4">
            <h3 className="font-luxury text-gold mb-3 h4">
              Expert Consultation
            </h3>
            <p className="text-muted small">
              Our design experts provide consultation to help you select the
              best materials that align with your space and vision.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="text-muted mb-4">
          Interested in starting a project with us?
        </p>
        <button className="btn-premium">Inquire About Services</button>
      </div>
    </div>
  );
};

export default Services;
