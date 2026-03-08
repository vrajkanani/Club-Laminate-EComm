import React, { useState, useEffect } from "react";
import { MdHistory, MdFilterList, MdInfoOutline } from "react-icons/md";
import { auditLogAPI } from "../../services/api";

function AuditLogsList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogAPI
      .getAll()
      .then((response) => {
        setLogs(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="audit-logs-container" style={{ padding: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Audit Logs</h1>
          <p className="text-muted">History of system actions and changes</p>
        </div>
        <button
          className="btn btn-light d-flex align-items-center gap-2"
          style={{ borderRadius: "10px" }}
        >
          <MdFilterList /> Filter Logs
        </button>
      </div>

      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "15px", overflow: "hidden" }}
      >
        {loading ? (
          <div className="p-5 text-center">Loading logs...</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">Timestamp</th>
                  <th className="py-3 border-0">User</th>
                  <th className="py-3 border-0">Action</th>
                  <th className="py-3 border-0">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-4 py-3 border-0 small text-muted">
                        {new Date(
                          log.createdAt || log.timestamp,
                        ).toLocaleString() !== "Invalid Date"
                          ? new Date(
                              log.createdAt || log.timestamp,
                            ).toLocaleString()
                          : "Unknown Date"}
                      </td>
                      <td className="py-3 border-0">
                        <div className="fw-bold">
                          {log.user?.fullName || "System"}
                        </div>
                        <div className="small text-muted">
                          {log.user?.email || ""}
                        </div>
                      </td>
                      <td className="py-3 border-0">
                        <span
                          className={`badge ${
                            log.action.includes("Delete")
                              ? "bg-danger-subtle text-danger"
                              : log.action.includes("Create")
                                ? "bg-success-subtle text-success"
                                : "bg-primary-subtle text-primary"
                          }`}
                          style={{ padding: "6px 12px" }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 border-0">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="text-truncate"
                            style={{ maxWidth: "300px" }}
                          >
                            {log.details || "No details provided"}
                          </span>
                          <MdInfoOutline
                            className="text-muted cursor-pointer"
                            title={log.details}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-5 text-muted">
                      No activity logs found.
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

export default AuditLogsList;
