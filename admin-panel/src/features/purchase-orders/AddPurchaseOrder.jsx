import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdAdd, MdDelete, MdKeyboardBackspace, MdSave } from "react-icons/md";
import { purchaseOrderAPI, partyAPI, productAPI } from "../../services/api";

function AddPurchaseOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [{ productId: "", quantity: 1, purchasePrice: 0, subtotal: 0 }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          partyAPI.getSuppliers(),
          productAPI.getAll(),
        ]);
        setSuppliers(suppliersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        toast.error("Failed to load dependencies");
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: "", quantity: 1, purchasePrice: 0, subtotal: 0 },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];

    if (field === "quantity" || field === "purchasePrice") {
      newItems[index][field] = parseFloat(value) || 0;
      newItems[index].subtotal =
        (newItems[index].quantity || 0) * (newItems[index].purchasePrice || 0);
    } else {
      newItems[index][field] = value;
    }

    // Auto-set price if product changes
    if (field === "productId") {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        newItems[index].purchasePrice = parseFloat(
          selectedProd.purchasePrice || selectedProd.price || 0,
        );
        newItems[index].subtotal =
          (newItems[index].quantity || 1) * newItems[index].purchasePrice;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) return toast.error("Please select a supplier");
    if (formData.items.some((item) => !item.productId))
      return toast.error("Please select products for all items");

    try {
      setLoading(true);
      await purchaseOrderAPI.create(formData);
      toast.success("Purchase Order created successfully");
      navigate("/purchase-orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create PO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-po-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link
            to="/purchase-orders"
            className="text-decoration-none text-muted small d-flex align-items-center gap-1 mb-2"
          >
            <MdKeyboardBackspace /> Back to List
          </Link>
          <h1>Create Purchase Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div
              className="card shadow-sm border-0 p-4 mb-4"
              style={{ borderRadius: "15px" }}
            >
              <h5 className="fw-bold mb-4">Order Items</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Product</th>
                      <th style={{ width: "15%" }}>Qty</th>
                      <th style={{ width: "20%" }}>Rate (₹)</th>
                      <th style={{ width: "20%" }}>Amount</th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border-0">
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value,
                              )
                            }
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} {p.sku ? `(${p.sku})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-0">
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </td>
                        <td className="border-0">
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "purchasePrice",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </td>
                        <td className="border-0 fw-bold">
                          ₹{item.subtotal.toLocaleString()}
                        </td>
                        <td className="border-0">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm border-0"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn btn-light text-primary fw-bold btn-sm d-flex align-items-center gap-1 mt-2"
                onClick={handleAddItem}
              >
                <MdAdd /> Add Another Item
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              className="card shadow-sm border-0 p-4 mb-4"
              style={{ borderRadius: "15px" }}
            >
              <h5 className="fw-bold mb-4">Broker & Delivery</h5>
              <div className="mb-3">
                <label className="form-label small fw-bold">Supplier</label>
                <select
                  className="form-select"
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedDeliveryDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Internal notes..."
                />
              </div>

              <div className="border-top pt-3 mb-4">
                <div className="d-flex justify-content-between align-items-center h4 mb-0">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold text-primary">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: "12px", fontWeight: "600" }}
                disabled={loading}
              >
                <MdSave size={20} />{" "}
                {loading ? "Creating..." : "Save Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddPurchaseOrder;
