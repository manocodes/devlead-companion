import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import Login from './components/Login';
import { Sidebar } from './components/Sidebar';
import { UserMenu } from './components/UserMenu';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DevLead Companion
            </Typography>
            <UserMenu />
          </Toolbar>
        </AppBar>

        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: '240px',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
