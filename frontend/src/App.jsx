import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import FormConfigList from './components/FormConfigList';
import FormConfigEdit from './components/FormConfigEdit'
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
          <Route path="/form-configs" element={<FormConfigList />} />
          <Route path="/form-config/:id" element={<FormConfigEdit />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;