import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/sales-orders", icon: "📋", label: "Sales Orders" },
    { path: "/purchase-orders", icon: "📦", label: "Purchase Orders" },
    { path: "/products", icon: "🏷️", label: "Products" },
    { path: "/categories", icon: "📁", label: "Categories" },
    { path: "/inventory", icon: "📊", label: "Inventory" },
    { path: "/parties", icon: "👥", label: "Parties" },
    { path: "/payments", icon: "💰", label: "Payments" },
    { path: "/inquiries", icon: "✉️", label: "Inquiries" },
    { path: "/reports", icon: "📈", label: "Reports" },
    { path: "/audit-logs", icon: "📝", label: "Audit Logs" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h2>Club Laminate</h2>
          <p>Admin Panel</p>
        </div>
        <button className="sidebar-close" onClick={closeSidebar}>
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
