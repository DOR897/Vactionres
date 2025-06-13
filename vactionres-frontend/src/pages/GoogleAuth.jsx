import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuth = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('user_id');
    const email = params.get('email');
    if (id && email) {
      const userObj = { id, email };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      navigate('/search');
    } else {
      navigate('/');
    }
  }, [setUser, navigate]);

  return <div className="text-center mt-5">Authenticating with Google...</div>;
};

export default GoogleAuth;
