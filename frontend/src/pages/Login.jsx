import { useState } from "react";
import API_URL from "../services/api";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (!email || !password) {
        setError("Please fill all fields");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setLoading(false);
        setEmail("");
        setPassword("");
        onLogin();
      }

      console.log("Login response:", data);
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

return (
  <div>
    <h1>Login</h1>

    {error && <p>{error}</p>}

    <form onSubmit={handleLogin}>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    <button type="button" onClick={onShowRegister}>
      Create an account
    </button>
  </div>
);
}

export default Login;