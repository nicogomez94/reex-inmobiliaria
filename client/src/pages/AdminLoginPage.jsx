import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { isLoggedIn, saveSession } from "../lib/auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) {
    return <Navigate to="/admin/properties" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.login({ username, password });
      saveSession(result.token, result.user);
      navigate("/admin/properties");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page container">
      <p className="section-kicker">REEX INMOBILIARIA</p>
      <h1 className="page-title">Acceso al panel</h1>
      <form className="admin-login" onSubmit={handleSubmit}>
        <label>
          Usuario
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Clave
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn-main" disabled={loading}>
          {loading ? "Ingresando..." : "INGRESAR"}
        </button>
      </form>
    </main>
  );
}
