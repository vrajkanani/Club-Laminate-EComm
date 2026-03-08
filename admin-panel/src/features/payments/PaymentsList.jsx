import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MdAdd,
  MdAccountBalanceWallet,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { paymentAPI, partyAPI } from "../../services/api";

function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    partyId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    transactionRef: "",
    type: "Inward",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [payRes, partyRes] = await Promise.all([
        paymentAPI.getAll(),
        partyAPI.getAll(),
      ]);

      setPayments(payRes.data);
      setParties(partyRes.data);
    } catch (err) {
      toast.error("Failed to fetch payment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create(formData);
      toast.success("Payment recorded successfully");
      setShowModal(false);
      setFormData({
        partyId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "cash",
        transactionRef: "",
        type: "Inward",
        notes: "",
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <div className="payments-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Payments & Ledger</h1>
          <p className="text-muted">
            Track inward and outward financial transactions
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border shadow-sm px-4 py-2"
            onClick={fetchData}
            style={{ borderRadius: "10px", fontWeight: "600" }}
          >
            Refresh
          </button>
          <button
            className="btn px-4 py-2 d-flex align-items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
            }}
            onClick={() => setShowModal(true)}
          >
            <MdAdd size={20} /> Record Payment
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-white h-100"
            style={{ background: "var(--success-gradient)" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                  <MdAccountBalanceWallet size={24} />
                </div>
              </div>
              <h6 className="text-white text-opacity-75 small text-uppercase fw-bold mb-1">
                Total Inward
              </h6>
              <h3 className="fw-bold mb-0">
                ₹
                {payments
                  .filter((p) => p.type === "Inward")
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-white h-100"
            style={{ background: "var(--danger-gradient)" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                  <MdAccountBalanceWallet size={24} />
                </div>
              </div>
              <h6 className="text-white text-opacity-75 small text-uppercase fw-bold mb-1">
                Total Outward
              </h6>
              <h3 className="fw-bold mb-0">
                ₹
                {payments
                  .filter((p) => p.type === "Outward")
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading payments...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Date</th>
                  <th className="py-3 border-0">Party / User</th>
                  <th className="py-3 border-0">Method</th>
                  <th className="py-3 border-0">Type</th>
                  <th className="py-3 border-0 text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3 border-0">
                        {new Date(
                          payment.paymentDate || payment.createdAt,
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 border-0">
                        <div className="fw-bold">
                          {payment.partyId?.name ||
                            payment.userId?.fullName ||
                            "N/A"}
                        </div>
                        <div className="small text-muted">
                          {payment.transactionRef || payment.paymentNumber}
                        </div>
                      </td>
                      <td className="py-3 border-0">{payment.paymentMode}</td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${payment.type === "Inward" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                        >
                          {payment.type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 border-0 text-end fw-bold ${payment.type === "Inward" ? "text-success" : "text-danger"}`}
                      >
                        {payment.type === "Inward" ? "+" : "-"}₹
                        {payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow"
              style={{ borderRadius: "15px" }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Record Transaction</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Party</label>
                    <select
                      className="form-select"
                      required
                      value={formData.partyId}
                      onChange={(e) =>
                        setFormData({ ...formData, partyId: e.target.value })
                      }
                      style={{ borderRadius: "10px", padding: "10px" }}
                    >
                      <option value="">Select Party</option>
                      {parties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                      >
                        <option value="Inward">
                          Inward (Payment Received)
                        </option>
                        <option value="Outward">Outward (Payment Made)</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.paymentDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentDate: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Method</label>
                      <select
                        className="form-select"
                        value={formData.paymentMode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMode: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Reference / Note
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.transactionRef}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transactionRef: e.target.value,
                        })
                      }
                      placeholder="Transaction ID or Cheque No"
                      style={{ borderRadius: "10px", padding: "10px" }}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    onClick={() => setShowModal(false)}
                    style={{ borderRadius: "10px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn px-4"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsList;
