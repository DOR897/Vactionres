import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const nav = useNavigate();
  return (
    <div className="d-flex justify-content-end mb-4 w-100">
      <button
        className="btn btn-outline-danger"
        onClick={() => {
          onLogout();
          nav('/');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
