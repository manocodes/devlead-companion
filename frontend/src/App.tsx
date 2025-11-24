import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link,
} from '@mui/material';
import logo from './logo.svg';
import Login from './components/Login';

interface User {
  email: string;
  [key: string]: any;
}

function App() {
  const [helloMessage, setHelloMessage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

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

  const fetchProfile = async (token: string) => {
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DevLead Companion
          </Typography>
          {user && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="logo"
            sx={{
              height: '40vmin',
              pointerEvents: 'none',
              '@media (prefers-reduced-motion: no-preference)': {
                animation: 'App-logo-spin infinite 20s linear',
              },
              '@keyframes App-logo-spin': {
                from: {
                  transform: 'rotate(0deg)',
                },
                to: {
                  transform: 'rotate(360deg)',
                },
              },
            }}
          />
          <Typography variant="body1" sx={{ my: 2 }}>
            Edit <code>src/App.tsx</code> and save to reload.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={fetchHello}
            sx={{ my: 2 }}
          >
            Get Hello
          </Button>
          {helloMessage && (
            <Typography variant="h5" sx={{ mt: 2 }}>
              {helloMessage}
            </Typography>
          )}
          <Link
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 2, color: 'primary.main' }}
          >
            Learn React
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default App;

