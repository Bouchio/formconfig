import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  Chip,
  IconButton,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Alert
} from '@mui/joy';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WORKFLOWS } from '../graphql/queries.js';
import { DELETE_WORKFLOW } from '../graphql/mutations.js';
import { toast } from 'react-hot-toast';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const WorkflowList = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_WORKFLOWS);
  const [deleteWorkflow] = useMutation(DELETE_WORKFLOW);

  const handleDeleteClick = (workflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteWorkflow({
        variables: { id: workflowToDelete.id },
        refetchQueries: [{ query: GET_WORKFLOWS }]
      });
      toast.success('Workflow supprimé avec succès');
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression du workflow');
      console.error('Error deleting workflow:', error);
    }
  };

  const getTriggerLabel = (trigger) => {
    const triggers = {
      'USER_CREATED': 'Création Utilisateur',
      'USER_UPDATED': 'Modification Utilisateur',
      'CONTRACT_SUBMITTED': 'Soumission Contrat'
    };
    return triggers[trigger] || trigger;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'neutral';
  };

  if (loading) return <Typography>Chargement des workflows...</Typography>;
  if (error) return <Alert color="danger">Erreur: {error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2">Gestion des Workflows</Typography>
        <Button
          startDecorator={<AddIcon />}
          color="primary"
          onClick={() => toast('Fonctionnalité à venir', { icon: 'ℹ️' })}
        >
          Nouveau Workflow
        </Button>
      </Box>

      <Table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Déclencheur</th>
            <th>Étapes</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.workflows?.map((workflow) => (
            <tr key={workflow.id}>
              <td>
                <Typography fontWeight="bold">{workflow.name}</Typography>
              </td>
              <td>
                <Typography level="body-sm" color="neutral">
                  {workflow.description || 'Aucune description'}
                </Typography>
              </td>
              <td>
                <Chip color="primary" variant="soft" size="sm">
                  {getTriggerLabel(workflow.trigger)}
                </Chip>
              </td>
              <td>
                <Typography level="body-sm">
                  {workflow.steps?.length || 0} étape(s)
                </Typography>
              </td>
              <td>
                <Chip 
                  color={getStatusColor(workflow.isActive)} 
                  variant="soft" 
                  size="sm"
                >
                  {workflow.isActive ? 'Actif' : 'Inactif'}
                </Chip>
              </td>
              <td>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="sm"
                    color="primary"
                    onClick={() => toast('Fonctionnalité à venir', { icon: 'ℹ️' })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    color="danger"
                    onClick={() => handleDeleteClick(workflow)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {data?.workflows?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography level="body-lg" color="neutral">
            Aucun workflow configuré
          </Typography>
          <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
            Créez votre premier workflow pour commencer
          </Typography>
        </Box>
      )}

      {/* Dialog de confirmation de suppression */}
      <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <ModalDialog>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer le workflow "{workflowToDelete?.name}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button color="danger" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default WorkflowList; 