import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("employee"); // Added role state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password.trim(),
        role, // send role along with other data
      });

      setMessage("✅ Registration successful! You can now log in.");
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setRole("employee"); // reset role
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "❌ Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
      <h2>📝 Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={handleInputChange(setName)}
          placeholder="Full Name"
          required
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          value={phone}
          onChange={handleInputChange(setPhone)}
          placeholder="Phone Number"
          required
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          placeholder="Email"
          required
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          placeholder="Password"
          required
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          value={passwordConfirm}
          onChange={handleInputChange(setPasswordConfirm)}
          placeholder="Confirm Password"
          required
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />

        <select
          value={role}
          onChange={handleInputChange(setRole)}
          disabled={loading}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default Register;
