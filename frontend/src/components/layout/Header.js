import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdAccountCircle, MdLogout } from "react-icons/md";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [categories, setCategories] = useState([]);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories`,
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };

    const handleClickOutside = (event) => {
      const productDropdown = document.querySelector(".nav-item.dropdown");
      if (productDropdown && !productDropdown.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
    };

    const handleCategoryUpdate = () => {
      console.log("Real-time category update triggered");
      fetchCategories();
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("categoryUpdate", handleCategoryUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("categoryUpdate", handleCategoryUpdate);
    };
  }, [isProductDropdownOpen, fetchCategories]);

  const handleToggle = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  const handleNavLinkClick = () => {
    setIsNavbarCollapsed(true);
    setIsProductDropdownOpen(false);
  };

  const toggleProductDropdown = (e) => {
    e.preventDefault();
    setIsProductDropdownOpen(!isProductDropdownOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to end your session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c5a059",
      cancelButtonColor: "#1a1a1a",
      confirmButtonText: "Logout",
      background: "#0a0a0b",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("fullName");
        toast.success("See you again soon!");
        navigate("/");
      }
    });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Our Products", path: "/Product" },
    { name: "Book Now", path: "/BookNow" },
    { name: "My Orders", path: "/my-orders" },
    { name: "About Us", path: "/AboutUsPage" },
    { name: "Contact Us", path: "/ContactUsPage" },
  ];

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${scrolled ? "scrolled" : "bg-transparent"}`}
    >
      <div className="container px-4 d-flex align-items-center">
        <Link to="/" className="navbar-brand" onClick={handleNavLinkClick}>
          <div className="logo-text-wrapper">
            <span className="logo-main">CLUB</span>
            <span className="logo-sub">MATERIAL STUDIO</span>
          </div>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleToggle}
          aria-expanded={!isNavbarCollapsed}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isNavbarCollapsed ? "" : "show"}`}
        >
          <ul className="navbar-nav ms-auto align-items-center">
            {navLinks.map((link) => (
              <li
                key={link.name}
                className={`nav-item ${link.name === "Our Products" ? "dropdown" : ""} ${location.pathname === link.path ? "active" : ""}`}
              >
                {link.name === "Our Products" ? (
                  <div className="nav-item-wrapper dropdown">
                    <Link
                      to="#"
                      className={`nav-link dropdown-toggle ${isProductDropdownOpen ? "show" : ""}`}
                      onClick={toggleProductDropdown}
                    >
                      {link.name}
                    </Link>
                    <div
                      className={`dropdown-menu-simple ${isProductDropdownOpen ? "show" : ""}`}
                    >
                      <Link
                        to="/Product"
                        className="dropdown-item-simple"
                        onClick={handleNavLinkClick}
                      >
                        All Products
                      </Link>
                      {categories
                        .filter(
                          (cat) =>
                            cat.isActive !== false &&
                            cat.showInHeader !== false,
                        )
                        .map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/category/${cat.slug}`}
                            className="dropdown-item-simple"
                            onClick={handleNavLinkClick}
                          >
                            {cat.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className="nav-link"
                    onClick={handleNavLinkClick}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}

            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              {token ? (
                <div
                  className="d-flex align-items-center gap-3 nav-link py-0"
                  style={{ cursor: "pointer", opacity: 1 }}
                  onClick={handleLogout}
                >
                  <MdLogout size={22} className="text-gold" />
                  <span className="d-lg-none">Logout</span>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="nav-link py-0"
                  onClick={handleNavLinkClick}
                  style={{ opacity: 1 }}
                >
                  <MdAccountCircle size={28} className="text-gold" />
                  <span className="d-lg-none ml-2">Login</span>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
