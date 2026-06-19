import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Axios instance pointing to Django backend
import "./Login.css"; // 🔥 Dedicated standalone style sheet

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // default role
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Call Django backend with username, password, and role
      const res = await api.post("/login/", { username, password, role });

      // Save role and username returned by backend
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("id", res.data.activeperson);

      // Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (res.data.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMessage(
        "Invalid credentials. Please verify your identity data and portal selection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-panel-wrapper">
      {/* Structural Top Banner */}
      <div className="navbar">
        <span className="brand">📋 Employee Management System</span>
      </div>

      <div className="login-container">
        <div className="login-card">
          <header className="login-header">
            <h2>Account Access Portal</h2>
            <p>
              Select your operational domain and sign in with your unique
              workspace profile key.
            </p>
          </header>

          {errorMessage && (
            <div className="error-banner">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            {/* Identity Field inputs */}
            <div className="field-group">
              <label className="field-label">Username ID</label>
              <input
                type="text"
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Security Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Segmented Radio Controls */}
            <div className="role-selector-zone">
              <span className="field-label">Portal Destination</span>
              <div className="segmented-control">
                <label
                  className={`segment-item ${role === "admin" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  />
                  <span>Admin</span>
                </label>

                <label
                  className={`segment-item ${role === "manager" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="manager"
                    checked={role === "manager"}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  />
                  <span>Manager</span>
                </label>

                <label
                  className={`segment-item ${role === "employee" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value="employee"
                    checked={role === "employee"}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  />
                  <span>Employee</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="login-action-btn"
              disabled={loading}
            >
              {loading ? "Authenticating Session..." : "Secure Authorization"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
