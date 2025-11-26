import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Avatar, Typography, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getEnvCheck } from '../client-api/client';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEnvCheck, setShowEnvCheck] = useState(false);
  const open = Boolean(anchorEl);

  const {
    data: envCheck,
    refetch: fetchEnvCheck,
    isFetching: isEnvCheckFetching,
  } = useQuery({
    queryKey: ['envCheck'],
    queryFn: getEnvCheck,
    enabled: false,
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCheckEnvironment = () => {
    setShowEnvCheck(true);
    fetchEnvCheck();
    handleClose();
  };

  const handleCloseEnvCheck = () => {
    setShowEnvCheck(false);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body1">{user.email}</Typography>
      <IconButton onClick={handleClick} size="small">
        <Avatar
          src={user.avatar_url}
          alt={user.name || user.email}
          sx={{ width: 32, height: 32 }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user.name || user.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCheckEnvironment} disabled={isEnvCheckFetching}>
          {isEnvCheckFetching ? 'Checking...' : 'Check Environment'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* Environment Check Dialog/Snackbar could be added here */}
      {showEnvCheck && envCheck && (
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            bgcolor: 'background.paper',
            boxShadow: 3,
            p: 2,
            borderRadius: 1,
            maxWidth: 400,
            zIndex: 1300,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant="h6">Environment Configuration:</Typography>
            <IconButton size="small" onClick={handleCloseEnvCheck}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                ×
              </Typography>
            </IconButton>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.primary">
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Google Client ID:
              </Box>{' '}
              {envCheck.hasGoogleClientId ? '✅ Set' : '❌ Missing'}
            </Typography>
            {envCheck.hasGoogleClientId && (
              <Typography
                variant="caption"
                display="block"
                sx={{ ml: 2, color: 'text.secondary', fontFamily: 'monospace' }}
              >
                {envCheck.googleClientIdPrefix}
              </Typography>
            )}
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.primary">
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Google Client Secret:
              </Box>{' '}
              {envCheck.hasGoogleClientSecret ? '✅ Set' : '❌ Missing'}
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.primary">
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Google Callback URL:
              </Box>{' '}
              {envCheck.hasGoogleCallbackUrl ? '✅ Set' : '❌ Missing'}
            </Typography>
            {envCheck.hasGoogleCallbackUrl && (
              <Typography
                variant="caption"
                display="block"
                sx={{ ml: 2, color: 'text.secondary', fontFamily: 'monospace' }}
              >
                {envCheck.googleCallbackUrl}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
