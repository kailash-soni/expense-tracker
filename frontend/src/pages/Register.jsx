import { useState } from "react";
import API_URL from "../services/api";

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Register response:", data);

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setLoading(false);

      onRegister();
    } catch (error) {
      console.error("Register error:", error.message);
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

return (
  <div>
    <h1>Register</h1>

    {error && <p>{error}</p>}

    <form onSubmit={handleSubmit}>
      <label htmlFor="register-name">Name</label>
      <input
        id="register-name"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>

    <button type="button" onClick={onRegister}>
      Already have an account? Login
    </button>
  </div>

);

}

export default Register;