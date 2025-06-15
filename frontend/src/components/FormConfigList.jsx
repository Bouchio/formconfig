import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box, Sheet, Typography, Table, Button, CircularProgress, IconButton,
} from '@mui/joy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { GET_FORM_CONFIGS } from '../graphql/queries';

// Composant pour afficher la liste des FormConfig
const FormConfigList = () => {
  const navigate = useNavigate();

  // Récupérer tous les FormConfig via GraphQL
  const { loading, error, data } = useQuery(GET_FORM_CONFIGS);

  // Gérer le clic sur l'icône pour naviguer vers la page d'édition
  const handleView = (id) => {
    navigate(`/form-config/${id}`);
  };

  // Gérer le clic sur le bouton "Return to Home"
  const handleReturn = () => {
    navigate('/');
  };

  // Afficher un état de chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Afficher une erreur si la requête échoue
  if (error) {
    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
        <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
          <Typography level="h2" color="danger">
            Error loading FormConfigs: {error.message}
          </Typography>
          <Button onClick={handleReturn} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Sheet>
      </Box>
    );
  }

  // Afficher un message si aucun FormConfig n'existe
  if (!data?.formConfigs?.length) {
    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
        <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
          <Typography level="h2" color="warning">
            No FormConfigs found
          </Typography>
          <Button onClick={handleReturn} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Sheet>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
      <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
        <Typography level="h2" sx={{ mb: 4 }}>
          Form Configurations
        </Typography>
        <Table
          borderAxis="both"
          stripe="odd"
          hoverRow
          sx={{ width: '100%', '& th': { bgcolor: 'background.level1' } }}
        >
          <thead>
            <tr>
              <th>Form Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.formConfigs.map((formConfig) => (
              <tr key={formConfig.id}>
                <td>{formConfig.formName}</td>
                <td>{formConfig.description || '-'}</td>
                <td>{new Date(parseInt(formConfig.createdAt)).toLocaleDateString()}</td>
                <td>
                  <IconButton
                    variant="plain"
                    color="primary"
                    onClick={() => handleView(formConfig.id)}
                    title="View/Edit"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button
          onClick={handleReturn}
          variant="outlined"
          color="neutral"
          sx={{ mt: 3 }}
        >
          Return to Home
        </Button>
      </Sheet>
    </Box>
  );
};

export default FormConfigList;