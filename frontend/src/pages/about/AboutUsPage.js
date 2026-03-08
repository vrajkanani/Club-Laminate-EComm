import { useNavigate } from "react-router-dom";
import {
  PiBuildingsDuotone,
  PiMapPinDuotone,
  PiWarehouseDuotone,
  PiBankDuotone,
  PiDiamondsFourDuotone,
  PiBridgeDuotone,
  PiMountainsDuotone,
  PiTreeDuotone,
} from "react-icons/pi";

function AboutUsPage() {
  const navigate = useNavigate();

  const cities = [
    { name: "Bhachau", icon: <PiWarehouseDuotone /> },
    { name: "Rajkot", icon: <PiBankDuotone /> },
    { name: "Surat", icon: <PiDiamondsFourDuotone /> },
    { name: "Ahmedabad", icon: <PiBridgeDuotone /> },
    { name: "Pune", icon: <PiMountainsDuotone /> },
    { name: "Mumbai", icon: <PiBuildingsDuotone /> },
    { name: "Bangalore", icon: <PiTreeDuotone /> },
  ];

  const values = [
    {
      title: "Material Quality",
      desc: "Rigorous checks ensure every sheet meets international durability standards.",
    },
    {
      title: "Design Innovation",
      desc: "Always ahead of trends with textures that inspire architectural brilliance.",
    },
    {
      title: "Sustainability",
      desc: "Eco-friendly cores sourced from sustainable forests for a greener tomorrow.",
    },
    {
      title: "Customer Focused",
      desc: "Seamless experience from selection to delivery across all major hubs.",
    },
  ];

  return (
    <div className="about-page animate-up">
      {/* Short Hero */}
      <header className="hero thin-hero">
        <div className="hero-content">
          <span className="hero-subtitle">Our Legacy</span>
          <h1 className="hero-title">
            Crafting the Future <br /> of Interiors
          </h1>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="section-padding">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="section-title-wrapper text-start mb-4">
                <p className="section-tagline">Since Our Inception</p>
                <h2 className="section-title">A Vision for Excellence</h2>
              </div>
              <p className="lead text-muted mb-4">
                Club Material Studio was born out of a desire to bridge the gap
                between architectural necessity and luxurious aesthetic. We
                provide surfaces that don't just cover walls—they tell stories.
              </p>
              <p className="text-muted">
                With a footprint across India's major design hubs, we've become
                the trusted choice for architects and interior designers seeking
                that elusive blend of durability and panache.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="studio-card" style={{ height: "400px" }}>
                <img src="/images/home/img1.jpg" alt="Our Workshop" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-black-subtle">
        <div className="container">
          <div className="section-title-wrapper mb-5">
            <p className="section-tagline">The Club Code</p>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="row g-4">
            {values.map((v, i) => (
              <div key={i} className="col-md-3">
                <div className="glass-panel p-4 h-100 border-gold-soft hover-lift">
                  <h4 className="text-gold mb-3 h5">{v.title}</h4>
                  <p className="small text-light mb-0" style={{ opacity: 0.9 }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
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

      {/* Map Section */}
      <section className="section-padding bg-black-subtle">
        <div className="container">
          <div className="section-title-wrapper d-flex justify-content-between align-items-end mb-5">
            <div className="text-start">
              <p className="section-tagline">Our Presence</p>
              <h2 className="section-title mb-0">Visit Our Studio</h2>
            </div>
            <button
              className="btn-premium small"
              onClick={() => navigate("/ContactUsPage")}
            >
              Get Directions
            </button>
          </div>
          <div className="glass-panel p-2 overflow-hidden shadow-lg border-gold-soft">
            <iframe
              title="About Us map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.0750146728374!2d70.78013767506856!3d22.275148079704657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cb7371f2c83f%3A0x11143260839b2176!2z8J2XlvCdl7nwnZiC8J2XryDwnZeg8J2XrvCdmIHwnZey8J2Xv_Cdl7bwnZeu8J2XuSDwnZem8J2YgfCdmILwnZex8J2XtvCdl7wgLUJlc3QgdmVuZWVyIHNob3dyb29tL0Jlc3QgaW50ZXJpb3IgcHJvZHVjdCBnYWxsYXJ5L0xhbWluYXRlIHNob3dyb29tLyBMYW1pbmF0ZSBkaXNwbGF5IC9Mb3V2ZXJz!5e0!3m2!1sen!2sin!4v1708860167142!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: "100%",
                height: "450px",
                border: "none",
                borderRadius: "15px",
                opacity: 0.8,
              }}
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;
