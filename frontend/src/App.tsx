import { useQuery } from '@tanstack/react-query';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link,
  CircularProgress,
} from '@mui/material';
import logo from './logo.svg';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { getHelloMessage, getEnvCheck, EnvCheckResponse } from './client-api/client';

function App() {
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();

  const { data: helloMessage, refetch: fetchHello, isFetching: isHelloFetching, error: helloError } = useQuery({
    queryKey: ['hello'],
    queryFn: getHelloMessage,
    enabled: false, // Don't fetch automatically on mount, wait for button click
  });

  const { data: envCheck, refetch: fetchEnvCheck, isFetching: isEnvCheckFetching, error: envCheckError } = useQuery({
    queryKey: ['envCheck'],
    queryFn: getEnvCheck,
    enabled: false, // Don't fetch automatically on mount, wait for button click
  });

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
              <Button color="inherit" onClick={logout}>
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
            onClick={() => fetchHello()}
            disabled={isHelloFetching}
            sx={{ my: 2 }}
          >
            {isHelloFetching ? 'Loading...' : 'Get Hello'}
          </Button>
          {helloError && (
            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
              Error fetching message
            </Typography>
          )}
          {helloMessage && (
            <Typography variant="h5" sx={{ mt: 2 }}>
              {helloMessage}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="large"
            onClick={() => fetchEnvCheck()}
            disabled={isEnvCheckFetching}
            sx={{ my: 2 }}
          >
            {isEnvCheckFetching ? 'Loading...' : 'Check Environment'}
          </Button>
          {envCheckError && (
            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
              Error fetching environment check
            </Typography>
          )}
          {envCheck && (
            <Box sx={{ mt: 2, textAlign: 'left', width: '100%', maxWidth: 600 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Environment Configuration:</Typography>
              <Typography variant="body2">
                ✓ Google Client ID: {envCheck.hasGoogleClientId ? '✅ Set' : '❌ Missing'}
                {envCheck.hasGoogleClientId && ` (${envCheck.googleClientIdPrefix})`}
              </Typography>
              <Typography variant="body2">
                ✓ Google Client Secret: {envCheck.hasGoogleClientSecret ? '✅ Set' : '❌ Missing'}
              </Typography>
              <Typography variant="body2">
                ✓ Google Callback URL: {envCheck.hasGoogleCallbackUrl ? '✅ Set' : '❌ Missing'}
                {envCheck.hasGoogleCallbackUrl && ` (${envCheck.googleCallbackUrl})`}
              </Typography>
            </Box>
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
