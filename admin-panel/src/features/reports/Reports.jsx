import React, { useState, useEffect } from "react";
import {
  MdTrendingUp,
  MdShoppingCart,
  MdInventory,
  MdAttachMoney,
  MdBarChart,
  MdLayers,
  MdEmail,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { reportAPI } from "../../services/api";

function Reports() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingInquiries: 0,
    salesTrend: [],
    inventoryEfficiency: {
      utilizationRate: 0,
      totalStock: 0,
      totalReserved: 0,
      idleCapacity: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = () => {
    setLoading(true);
    reportAPI
      .getSummary()
      .then((response) => {
        setSummary(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${(summary.totalRevenue || 0).toLocaleString()}`,
      change: null,
      icon: <MdAttachMoney size={24} />,
      gradient: "var(--success-gradient)",
    },
    {
      title: "Confirmed Orders",
      value: summary.confirmedOrders,
      change: null,
      icon: <MdTrendingUp size={24} />,
      gradient: "var(--primary-gradient)",
    },
    {
      title: "Pending Orders",
      value: summary.pendingOrders,
      change: "Action Required",
      icon: <MdShoppingCart size={24} />,
      gradient: "var(--warning-gradient)",
    },
    {
      title: "Pending Inquiries",
      value: summary.pendingInquiries,
      change: "Response Needed",
      icon: <MdEmail size={24} />,
      gradient: "var(--danger-gradient)",
      link: "/inquiries",
    },
  ];

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="container-fluid py-4 px-4">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title h2 fw-bold mb-1">Business Intelligence</h1>
          <p className="text-secondary small">
            Real-time performance analytics and insights
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm px-3 shadow"
            onClick={fetchSummary}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-xl-3 col-md-6">
            <div
              className={`card shadow-sm h-100 overflow-hidden ${stat.link ? "cursor-pointer" : ""}`}
              onClick={() => stat.link && navigate(stat.link)}
              style={stat.link ? { cursor: "pointer" } : {}}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="rounded-3 p-2 shadow-sm text-white"
                    style={{ background: stat.gradient }}
                  >
                    {stat.icon}
                  </div>
                  {stat.change && (
                    <span
                      className={`badge ${
                        stat.change.includes("+")
                          ? "bg-success-subtle text-success"
                          : stat.change.includes("-")
                            ? "bg-danger-subtle text-danger"
                            : "bg-primary-subtle text-primary"
                      }`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <h6 className="text-muted fw-semibold small text-uppercase mb-2">
                  {stat.title}
                </h6>
                <h3 className="fw-bold mb-0">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
              <h5 className="fw-bold mb-0">Sales Performance</h5>
              <div className="dropdown">
                <button
                  className="btn btn-light btn-sm dropdown-toggle border"
                  type="button"
                >
                  Last 7 Days
                </button>
              </div>
            </div>
            <div className="card-body p-4 pt-0">
              <div
                className="mt-4"
                style={{
                  height: "350px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  gap: "12px",
                }}
              >
                {summary.salesTrend?.length > 0 ? (
                  summary.salesTrend.map((data, i) => {
                    // Calculate max amount for scaling with buffer
                    const highestVal = Math.max(
                      ...summary.salesTrend.map((s) => s.amount),
                      1000,
                    );
                    const bufferedMax = highestVal * 1.2;
                    const height = (data.amount / bufferedMax) * 100;

                    return (
                      <div
                        key={i}
                        className="w-100 position-relative group"
                        style={{
                          height: `${Math.max(height, 5)}%`,
                          maxWidth: "60px",
                        }}
                      >
                        <div
                          className="h-100 w-100 rounded-top shadow-sm position-relative overflow-hidden bar-transition"
                          style={{
                            background:
                              height > 0
                                ? "var(--primary-gradient)"
                                : "rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          {height > 0 && (
                            <div className="bar-value-top">
                              ₹
                              {data.amount >= 1000
                                ? `${(data.amount / 1000).toFixed(1)}k`
                                : data.amount}
                            </div>
                          )}
                          {height > 0 && (
                            <div className="chart-tooltip-value">
                              ₹{data.amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div
                          className="text-center mt-2 small text-muted d-block fw-bold"
                          style={{ fontSize: "10px" }}
                        >
                          {data.dayName}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted small">
                    No sales data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Inventory Efficiency</h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
              <div
                className="position-relative d-flex align-items-center justify-content-center mb-4"
                style={{ width: "180px", height: "180px" }}
              >
                <svg className="w-100 h-100" viewBox="0 0 36 36">
                  <path
                    className="text-light"
                    strokeDasharray="100, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    stroke="currentColor"
                    style={{ opacity: 0.1 }}
                  ></path>
                  <path
                    className="text-primary"
                    strokeDasharray={`${summary.inventoryEfficiency?.utilizationRate || 0}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    stroke="var(--primary-gradient)"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  ></path>
                </svg>
                <div className="position-absolute text-center">
                  <h3 className="fw-bold mb-0">
                    {summary.inventoryEfficiency?.utilizationRate || 0}%
                  </h3>
                  <span className="small text-muted">Utilization</span>
                </div>
              </div>
              <div className="w-100 space-y-3 mt-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-primary me-2"
                      style={{
                        width: "10px",
                        height: "10px",
                        background: "var(--primary-gradient)",
                      }}
                    ></div>
                    <span className="small text-muted">Total Stock</span>
                  </div>
                  <span className="fw-bold small">
                    {summary.inventoryEfficiency?.totalStock || 0} Units
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-warning me-2"
                      style={{ width: "10px", height: "10px" }}
                    ></div>
                    <span className="small text-muted">Reserved</span>
                  </div>
                  <span className="fw-bold small">
                    {summary.inventoryEfficiency?.totalReserved || 0} Units
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-light border me-2"
                      style={{ width: "10px", height: "10px" }}
                    ></div>
                    <span className="small text-muted">Idle Capacity</span>
                  </div>
                  <span className="fw-bold small">
                    {summary.inventoryEfficiency?.idleCapacity || 0} Units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
