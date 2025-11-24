import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';

function App() {
  const [helloMessage, setHelloMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is returning from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Store token
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
      // Fetch user profile
      fetchProfile(token);
    } else {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setIsAuthenticated(true);
        fetchProfile(storedToken);
      }
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:3000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, logout
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchHello = async () => {
    try {
      const response = await fetch('http://localhost:3000/hello');
      const text = await response.text();
      setHelloMessage(text);
    } catch (error) {
      console.error('Error fetching hello:', error);
      setHelloMessage('Error fetching message');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          {user && (
            <>
              <p>Welcome, {user.email}!</p>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={fetchHello} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Get Hello
        </button>
        {helloMessage && <p style={{ marginTop: '20px', fontSize: '24px' }}>{helloMessage}</p>}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
