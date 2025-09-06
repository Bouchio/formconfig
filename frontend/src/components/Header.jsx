import React from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Stack, 
  Avatar,
  Divider
} from '@mui/joy';
import { LOGOUT } from '../graphql/mutations.js';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();

  const [logout, { loading }] = useMutation(LOGOUT, {
    onCompleted: (data) => {
      if (data.logout.success) {
        // Vider le cache Apollo avant la déconnexion
        client.clearStore();
        onLogout();
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      client.clearStore();
      onLogout();
      navigate('/');
    }
  });

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.surface',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        {/* Logo et titre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="h3" component="h1">
            Form Builder
          </Typography>
        </Box>

        {/* Navigation */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            variant={isActive('/') ? 'solid' : 'plain'}
            onClick={() => navigate('/')}
            sx={{ minWidth: 'auto' }}
          >
            Utilisateurs
          </Button>
          
          <Button
            variant={isActive('/form-configs') ? 'solid' : 'plain'}
            onClick={() => navigate('/form-configs')}
            sx={{ minWidth: 'auto' }}
          >
            Formulaires
          </Button>

          <Button
            variant={isActive('/workflows') ? 'solid' : 'plain'}
            onClick={() => navigate('/workflows')}
            sx={{ minWidth: 'auto' }}
          >
            Workflows
          </Button>

          <Button
            variant={isActive('/workflow-instances') ? 'solid' : 'plain'}
            onClick={() => navigate('/workflow-instances')}
            sx={{ minWidth: 'auto' }}
          >
            Instances
          </Button>
        </Stack>

        {/* Utilisateur et déconnexion */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography level="body-sm" color="text.secondary">
              Connecté en tant que
            </Typography>
            <Typography level="body-sm" fontWeight="bold">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography level="body-xs" color="primary">
              {user?.role || 'Utilisateur'}
            </Typography>
          </Box>
          
          <Avatar size="sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          
          <Divider orientation="vertical" />
          
          <Button
            variant="outlined"
            color="danger"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Déconnexion...' : 'Déconnexion'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 