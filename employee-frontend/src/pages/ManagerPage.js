import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./ManagerPage.css"; // 🔥 Dedicated standalone style sheet

export default function ManagerPage() {
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const loadData = () => {
    api.get("/managers/").then((res) => setManagers(res.data));
    api.get("/departments/").then((res) => setDepartments(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addManager = async (e) => {
    if (e) e.preventDefault();
    if (!name || !username || !password || !email || !department) {
      alert("Please populate all credential input fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/managers/", {
        name,
        email,
        department,
        username,
        password,
      });

      setName("");
      setEmail("");
      setDepartment("");
      setUsername("");
      setPassword("");

      loadData();
    } catch (err) {
      console.error("Error adding manager profile record:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-management-wrapper">
      {/* Top Navigation Bar */}
      <div className="navbar">
        <span className="brand">⚙️ Manager Workspace Provisioning</span>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>

      <div className="container manager-layout">
        {/* Left Column: Input Form Card */}
        <div className="card form-card">
          <h3>👤 Create Manager Account</h3>
          <p className="card-subtitle">
            Deploy a new authorized unit coordinator into the management index.
          </p>

          <form onSubmit={addManager} className="form-group">
            <div className="input-field-block">
              <label>Full Profile Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                disabled={loading}
              />
            </div>

            <div className="input-field-block">
              <label>System Username ID</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eleanor_v"
                disabled={loading}
              />
            </div>

            <div className="input-field-block">
              <label>Default Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="input-field-block">
              <label>Corporate Email Route</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. e.vance@company.com"
                disabled={loading}
              />
            </div>

            <div className="input-field-block">
              <label>Assigned Operation Unit</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option value="">Choose Domain...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registering Workspace..." : "Authorize Account"}
            </button>
          </form>
        </div>

        {/* Right Column: Data Table Index Card */}
        <div className="card table-card">
          <header className="table-header-row">
            <h3>👥 Active Operational Managers</h3>
            <span className="counter-badge">
              Total Count: {managers.length}
            </span>
          </header>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Manager Name</th>
                  <th>Assigned Unit</th>
                  <th>Contact Email</th>
                  <th>Profile User Key</th>
                </tr>
              </thead>
              <tbody>
                {managers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      No management personnel registered. Populate the
                      generation form to declare assets.
                    </td>
                  </tr>
                ) : (
                  managers.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="font-medium">{m.first_name || m.name}</td>
                      <td>
                        <span className="badge-dept">
                          {m.department || "—"}
                        </span>
                      </td>
                      <td className="text-muted-email">{m.email}</td>
                      <td>
                        <code className="user-code-tag">{m.username}</code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
