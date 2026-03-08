import React from "react";
import { useNavigate } from "react-router-dom";
import {
  PiBuildingsDuotone,
  PiMapPinDuotone,
  PiSealCheckDuotone,
  PiWarehouseDuotone,
  PiBankDuotone,
  PiDiamondsFourDuotone,
  PiBridgeDuotone,
  PiMountainsDuotone,
  PiTreeDuotone,
} from "react-icons/pi";
import ClubLouvers1 from "../products/ClubLouvers1";
import Products from "../products/Product";

const HomePage = () => {
  const navigate = useNavigate();

  const catalogueItems = [
    {
      title: "Signature Surfaces",
      tag: "Premium Collection",
      image: "/images/home/img1.jpg",
      link: "/Product",
    },
    {
      title: "Exclusive Veneers",
      tag: "Natural Luxury",
      image: "/images/home/img5.jpg",
      link: "/Product",
    },
    {
      title: "Designer Louvers",
      tag: "Aesthetic Core",
      image: "/images/home/img3.jpg",
      link: "/1 club louvers",
    },
  ];

  const applicationShowcase = [
    { title: "Kitchen Interiors", image: "/images/home/img9.jpg" },
    { title: "Office Spaces", image: "/images/home/img15.jpg" },
    { title: "Furniture Finishes", image: "/images/home/img10.jpg" },
    { title: "Wall Claddings", image: "/images/home/img13.jpg" },
  ];

  const cities = [
    { name: "Bhachau", icon: <PiWarehouseDuotone /> },
    { name: "Rajkot", icon: <PiBankDuotone /> },
    { name: "Surat", icon: <PiDiamondsFourDuotone /> },
    { name: "Ahmedabad", icon: <PiBridgeDuotone /> },
    { name: "Pune", icon: <PiMountainsDuotone /> },
    { name: "Mumbai", icon: <PiBuildingsDuotone /> },
    { name: "Bangalore", icon: <PiTreeDuotone /> },
  ];

  return (
    <div className="home-page">
      {/* Immersive Hero Section */}
      <header className="hero">
        <div className="hero-content animate-up">
          <span className="hero-subtitle">Redefining Interior Surfaces</span>
          <h1 className="hero-title">
            Experience the Art of <br /> Fine Living
          </h1>
          <p className="lead text-muted mb-5 px-lg-5">
            Discover a world where durability meets unparalleled luxury. Our
            curated collections bring architectural excellence to every surface
            of your space.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn-premium"
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight * 0.9,
                  behavior: "smooth",
                });
              }}
            >
              Explore Catalogue
            </button>
            <button
              className="btn-premium-outline"
              onClick={() => navigate("/BookNow")}
            >
              Request Inquiry
            </button>
          </div>
        </div>
      </header>

      {/* Catalogue Range Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper text-start mb-5">
            <p className="section-tagline">Our Signature Range</p>
            <h2 className="section-title">Surface Collections</h2>
          </div>

          <div className="studio-grid">
            {catalogueItems.map((item, index) => (
              <div
                key={index}
                className="studio-card"
                onClick={() => navigate(item.link)}
              >
                <img src={item.image} alt={item.title} />
                <div className="studio-card-content">
                  <span className="studio-card-tag">{item.tag}</span>
                  <h3 className="studio-card-title">{item.title}</h3>
                  <button className="btn-premium-outline small">
                    View Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Showcase Section */}
      <section className="section-padding bg-black-subtle">
        <div className="container">
          <div className="section-title-wrapper mb-5">
            <p className="section-tagline">Laminates in Action</p>
            <h2 className="section-title">Versatile Applications</h2>
          </div>

          <div className="app-showcase-grid">
            {applicationShowcase.map((app, index) => (
              <div key={index} className="app-column">
                <img src={app.image} alt={app.title} />
                <div className="app-column-overlay">
                  <span className="app-column-title">{app.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section (New Arrivals) */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper d-flex justify-content-between align-items-end mb-5">
            <div className="text-start">
              <p className="section-tagline">Trending & New</p>
              <h2 className="section-title mb-0">Featured Selections</h2>
            </div>
            <button
              className="btn-premium-outline small"
              onClick={() => navigate("/Product")}
            >
              Explore All
            </button>
          </div>
          <div className="product-container">
            <Products limit={4} />
          </div>
        </div>
      </section>

      {/* Signature Louvers Section */}
      <section className="section-padding bg-black-subtle">
        <div className="container">
          <div className="section-title-wrapper d-flex justify-content-between align-items-end mb-5">
            <div className="text-start">
              <p className="section-tagline">Architectural Depth</p>
              <h2 className="section-title mb-0">The Club Louvers Series</h2>
            </div>
            <button
              className="btn-premium-outline small"
              onClick={() => navigate("/1 club louvers")}
            >
              Explore Louvers
            </button>
          </div>
          <div className="product-container">
            <ClubLouvers1 limit={4} />
          </div>
        </div>
      </section>

      {/* Material Excellence Section */}
      <section className="section-padding">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="section-title-wrapper text-start mb-4">
                <p className="section-tagline">The Club Advantage</p>
                <h2 className="section-title">Crafting Excellence</h2>
              </div>
              <p className="lead text-muted mb-4">
                Our materials undergo rigorous quality checks to ensure
                uniformity in design, color, and surface feel. We combine
                traditional craftsmanship with modern high-pressure technology
                to deliver surfaces that last a lifetime.
              </p>
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div className="bg-gold-subtle p-2 rounded-3 text-gold">
                      <PiSealCheckDuotone />
                    </div>
                    <span className="small fw-bold">
                      Scratch & Heat Resistant
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div className="bg-gold-subtle p-2 rounded-3 text-gold">
                      <PiSealCheckDuotone />
                    </div>
                    <span className="small fw-bold">Eco-Friendly Core</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div className="bg-gold-subtle p-2 rounded-3 text-gold">
                      <PiSealCheckDuotone />
                    </div>
                    <span className="small fw-bold">Vibrant Textures</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div className="bg-gold-subtle p-2 rounded-3 text-gold">
                      <PiSealCheckDuotone />
                    </div>
                    <span className="small fw-bold">Long-Lasting Shine</span>
                  </div>
                </div>
              </div>
              <button
                className="btn-premium"
                onClick={() => navigate("/AboutUsPage")}
              >
                Our Quality Standards
              </button>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <img
                    src="/images/home/img6.jpg"
                    className="img-fluid rounded-5 shadow-lg"
                    alt="Process"
                    style={{ marginTop: "3rem" }}
                  />
                </div>
                <div className="col-6">
                  <img
                    src="/images/home/img7.jpg"
                    className="img-fluid rounded-5 shadow-lg"
                    alt="Core"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Geographical Presence Section */}
      <section className="section-padding bg-black-subtle">
        <div className="container text-center">
          <div className="section-title-wrapper">
            <p className="section-tagline">Widespread Reach</p>
            <h2 className="section-title">Our Growing Presence</h2>
          </div>
          <div className="city-grid">
            {cities.map((city, index) => (
              <div key={index} className="city-card">
                <span className="city-icon">{city.icon}</span>
                <span className="city-name">{city.name}</span>
              </div>
            ))}
          </div>
          <p className="presence-info">
            <PiMapPinDuotone className="me-2 text-gold" />
            Available across major design hubs in India.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding text-center">
        <div className="container">
          <div className="glass-panel py-6 px-4">
            <h2 className="hero-title mb-3" style={{ fontSize: "3rem" }}>
              Transform Your Vision Into Reality
            </h2>
            <p className="text-muted mb-5 max-width-600 mx-auto">
              Our design experts are ready to assist you in selecting the
              perfect materials for your next architectural masterpiece.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn-premium"
                onClick={() => navigate("/ContactUsPage")}
              >
                Contact Expert
              </button>
              <button
                className="btn-premium-outline"
                onClick={() => navigate("/BookNow")}
              >
                Download Catalogue
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
