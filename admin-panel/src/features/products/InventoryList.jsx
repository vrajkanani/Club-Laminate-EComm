import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdSearch, MdEdit, MdWarning, MdCheckCircle } from "react-icons/md";
import { stockAPI } from "../../services/api";

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, low

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = filter === "low" ? { lowStock: true } : {};
      const response = await stockAPI.getAll(params);
      setInventory(response.data.products || []);
    } catch (err) {
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const handleAdjustStock = async (product) => {
    const { value: formValues } = await Swal.fire({
      title: `Update Stock: ${product.name}`,
      html:
        `<label class="form-label">New Stock Quantity</label>` +
        `<input id="swal-input1" class="swal2-input" type="number" value="${product.stockQuantity || product.stock || 0}">` +
        `<label class="form-label">Reason for adjustment</label>` +
        `<input id="swal-input2" class="swal2-input" placeholder="e.g. Stock count corrective">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
        ];
      },
    });

    if (formValues) {
      try {
        const [newQuantity, reason] = formValues;
        await stockAPI.adjust(product._id, {
          newQuantity: parseInt(newQuantity),
          reason,
        });
        toast.success("Stock adjusted successfully");
        fetchInventory();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to adjust stock");
      }
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="inventory-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted">
            Monitor stock levels and manage reorder points
          </p>
        </div>
        <button
          className="btn btn-light border shadow-sm px-3"
          onClick={fetchInventory}
          style={{ borderRadius: "10px", fontWeight: "600" }}
        >
          Refresh
        </button>
      </div>

      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span
                  className="input-group-text bg-white border-end-0"
                  style={{ borderRadius: "10px 0 0 10px" }}
                >
                  <MdSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: "0 10px 10px 0", padding: "10px" }}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end gap-2">
              <button
                className={`btn px-4 ${filter === "all" ? "btn-primary" : "btn-light"}`}
                onClick={() => setFilter("all")}
                style={{ borderRadius: "10px", fontWeight: "600" }}
              >
                All Products
              </button>
              <button
                className={`btn px-4 ${filter === "low" ? "btn-danger" : "btn-light"}`}
                onClick={() => setFilter("low")}
                style={{ borderRadius: "10px", fontWeight: "600" }}
              >
                Low Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading inventory...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Product</th>
                  <th className="py-3 border-0 text-center">Current Stock</th>
                  <th className="py-3 border-0 text-center">Reserved</th>
                  <th className="py-3 border-0 text-center">Reorder Level</th>
                  <th className="py-3 border-0 text-center">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const currentStock = item.stockQuantity || item.stock || 0;
                    const isLow = currentStock <= (item.reorderLevel || 10);
                    return (
                      <tr key={item._id}>
                        <td className="px-4 py-3 border-0">
                          <div className="fw-bold">{item.name}</div>
                          <div className="small text-muted">
                            {item.sku || "No SKU"}
                          </div>
                        </td>
                        <td className="py-3 border-0 text-center fw-bold">
                          {currentStock}
                        </td>
                        <td className="py-3 border-0 text-center text-muted">
                          {item.reservedStock || 0}
                        </td>
                        <td className="py-3 border-0 text-center">
                          {item.reorderLevel || 10}
                        </td>
                        <td className="py-3 border-0 text-center">
                          {isLow ? (
                            <span
                              className="badge bg-danger-subtle text-danger px-3 py-2"
                              style={{ borderRadius: "8px" }}
                            >
                              <MdWarning className="me-1" /> Low Stock
                            </span>
                          ) : (
                            <span
                              className="badge bg-success-subtle text-success px-3 py-2"
                              style={{ borderRadius: "8px" }}
                            >
                              <MdCheckCircle className="me-1" /> Sufficient
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border-0 text-end">
                          <button
                            className="btn btn-light btn-sm rounded-pill px-3 py-2"
                            onClick={() => handleAdjustStock(item)}
                            title="Adjust Stock"
                          >
                            <MdEdit className="text-primary me-1" /> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-5 text-muted">
                      No products found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryList;
