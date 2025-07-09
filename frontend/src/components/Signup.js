import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.styles.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("normal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !address || !password) {
      setError("All fields are required");
      return;
    }
    if (name.length < 20 || name.length > 60) {
      setError("Name must be between 20 and 60 characters");
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    if (address.length > 400) {
      setError("Address must be under 400 characters");
      return;
    }
    if (
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password)
    ) {
      setError(
        "Password must be 8-16 characters with at least one uppercase and one special character"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/auth/signup`,
        {
          name,
          email,
          address,
          password,
          role,
        }
      );
      setSuccess(`User registered successfully as ${response.data.role}`);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred during signup: " + error.message;
      setError(errorMessage);
      console.error("Signup error:", error.response?.data || error);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      {error && <p className="signup-error">{error}</p>}
      {success && <p className="signup-success">{success}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (20-60 characters)"
          className="signup-input"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="signup-input"
          required
        />
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (max 400 characters)"
          className="signup-textarea"
          required
        ></textarea>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
          className="signup-input"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="signup-input"
          required
        >
          <option value="normal">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
