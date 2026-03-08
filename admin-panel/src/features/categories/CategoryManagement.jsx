import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdKeyboardBackspace,
  MdToggleOn,
  MdToggleOff,
  MdClose,
} from "react-icons/md";
import { categoryAPI } from "../../services/api";

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    showInHeader: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAdminAll();
      setCategories(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await categoryAPI.update(currentCategory._id, currentCategory);
      } else {
        await categoryAPI.create(currentCategory);
      }

      toast.success(
        `Category ${isEditing ? "updated" : "created"} successfully`,
      );
      setShowModal(false);
      setIsEditing(false);
      setCurrentCategory({ name: "", description: "", showInHeader: true });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleToggleActive = async (category) => {
    try {
      await categoryAPI.update(category._id, {
        isActive: !category.isActive,
      });
      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"}`,
      );
      fetchCategories();
    } catch (error) {
      toast.error("Error toggling status");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "Are you sure you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete It",
    });

    if (!result.isConfirmed) return;

    try {
      await categoryAPI.delete(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  return (
    <div className="category-management-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Categories</h1>
          <p className="text-muted">
            Manage product collections and categories
          </p>
        </div>
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
            setCurrentCategory({
              name: "",
              description: "",
              showInHeader: true,
            });
            setShowModal(true);
          }}
        >
          <MdAdd size={20} /> New Category
        </button>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading categories...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Name</th>
                  <th className="py-3 border-0">Slug</th>
                  <th className="py-3 border-0 text-center">Products</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="px-4 py-3 border-0">
                        <span className="fw-bold">{cat.name}</span>
                      </td>
                      <td className="py-3 border-0">
                        <code className="bg-light px-2 py-1 rounded">
                          /{cat.slug}
                        </code>
                      </td>
                      <td className="py-3 border-0 text-center">
                        <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3">
                          {cat.productCount || 0}
                        </span>
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${cat.isActive !== false ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                        >
                          {cat.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleToggleActive(cat)}
                            title={cat.isActive ? "Deactivate" : "Activate"}
                          >
                            {cat.isActive !== false ? (
                              <MdToggleOn size={22} className="text-success" />
                            ) : (
                              <MdToggleOff size={22} className="text-muted" />
                            )}
                          </button>
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleEdit(cat)}
                            title="Edit"
                          >
                            <MdEdit size={18} className="text-primary" />
                          </button>
                          <button
                            className="btn btn-light btn-sm rounded-circle p-2"
                            onClick={() => handleDelete(cat._id)}
                            title="Delete"
                          >
                            <MdDelete size={18} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-5 text-muted">
                      No categories found.
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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow"
              style={{ borderRadius: "15px" }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {isEditing ? "Edit" : "New"} Category
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentCategory.name}
                      onChange={(e) =>
                        setCurrentCategory({
                          ...currentCategory,
                          name: e.target.value,
                        })
                      }
                      style={{ borderRadius: "10px", padding: "12px" }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      value={currentCategory.description}
                      onChange={(e) =>
                        setCurrentCategory({
                          ...currentCategory,
                          description: e.target.value,
                        })
                      }
                      style={{ borderRadius: "10px", padding: "12px" }}
                      rows="3"
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
                    {isEditing ? "Update" : "Create"}
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

export default CategoryManagement;
