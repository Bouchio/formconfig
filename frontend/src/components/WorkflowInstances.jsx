import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  Chip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Option,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/joy';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PENDING_WORKFLOW_INSTANCES } from '../graphql/queries.js';
import { EXECUTE_WORKFLOW_ACTION } from '../graphql/mutations.js';
import { toast } from 'react-hot-toast';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, History as HistoryIcon } from '@mui/icons-material';

const WorkflowInstances = () => {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [message, setMessage] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_PENDING_WORKFLOW_INSTANCES, {
    fetchPolicy: 'network-only', // Force la requête réseau à chaque fois
    notifyOnNetworkStatusChange: true
  });
  const [executeAction] = useMutation(EXECUTE_WORKFLOW_ACTION);

  const handleActionClick = (instance, action) => {
    setSelectedInstance(instance);
    setSelectedAction(action);
    setMessage('');
    setActionDialogOpen(true);
  };

  const handleExecuteAction = async () => {
    try {
      await executeAction({
        variables: {
          input: {
            instanceId: selectedInstance.id,
            action: selectedAction,
            message: message || undefined
          }
        }
      });
      
      toast.success(`Action '${selectedAction}' exécutée avec succès`);
      setActionDialogOpen(false);
      setSelectedInstance(null);
      setSelectedAction('');
      setMessage('');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de l\'exécution de l\'action');
      console.error('Error executing action:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'COMPLETED': 'success'
    };
    return colors[status] || 'neutral';
  };

  const getActionColor = (action) => {
    return action === 'approve' ? 'success' : 'danger';
  };

  const getActionIcon = (action) => {
    return action === 'approve' ? <ApproveIcon /> : <RejectIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(parseInt(dateString)).toLocaleString();
  };

  if (loading) return <Typography>Chargement des instances de workflow...</Typography>;
  if (error) return <Alert color="danger">Erreur: {error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2">Instances de Workflow en Attente</Typography>
        <Button
          variant="outlined"
          onClick={() => refetch()}
        >
          Actualiser
        </Button>
      </Box>

      {data?.pendingWorkflowInstances?.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography level="h4" color="neutral">
              Aucune instance en attente
            </Typography>
            <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
              Toutes les instances de workflow ont été traitées
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Entité</th>
              <th>Étape Actuelle</th>
              <th>Statut</th>
              <th>Date de Création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.pendingWorkflowInstances?.map((instance) => {
              const currentStep = instance.workflow?.steps?.find(
                step => step.order === instance.currentStep
              );
              
              return (
                <tr key={instance.id}>
                  <td>
                    <Typography fontWeight="bold">{instance.workflow?.name}</Typography>
                    <Typography level="body-xs" color="neutral">
                      {instance.workflow?.description}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      {instance.entity?.username || instance.entityId}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {instance.entity?.firstName} {instance.entity?.lastName}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Étape {instance.currentStep}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      Rôles: {currentStep?.allowedRoles?.join(', ')}
                    </Typography>
                  </td>
                  <td>
                    <Chip 
                      color={getStatusColor(instance.status)} 
                      variant="soft" 
                      size="sm"
                    >
                      {instance.status}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      {formatDate(instance.createdAt)}
                    </Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {currentStep?.actions?.map((action) => (
                        <Button
                          key={action.name}
                          size="sm"
                          color={getActionColor(action.name)}
                          variant="soft"
                          startDecorator={getActionIcon(action.name)}
                          onClick={() => handleActionClick(instance, action.name)}
                        >
                          {action.name === 'approve' ? 'Approuver' : 'Rejeter'}
                        </Button>
                      ))}
                    </Box>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Dialog pour exécuter une action */}
      <Modal open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <ModalDialog>
          <DialogTitle>
            Exécuter l'action: {selectedAction === 'approve' ? 'Approuver' : 'Rejeter'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography level="body-sm" color="neutral">
                Workflow: {selectedInstance?.workflow?.name}
              </Typography>
              <Typography level="body-sm" color="neutral">
                Entité: {selectedInstance?.entityType} - {selectedInstance?.entityId}
              </Typography>
            </Box>
            
            <FormControl sx={{ width: '100%', mb: 2 }}>
              <FormLabel>Message (optionnel)</FormLabel>
              <Textarea
                minRows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ajoutez un commentaire..."
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={() => setActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              color={getActionColor(selectedAction)}
              onClick={handleExecuteAction}
            >
              {selectedAction === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default WorkflowInstances; 