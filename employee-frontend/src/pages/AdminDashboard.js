import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // axios instance pointing to your backend
import "./AdminDashboard.css"; // 🔥 Dedicated standalone stylesheet

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);
  const [deptName, setDeptName] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  const loadData = () => {
    api.get("/departments/").then((res) => setDepartments(res.data));
    api.get("/leaves/").then((res) => setLeaves(res.data));
    api.get("/complaints/").then((res) => setComplaints(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addDepartment = async () => {
    if (deptName) {
      try {
        const payload = {
          name: deptName,
          created_by: localStorage.getItem("id"),
        };
        await api.post("/departments/", payload);
        const res = await api.get("/departments/");
        setDepartments(res.data);
        setDeptName("");
      } catch (err) {
        console.error("Error adding department:", err.response?.data || err);
      }
    }
  };

  const approveLeave = async (leaveId) => {
    try {
      await api.patch(`/leaves/${leaveId}/`, { status: "Approved ✅" });
      loadData();
    } catch (err) {
      console.error("Error approving leave:", err.response?.data || err);
    }
  };

  const approveComplaint = async (complaintId) => {
    try {
      await api.patch(`/complaints/${complaintId}/`, { status: "Approved ✅" });
      loadData();
    } catch (err) {
      console.error("Error approving complaint:", err.response?.data || err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top Navigation Bar */}
      <div className="navbar">
        <span className="brand">🛡️ Admin Dashboard</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Structural Container */}
      <div className="container">
        <header className="dashboard-header">
          <h2>System Control Overview</h2>
          <p>
            Provision corporate units, oversee macro operations, and resolve
            administrative escalations.
          </p>
        </header>

        {/* Layout Responsive Grid */}
        <div className="dashboard-grid">
          {/* Card 1: Departments Management */}
          <div className="card">
            <h3>🏢 Corporate Departments</h3>
            <div className="action-form-group">
              <input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Enter new department name..."
              />
              <button className="primary-btn" onClick={addDepartment}>
                + Add Unit
              </button>
            </div>

            <hr className="divider" />

            <h4>Active Corporate Units</h4>
            <div className="scrollable-list-container">
              <ul className="department-chips-list">
                {departments.length === 0 ? (
                  <p className="empty-row">No active departments declared.</p>
                ) : (
                  departments.map((d) => (
                    <li key={d.id} className="dept-chip">
                      <span>💼</span>
                      <strong className="dept-name">{d.name}</strong>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Card 2: Human Resources Hub */}
          <div className="card hr-hub-card">
            <div className="hr-hub-content">
              <h3>👥 Operational Human Resources</h3>
              <p className="text-muted">
                Audit system assignments, link department heads, control role
                privileges, and inspect company-wide rosters.
              </p>
            </div>
            <button
              className="navigation-action-btn"
              onClick={() => navigate("/manage-managers")}
            >
              Manage Management Matrix →
            </button>
          </div>

          {/* Card 3: Administrative Leaves */}
          <div className="card full-width">
            <h3>📅 Direct Leave Escalations</h3>
            <ul className="data-list">
              {leaves.filter((l) => l.manager_id === 0).length === 0 ? (
                <p className="empty-row">
                  No administrative leave requests awaiting actions.
                </p>
              ) : (
                leaves
                  .filter((l) => l.manager_id === 0)
                  .map((l) => (
                    <li key={l.id} className="actionable-item">
                      <div className="list-main">
                        <div className="list-title-row">
                          <strong>Reason: {l.reason}</strong>
                          <span
                            className={`status-badge ${l.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                          >
                            {l.status}
                          </span>
                        </div>
                        <p className="text-muted text-small">
                          ⏳ Operational Range: {l.start_date} to {l.end_date}
                        </p>
                        <span className="metadata-tag">
                          Applicant ID: #{l.employee_id}
                        </span>
                      </div>

                      {l.status === "Pending" && (
                        <button
                          className="approve-action-btn"
                          onClick={() => approveLeave(l.id)}
                        >
                          Approve Request
                        </button>
                      )}
                    </li>
                  ))
              )}
            </ul>
          </div>

          {/* Card 4: Administrative Complaints */}
          <div className="card full-width">
            <h3>⚠️ Direct Grievance Escalations</h3>
            <ul className="data-list">
              {complaints.filter((c) => c.manager_id === 0).length === 0 ? (
                <p className="empty-row">
                  No administrative grievances recorded.
                </p>
              ) : (
                complaints
                  .filter((c) => c.manager_id === 0)
                  .map((c) => (
                    <li key={c.id} className="actionable-item">
                      <div className="list-main">
                        <div className="list-title-row">
                          <strong>Subject: {c.title}</strong>
                          <span
                            className={`status-badge ${c.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="details-text-block">{c.details}</p>
                        <span className="metadata-tag">
                          Complainant ID: #{c.employee_id}
                        </span>
                      </div>

                      {c.status === "Pending" && (
                        <button
                          className="approve-action-btn resolve-variant"
                          onClick={() => approveComplaint(c.id)}
                        >
                          Approve & Close
                        </button>
                      )}
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
