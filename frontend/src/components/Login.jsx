import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations.js';
import { Box, Input, FormControl, FormLabel, Button, Typography, Alert, Sheet } from '@mui/joy';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      if (data.login.success) {
        setError('');
        onLoginSuccess(data.login.user);
      } else {
        setError(data.login.message);
      }
    },
    onError: (error) => {
      setError('Erreur de connexion: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    login({
      variables: {
        input: {
          username,
          password
        }
      }
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.level1'
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          borderRadius: 'md'
        }}
      >
        <Typography level="h1" sx={{ mb: 2 }}>
          Connexion
        </Typography>
        
        <Typography level="body-sm" sx={{ mb: 3 }}>
          Utilisez votre nom d'utilisateur et le mot de passe "admin"
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Nom d'utilisateur</FormLabel>
            <Input
              required
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          
          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Mot de passe</FormLabel>
            <Input
              required
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Box>
      </Sheet>
    </Box>
  );
};

export default Login; 