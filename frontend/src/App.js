import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import Home from "./pages/home/Home";
import AboutUsPage from "./pages/about/AboutUsPage";
import ContactUsPage from "./pages/contact/ContactUsPage";
import Services from "./pages/services/Services";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BookNow from "./pages/orders/BookNow";
import Feedback from "./pages/orders/Feedback";
import MyOrders from "./pages/orders/MyOrders";
import DetailOrder from "./pages/orders/DetailOrder";
import Product from "./pages/products/Product";
import ClubLouvers1 from "./pages/products/ClubLouvers1";
import CategoryProducts from "./pages/products/CategoryProducts";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageNotFound from "./pages/others/PageNotFound";

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        {/* Auth routes outside main layout for standalone display */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/BookNow" element={<BookNow />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/Product" element={<Product />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:id" element={<DetailOrder />} />
          <Route path="/category/:slug" element={<CategoryProducts />} />
          <Route path="/AboutUsPage" element={<AboutUsPage />} />
          <Route path="/ContactUsPage" element={<ContactUsPage />} />
          <Route path="/ServicesPage" element={<Services />} />
          <Route path="/1 club louvers" element={<ClubLouvers1 />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
