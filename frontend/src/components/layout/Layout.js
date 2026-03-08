import React from "react";
import Header from "./Header.js";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { PiArrowFatUpDuotone } from "react-icons/pi";

function Layout() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="main-layout">
      <Header />
      <main className="content-area">
        <Outlet />
      </main>
      <button
        className="scroll-to-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <PiArrowFatUpDuotone size={25} />
      </button>
      <Footer />
    </div>
  );
}

export default Layout;
