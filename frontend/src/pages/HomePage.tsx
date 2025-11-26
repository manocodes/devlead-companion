import React from 'react';
import { Box, Typography } from '@mui/material';

export const HomePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome to DevLead Companion
      </Typography>
      <Typography variant="body1">Select a menu item from the sidebar to get started.</Typography>
    </Box>
  );
};
