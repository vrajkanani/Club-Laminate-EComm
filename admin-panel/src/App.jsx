import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "./app/store";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./features/auth/AdminLogin";
import Dashboard from "./features/dashboard/Dashboard";
import AdminLayout from "./components/layout/AdminLayout";
import "./App.css";

import AddProduct from "./features/products/AddProduct";
import EditProduct from "./features/products/EditProduct";
import ProductsList from "./features/products/ProductsList";
import CategoryManagement from "./features/categories/CategoryManagement";
import CategoryProducts from "./features/categories/CategoryProducts";
import PartiesList from "./features/parties/PartiesList";
import PaymentsList from "./features/payments/PaymentsList";
import Reports from "./features/reports/Reports";
import AuditLogsList from "./features/audit/AuditLogsList";
import OrderList from "./features/sales-orders/OrderList";
import OrderDetails from "./features/sales-orders/OrderDetails";
import InventoryList from "./features/products/InventoryList";
import PurchaseOrdersList from "./features/purchase-orders/PurchaseOrdersList";
import AddPurchaseOrder from "./features/purchase-orders/AddPurchaseOrder";
import InquiryList from "./features/inquiries/InquiryList";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales-orders" element={<OrderList />} />
            <Route path="sales-orders/:id" element={<OrderDetails />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="categories/:slug" element={<CategoryProducts />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="purchase-orders" element={<PurchaseOrdersList />} />
            <Route path="purchase-orders/new" element={<AddPurchaseOrder />} />
            <Route path="parties" element={<PartiesList />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="inquiries" element={<InquiryList />} />
            <Route path="audit-logs" element={<AuditLogsList />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
