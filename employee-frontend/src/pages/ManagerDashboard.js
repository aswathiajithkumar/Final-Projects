import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./ManagerDashboard.css"; // 🔥 Custom standalone stylesheet

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [leaveReason, setLeaveReason] = useState("");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [halfDay, setHalfDay] = useState(false);

  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("");

  const navigate = useNavigate();
  const user = localStorage.getItem("id");
  const currentManagerId = parseInt(localStorage.getItem("id"));

  // Unified data load function to ensure state parity
  const loadData = () => {
    api.get("/employees/").then((res) => setEmployees(res.data));
    api.get("/leaves/").then((res) => setLeaves(res.data));
    api.get("/complaints/").then((res) => setComplaints(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addEmployee = async () => {
    try {
      await api.post("/employees/", {
        name: employeeName,
        username,
        password,
        email,
        manager_id: user,
      });
      setEmployeeName("");
      setUsername("");
      setPassword("");
      setEmail("");
      loadData(); // Re-fetch to seamlessly update state
    } catch (err) {
      console.error("Error adding employee:", err.response?.data || err);
    }
  };

  const approveLeave = async (leaveId) => {
    try {
      // Send the patch update to your Django backend
      await api.patch(`/leaves/${leaveId}/`, {
        status: "Approved ✅",
      });
      // 🔥 FIX: Re-fetch clean database records to sync state and filter out resolved records immediately
      loadData();
    } catch (err) {
      console.error("Error approving leave:", err.response?.data || err);
    }
  };

  const approveComplaint = async (complaintId) => {
    try {
      // Send the patch update to your Django backend
      await api.patch(`/complaints/${complaintId}/`, {
        status: "Approved ✅",
      });
      // 🔥 FIX: Re-fetch clean database records to sync state and filter out resolved records immediately
      loadData();
    } catch (err) {
      console.error("Error approving complaint:", err.response?.data || err);
    }
  };

  const raiseLeave = async () => {
    if (leaveReason && leaveStart && leaveEnd) {
      try {
        const payload = {
          employee_id: user,
          manager_id: 0,
          reason: leaveReason,
          start_date: leaveStart,
          end_date: leaveEnd,
          half_day: halfDay,
          status: "Pending",
        };
        await api.post("/leaves/", payload);
        setLeaveReason("");
        setLeaveStart("");
        setLeaveEnd("");
        setHalfDay(false);
        loadData();
      } catch (err) {
        console.error("Error raising leave:", err);
      }
    }
  };

  const raiseComplaint = async () => {
    if (complaintTitle && complaintDetails && complaintCategory) {
      try {
        const payload = {
          employee_id: user,
          manager_id: 0,
          title: complaintTitle,
          details: complaintDetails,
          category: complaintCategory,
          status: "Pending",
        };
        await api.post("/complaints/", payload);
        setComplaintTitle("");
        setComplaintDetails("");
        setComplaintCategory("");
        loadData();
      } catch (err) {
        console.error("Error raising complaint:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    navigate("/login");
  };

  return (
    <div className="manager-dashboard-wrapper">
      {/* Navbar Section */}
      <div className="navbar">
        <span className="brand">💼 Manager Dashboard</span>
        <div className="nav-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <header className="dashboard-header">
          <h2>Overview & Team Actions</h2>
          <p>
            Manage team operations, submit requests, and handle direct report
            escalations.
          </p>
        </header>

        <div className="dashboard-grid">
          {/* Card 1: Add Employee */}
          <div className="card">
            <h3>Item Production: Add Team Employee</h3>
            <div className="form-layout-stack">
              <input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Employee Name"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Employee Username"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Employee Password"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Employee Email"
              />
              <button className="primary-btn" onClick={addEmployee}>
                Add Employee
              </button>
            </div>
          </div>

          {/* Card 2: Raise Leave */}
          <div className="card">
            <h3>📅 File Personal Leave</h3>
            <div className="form-layout-stack">
              <input
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Leave Reason"
              />
              <div className="date-group">
                <input
                  type="date"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                />
                <input
                  type="date"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                />
              </div>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={halfDay}
                  onChange={(e) => setHalfDay(e.target.checked)}
                />
                <span>Apply as Half Day request</span>
              </label>
              <button className="primary-btn" onClick={raiseLeave}>
                Submit Leave
              </button>
            </div>
          </div>

          {/* Card 3: Raise Complaint */}
          <div className="card">
            <h3>⚠️ Escalate a Complaint</h3>
            <div className="form-layout-stack">
              <input
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                placeholder="Complaint Title"
              />
              <input
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                placeholder="Category (e.g., IT, HR)"
              />
              <textarea
                value={complaintDetails}
                onChange={(e) => setComplaintDetails(e.target.value)}
                placeholder="Detailed explanation..."
                rows="3"
              />
              <button className="primary-btn" onClick={raiseComplaint}>
                Submit Complaint
              </button>
            </div>
          </div>

          {/* Card 4: Active Employees */}
          <div className="card full-width">
            <h3>👥 Active Team Roster</h3>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter((e) => e.manager_id === currentManagerId)
                    .length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-row">
                        No active employees under your management.
                      </td>
                    </tr>
                  ) : (
                    employees
                      .filter((e) => e.manager_id === currentManagerId)
                      .map((e, i) => (
                        <tr key={e.id || i}>
                          <td className="font-medium">
                            {e.first_name || e.name}
                          </td>
                          <td className="text-muted">{e.email}</td>
                          <td>
                            <code className="user-code-tag">{e.username}</code>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 5: Your Leaves */}
          <div className="card">
            <h3>📋 Your Filed Leaves</h3>
            <ul className="data-list">
              {leaves.filter((c) => c.employee_id === currentManagerId)
                .length === 0 ? (
                <p className="empty-row">No leaves filed.</p>
              ) : (
                leaves
                  .filter((c) => c.employee_id === currentManagerId)
                  .map((l, i) => (
                    <li key={l.id || i}>
                      <div className="list-main">
                        <strong>{l.reason}</strong>
                        <small className="text-muted">
                          {l.start_date} → {l.end_date}
                        </small>
                      </div>
                      <span
                        className={`badge ${l.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                      >
                        {l.status}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </div>

          {/* Card 6: Your Complaints */}
          <div className="card">
            <h3>📋 Your Filed Complaints</h3>
            <ul className="data-list">
              {complaints.filter((c) => c.employee_id === currentManagerId)
                .length === 0 ? (
                <p className="empty-row">No complaints filed.</p>
              ) : (
                complaints
                  .filter((c) => c.employee_id === currentManagerId)
                  .map((c, i) => (
                    <li key={c.id || i}>
                      <div className="list-main">
                        <strong>{c.title}</strong>
                        <p className="text-muted text-small">{c.details}</p>
                      </div>
                      <span
                        className={`badge ${c.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                      >
                        {c.status}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </div>

          {/* Card 7: Direct Report Leaves */}
          <div className="card">
            <h3>📥 Team Leave Requests</h3>
            <ul className="data-list">
              {leaves.filter((l) => l.manager_id === currentManagerId)
                .length === 0 ? (
                <p className="empty-row">No pending team leaves.</p>
              ) : (
                leaves
                  .filter((l) => l.manager_id === currentManagerId)
                  .map((l, i) => (
                    <li key={l.id || i} className="actionable-item">
                      <div className="list-main">
                        <strong>{l.reason}</strong>
                        <small className="text-muted">
                          {l.start_date} → {l.end_date}
                        </small>
                        <span className="emp-tag">
                          Emp ID: #{l.employee_id}
                        </span>
                      </div>
                      {!l.status.includes("✅") ? (
                        <button
                          className="approve-btn"
                          onClick={() => approveLeave(l.id)}
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="badge badge-success">Approved ✅</span>
                      )}
                    </li>
                  ))
              )}
            </ul>
          </div>

          {/* Card 8: Direct Report Complaints */}
          <div className="card">
            <h3>📥 Team Complaints</h3>
            <ul className="data-list">
              {complaints.filter((c) => c.manager_id === currentManagerId)
                .length === 0 ? (
                <p className="empty-row">No pending team complaints.</p>
              ) : (
                complaints
                  .filter((c) => c.manager_id === currentManagerId)
                  .map((c, i) => (
                    <li key={c.id || i} className="actionable-item">
                      <div className="list-main">
                        <strong>{c.title}</strong>
                        <p className="text-muted text-small">{c.details}</p>
                        <span className="emp-tag">
                          Emp ID: #{c.employee_id}
                        </span>
                      </div>
                      {!c.status.includes("✅") ? (
                        <button
                          className="approve-btn resolve-variant"
                          onClick={() => approveComplaint(c.id)}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="badge badge-success">Resolved ✅</span>
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
