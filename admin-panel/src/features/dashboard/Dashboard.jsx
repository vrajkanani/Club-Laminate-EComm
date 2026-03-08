import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { reportAPI, stockAPI } from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch summary reports
      const reportResponse = await reportAPI.getSummary();
      const summary = reportResponse.data;

      // Fetch low stock products
      const lowStockResponse = await stockAPI.getLowStock();
      const lowStockProducts = lowStockResponse.data || [];

      setStats({
        totalSales:
          (summary.pendingOrders || 0) + (summary.confirmedOrders || 0),
        pendingOrders: summary.pendingOrders || 0,
        lowStockProducts: lowStockProducts.length,
        monthlyRevenue: summary.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName || "Admin"}!</h1>
        <div className="d-flex align-items-center gap-3">
          <p className="mb-0">Here's what's happening with your store today.</p>
          <button
            className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
            onClick={fetchDashboardStats}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <div className="dashboard-widgets">
          <div className="widget widget-primary">
            <div className="widget-icon">📊</div>
            <div className="widget-content">
              <h3>Total Sales</h3>
              <p className="widget-value">{stats.totalSales}</p>
              <span className="widget-label">All time orders</span>
            </div>
          </div>

          <div className="widget widget-warning">
            <div className="widget-icon">⏳</div>
            <div className="widget-content">
              <h3>Pending Orders</h3>
              <p className="widget-value">{stats.pendingOrders}</p>
              <span className="widget-label">Awaiting confirmation</span>
            </div>
          </div>

          <div className="widget widget-danger">
            <div className="widget-icon">📦</div>
            <div className="widget-content">
              <h3>Low Stock</h3>
              <p className="widget-value">{stats.lowStockProducts}</p>
              <span className="widget-label">Products need restock</span>
            </div>
          </div>

          <div className="widget widget-success">
            <div className="widget-icon">💰</div>
            <div className="widget-content">
              <h3>Monthly Revenue</h3>
              <p className="widget-value">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </p>
              <span className="widget-label">This month</span>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/sales-orders" className="quick-action-card">
            <span className="action-icon">📋</span>
            <span>View Orders</span>
          </Link>
          <Link to="/products" className="quick-action-card">
            <span className="action-icon">🏷️</span>
            <span>Manage Products</span>
          </Link>
          <Link to="/inventory" className="quick-action-card">
            <span className="action-icon">📊</span>
            <span>Check Inventory</span>
          </Link>
          <Link to="/purchase-orders/new" className="quick-action-card">
            <span className="action-icon">➕</span>
            <span>New Purchase Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
