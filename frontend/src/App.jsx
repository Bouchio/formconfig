import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ME } from './graphql/queries.js';
import theme from './theme';
import Login from './components/Login';
import Layout from './components/Layout';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import FormConfigList from './components/FormConfigList';
import FormConfigEdit from './components/FormConfigEdit';
import WorkflowList from './components/WorkflowList';
import WorkflowInstances from './components/WorkflowInstances';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME, {
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (loading || meLoading) {
    return (
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Chargement...
        </div>
      </CssVarsProvider>
    );
  }

  // Si pas d'utilisateur connecté, afficher la page de connexion
  if (!user) {
    return (
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLoginSuccess} />
      </CssVarsProvider>
    );
  }

  // Si utilisateur connecté, afficher l'application avec le Layout
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/:id/edit" element={<EditUser />} />
            <Route path="/form-configs" element={<FormConfigList />} />
            <Route path="/form-configs/:id/edit" element={<FormConfigEdit />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflow-instances" element={<WorkflowInstances />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster position="top-right" />
    </CssVarsProvider>
  );
}

export default App;