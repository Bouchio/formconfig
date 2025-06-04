import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import { Typography, Box } from '@mui/joy';

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', p: 3 }}>
        <Typography level="h1" sx={{ mb: 4, textAlign: 'center', color: 'primary.solidBg' }}>
          User Management
        </Typography>
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;