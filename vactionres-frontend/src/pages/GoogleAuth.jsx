import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { createGoogleUser } from '../utils/api';

const GoogleAuth = ({ clientId, setUser }) => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const decoded = jwtDecode(credential);
    
    console.log('Google login successful:', decoded);
    
    try {
      // Create user in backend
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      };
      
      console.log('Creating user in backend:', userData);
      const createdUser = await createGoogleUser(userData);
      console.log('User created successfully:', createdUser);
      
      const userObj = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        google_credential: credential,
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      navigate('/search');
    } catch (error) {
      console.error('Error creating Google user:', error);
      console.error('Error details:', error.message);
      alert(`Failed to create user account: ${error.message}`);
    }
  };

  const handleError = () => {
    alert('Google Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
