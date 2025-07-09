import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setSuccess(`Logged in successfully as ${res.data.role}`);
      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "normal") {
          navigate("/user");
        } else if (res.data.role === "store_owner") {
          navigate("/store-owner");
        }
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred during login");
      console.error("Login error:", error.response?.data || error);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <p className="login-error">{error}</p>}
      {success && <p className="login-success">{success}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="login-input"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="login-input"
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <a href="/signup" className="login-link">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default Login;
