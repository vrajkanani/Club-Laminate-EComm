import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { partyAPI } from "../../services/api";

function PartiesList() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNo: "",
    type: "Customer",
  });

  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030"; // Unused
  // const token = localStorage.getItem("token"); // Unused

  const fetchParties = async () => {
    try {
      const res = await partyAPI.getAll();
      setParties(res.data);
    } catch (err) {
      toast.error("Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Added preventDefault just in case
    try {
      if (isEditing) {
        await partyAPI.update(formData._id, formData);
      } else {
        await partyAPI.create(formData);
      }

      toast.success(`Party ${isEditing ? "updated" : "added"} successfully`);
      setShowModal(false);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        gstNo: "",
        type: "Customer",
      });
      await fetchParties(); // Await fetchParties to ensure list is updated before potential other actions
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (party) => {
    // Map backend fields to frontend form state
    setFormData({
      _id: party._id,
      name: party.name,
      contactPerson: party.contactPerson,
      email: party.email || "",
      phone: party.phone,
      address:
        typeof party.address === "object"
          ? party.address?.street || ""
          : party.address || "",
      gstNo: party.gst || "",
      type: party.partyType
        ? party.partyType.charAt(0).toUpperCase() + party.partyType.slice(1)
        : "Customer", // Capitalize for select match
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Party?",
      text: "Are you sure you want to delete this party?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete It",
    });

    if (!result.isConfirmed) return;
    try {
      await partyAPI.delete(id);
      toast.success("Party deleted");
      fetchParties();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredParties = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm),
  );

  return (
    <div className="parties-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Parties & Contacts</h1>
          <p className="text-muted">Manage your customers and suppliers</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border shadow-sm px-3"
            onClick={fetchParties}
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
            onClick={() => {
              setIsEditing(false);
              setFormData({
                name: "",
                contactPerson: "",
                email: "",
                phone: "",
                address: "",
                gstNo: "",
                type: "Customer",
              });
              setShowModal(true);
            }}
          >
            <MdAdd size={20} /> Add Party
          </button>
        </div>
      </div>

      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-3">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span
              className="input-group-text bg-white border-end-0"
              style={{ borderRadius: "10px 0 0 10px" }}
            >
              <MdSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "0 10px 10px 0", padding: "10px" }}
            />
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading parties...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Name</th>
                  <th className="py-3 border-0">Type</th>
                  <th className="py-3 border-0">Contact</th>
                  <th className="py-3 border-0">GST No</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.length > 0 ? (
                  filteredParties.map((party) => (
                    <tr key={party._id}>
                      <td className="px-4 py-3 border-0">
                        <div className="fw-bold">{party.name}</div>
                        <div className="small text-muted">
                          {party.contactPerson}
                        </div>
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${party.partyType === "supplier" ? "bg-info-subtle text-info" : "bg-success-subtle text-success"}`}
                        >
                          {party.partyType
                            ? party.partyType.toUpperCase()
                            : "CUSTOMER"}
                        </span>
                      </td>
                      <td className="py-3 border-0">
                        <div>{party.phone}</div>
                        <div className="small text-muted">{party.email}</div>
                      </td>
                      <td className="py-3 border-0">
                        <code className="text-dark bg-light px-2 py-1 rounded">
                          {party.gst || "N/A"}
                        </code>
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleEdit(party)}
                          >
                            <MdEdit size={18} className="text-primary" />
                          </button>
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleDelete(party._id)}
                          >
                            <MdDelete size={18} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No parties found.
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow"
              style={{ borderRadius: "15px" }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {isEditing ? "Edit" : "New"} Party
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Party Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                        required
                        placeholder="Business or person name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Party Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                      >
                        <option value="Customer">Customer</option>
                        <option value="Supplier">Supplier</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                        placeholder="Representative name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Phone No</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                        placeholder="Mobile or landline"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">GST No</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.gstNo}
                        onChange={(e) =>
                          setFormData({ ...formData, gstNo: e.target.value })
                        }
                        style={{ borderRadius: "10px", padding: "10px" }}
                        placeholder="GSTIN Number"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Address</label>
                    <textarea
                      className="form-control"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      style={{ borderRadius: "10px", padding: "10px" }}
                      rows="2"
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
                    {isEditing ? "Update Party" : "Save Party"}
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

export default PartiesList;
