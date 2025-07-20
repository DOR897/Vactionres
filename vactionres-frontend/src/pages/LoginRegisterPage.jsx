import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../utils/api';
import GoogleAuth from './GoogleAuth';

const LoginRegisterPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let userData;
      if (isRegistering) {
        userData = await registerUser({
          username: email,
          email,
          password,
        });
      } else {
        userData = await loginUser({ email, password });
      }

      const userObj = {
        id: userData.user_id || userData.id,
        email: userData.email,
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      navigate('/search');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center text-center"
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "25px",
          padding: "3rem",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {isRegistering ? "🚀" : "🔐"}
          </div>
          <h2
            style={{
              color: "#2c3e50",
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ color: "#7f8c8d", fontSize: "1.1rem", margin: 0 }}>
            {isRegistering
              ? "Join us and start planning your next adventure!"
              : "Sign in to access your travel plans"}
          </p>
        </div>

        {/* Google Auth Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleAuth clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} setUser={setUser} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <hr style={{ flex: 1, border: 0, borderTop: '1px solid #e1e8ed' }} />
          <span style={{ margin: '0 1rem', color: '#7f8c8d', fontWeight: 500 }}>or</span>
          <hr style={{ flex: 1, border: 0, borderTop: '1px solid #e1e8ed' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="email"
              className="form-control"
              placeholder="📧 Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderRadius: "15px",
                border: "2px solid #e1e8ed",
                padding: "15px 20px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.8)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <input
              type="password"
              className="form-control"
              placeholder="🔒 Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                borderRadius: "15px",
                border: "2px solid #e1e8ed",
                padding: "15px 20px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.8)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{
              borderRadius: "15px",
              padding: "15px 30px",
              fontSize: "1.1rem",
              fontWeight: "600",
              background: "linear-gradient(135deg, #4a5568, #2d3748)",
              border: "none",
              color: "white",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-3px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            {isRegistering ? "🚀 Create Account" : "🔐 Sign In"}
          </button>

          <button
            type="button"
            className="btn w-100"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              borderRadius: "15px",
              padding: "12px 30px",
              fontSize: "1rem",
              fontWeight: "500",
              background: "transparent",
              border: "2px solid #4a5568",
              color: "#4a5568",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#4a5568";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#4a5568";
            }}
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Don't have an account? Create One"}
          </button>

          {error && (
            <div
              style={{
                background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                color: "white",
                padding: "1rem",
                borderRadius: "12px",
                marginTop: "1.5rem",
                fontSize: "0.9rem",
                boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </form>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
            borderRadius: "15px",
            border: "1px solid #e9ecef",
          }}
        >
          <h5 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
            🌟 Why Choose VactionRes?
          </h5>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", fontSize: "0.9rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✈️</div>
              <div style={{ color: "#7f8c8d" }}>Best Flight Deals</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🏨</div>
              <div style={{ color: "#7f8c8d" }}>Luxury Hotels</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌤️</div>
              <div style={{ color: "#7f8c8d" }}>Weather Forecast</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;