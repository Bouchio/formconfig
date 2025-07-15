import React from 'react';
import { Box } from '@mui/joy';
import Header from './Header.jsx';

const Layout = ({ children, user, onLogout }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={onLogout} />
      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 