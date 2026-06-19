import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./EmployeeDashboard.css"; // 🔥 Import standalone CSS module

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
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
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (username) {
      api.get(`/user/${username}/`).then((res) => {
        const userData = res.data;
        setUser(userData);
        localStorage.setItem("managerId", userData.manager_id);

        api.get("/leaves/").then((res) => {
          const myLeaves = res.data.filter(
            (l) => l.employee_id === userData.id,
          );
          setLeaves(myLeaves);
        });

        api.get("/complaints/").then((res) => {
          const myComplaints = res.data.filter(
            (c) => c.employee_id === userData.id,
          );
          setComplaints(myComplaints);
        });
      });
    }
  }, [username]);

  const requestLeave = async () => {
    if (leaveReason && leaveStart && leaveEnd) {
      const payload = {
        employee_id: user?.id,
        manager_id: user?.manager_id,
        reason: leaveReason,
        start_date: leaveStart,
        end_date: leaveEnd,
        half_day: halfDay,
        status: "Pending",
      };
      const res = await api.post("/leaves/", payload);
      setLeaves([...leaves, res.data]);

      setLeaveReason("");
      setLeaveStart("");
      setLeaveEnd("");
      setHalfDay(false);
    }
  };

  const submitComplaint = async () => {
    if (complaintTitle && complaintDetails && complaintCategory) {
      const payload = {
        employee_id: user?.id,
        manager_id: user?.manager_id,
        title: complaintTitle,
        details: complaintDetails,
        category: complaintCategory,
        status: "Pending",
      };
      const res = await api.post("/complaints/", payload);
      setComplaints([...complaints, res.data]);

      setComplaintTitle("");
      setComplaintDetails("");
      setComplaintCategory("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="employee-dashboard-wrapper">
      {/* Top Navbar */}
      <div className="navbar">
        <span className="brand">👤 Employee Hub</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="container">
        {/* Welcome Banner */}
        <header className="dashboard-header">
          <h2>Welcome back, {user?.first_name || "Employee"}!</h2>
          <p className="role-tag">
            Role Assigned: <span>{user?.role || "Staff"}</span>
          </p>
        </header>

        <div className="dashboard-grid">
          {/* Section 1: Leave Requests Box */}
          <div className="card">
            <h3>📅 Request Time Off</h3>
            <div className="form-group">
              <input
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Reason for leave"
              />
              <div className="date-group">
                <div className="date-input-wrapper">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                  />
                </div>
                <div className="date-input-wrapper">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                  />
                </div>
              </div>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={halfDay}
                  onChange={(e) => setHalfDay(e.target.checked)}
                />
                <span>Apply as Half Day request</span>
              </label>

              <button className="primary-btn" onClick={requestLeave}>
                Submit Leave Request
              </button>
            </div>

            <hr className="divider" />

            <h4>My Filed Leaves History</h4>
            <ul className="data-list">
              {leaves.length === 0 ? (
                <p className="empty-row">No leave records found.</p>
              ) : (
                leaves.map((l, i) => (
                  <li key={l.id || i}>
                    <div className="list-main">
                      <strong>{l.reason}</strong>
                      <small>
                        📅 {l.start_date} to {l.end_date}
                      </small>
                      {l.half_day && (
                        <span className="halfday-tag">Half Day Request</span>
                      )}
                    </div>
                    <span
                      className={`status-badge ${l.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                    >
                      {l.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Section 2: Complaints Box */}
          <div className="card">
            <h3>⚠️ Raise an Issue / Complaint</h3>
            <div className="form-group">
              <input
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                placeholder="Complaint Title / Subject"
              />
              <input
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                placeholder="Category (e.g., HR, IT, Facility)"
              />
              <textarea
                value={complaintDetails}
                onChange={(e) => setComplaintDetails(e.target.value)}
                placeholder="Provide comprehensive details regarding the issue..."
                rows="3"
              />
              <button className="primary-btn" onClick={submitComplaint}>
                Submit Complaint
              </button>
            </div>

            <hr className="divider" />

            <h4>My Filed Complaints History</h4>
            <ul className="data-list">
              {complaints.length === 0 ? (
                <p className="empty-row">No complaints logged.</p>
              ) : (
                complaints.map((c, i) => (
                  <li key={c.id || i}>
                    <div className="list-main">
                      <strong>{c.title}</strong>
                      <span className="category-badge">{c.category}</span>
                      <p className="details-text">{c.details}</p>
                    </div>
                    <span
                      className={`status-badge ${c.status.includes("✅") ? "badge-success" : "badge-pending"}`}
                    >
                      {c.status}
                    </span>
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
