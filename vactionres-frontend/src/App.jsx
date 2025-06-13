import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginRegisterPage from './pages/LoginRegisterPage';
import SearchPage from './pages/SearchPage';
import BookingsPage from './pages/BookingsPage';
import GoogleAuth from './pages/GoogleAuth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegisterPage setUser={setUser} />} />
        <Route path="/google-auth" element={<GoogleAuth setUser={setUser} />} />
        <Route path="/search" element={user ? <SearchPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/bookings" element={user ? <BookingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
