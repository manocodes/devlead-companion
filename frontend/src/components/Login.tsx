import React from 'react';
import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function Login() {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            padding: 4,
            textAlign: 'center',
          }}
        >
          <CardContent>
            <Typography variant="h1" component="h1" gutterBottom>
              DevLead Companion
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to continue
            </Typography>
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
              sx={{
                py: 1.5,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
