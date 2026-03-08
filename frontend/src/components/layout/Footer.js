import React, { useState } from "react";
import {
  FaInstagram,
  FaGithub,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { CiFacebook } from "react-icons/ci";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="footer-container">
      <div className="container">
        <div className="row g-5">
          {/* Brand Section */}
          <div className="col-lg-4">
            <div className="footer-brand">
              <h1>CLUB</h1>
              <p className="footer-description">
                For Interior, We Are Very Proud To Present CLUB SURFACES - A
                Surface That Meets the Highest and Most Recent Standards of
                World-Class Quality and Luxury Aesthetics.
              </p>
              <div className="social-icons">
                <a
                  href="https://instagram.com"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://facebook.com"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CiFacebook />
                </a>
                <a
                  href="https://github.com"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h3 className="footer-section-title">Explore</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home Gallery</Link>
              </li>
              <li>
                <Link to="/AboutUsPage">Our Story</Link>
              </li>
              <li>
                <Link to="/ServicesPage">Our Services</Link>
              </li>
              <li>
                <Link to="/ContactUsPage">Reach Us</Link>
              </li>
              <li>
                <Link to="/BookNow">Book Demo</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-lg-3 col-md-4">
            <h3 className="footer-section-title">Visit Our Studio</h3>
            <div className="footer-contact-item">
              <FaMapMarkerAlt />
              <span>
                Nana mauva road, opp. Marvadi Share Market, Rajkot, Gujarat
                360005
              </span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope />
              <span>info@clubmaterialstudio.com</span>
            </div>
            <div className="footer-contact-item">
              <FaPhone />
              <span>+91 9876543210</span>
            </div>
            <div className="footer-contact-item">
              <FaClock />
              <span>
                Mon - Fri: 9am - 6pm
                <br />
                Sat: 10am - 4pm
              </span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-4">
            <h3 className="footer-section-title">Stay Inspired</h3>
            <p className="footer-newsletter-text">
              Subscribe to receive updates on our latest laminate collections
              and interior design trends.
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Join</button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="copyright-section">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} Club Material Studio. All
            Collections Reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
            <span className="copyright-text">Powered By: Vrajsoft</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
