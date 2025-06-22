import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../utils/api';

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
        // must supply username, email, password
        userData = await registerUser({
          username: email,
          email,
          password,
        });
      } else {
        // login expects form‐encoded username/password
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }} className="mx-auto">
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          type="button"
          className="btn btn-link w-100 mt-2"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default LoginRegisterPage;