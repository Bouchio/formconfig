import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Sheet, Typography, Button, CircularProgress, Modal, ModalDialog, ModalClose,
} from '@mui/joy';
import { JsonEditor } from 'json-edit-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from 'react-hot-toast';
import { GET_FORM_CONFIG_BY_ID } from '../graphql/queries';
import { UPDATE_FORM_CONFIG } from '../graphql/mutations';

const FormConfigEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Récupérer le FormConfig par ID
  const { loading, error, data } = useQuery(GET_FORM_CONFIG_BY_ID, {
    variables: { id },
  });

  // Mutation pour sauvegarder les modifications
  const [updateFormConfig, { loading: saving }] = useMutation(UPDATE_FORM_CONFIG, {
    onCompleted: () => {
      toast.success('Form configuration saved successfully!');
      setOpenConfirmDialog(false);
      navigate('/form-configs');
    },
    onError: (err) => {
      toast.error(`Error saving form configuration: ${err.message}`);
    },
    refetchQueries: [{ query: GET_FORM_CONFIG_BY_ID, variables: { id } }],
  });

  // Initialiser le state config avec les données récupérées
  useEffect(() => {
    if (data?.formConfig?.config) {
      setConfig(data.formConfig.config);
    }
  }, [data]);

  // Gérer la mise à jour du JSON
  const handleJsonUpdate = ({ newData }) => {
    setConfig(newData);
  };

  // Gérer la sauvegarde
  const handleSave = () => {
    setOpenConfirmDialog(true);
  };

  // Confirmer la sauvegarde
  const handleConfirmSave = async () => {
    try {
      await updateFormConfig({
        variables: {
          id,
          input: {
            config,
          },
        },
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Gérer le retour à la liste
  const handleBack = () => {
    navigate('/form-configs');
  };

  // Afficher le chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Afficher une erreur
  if (error || !data?.formConfig) {
    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
        <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
          <Typography level="h2" color="danger">
            {error ? `Error loading FormConfig: ${error.message}` : 'FormConfig not found'}
          </Typography>
          <Button onClick={handleBack} sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Sheet>
      </Box>
    );
  }

  const { formConfig } = data;

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
      <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="plain"
            color="neutral"
            startDecorator={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Typography level="h2" sx={{ flexGrow: 1 }}>
            Edit Form Configuration: {formConfig.formName}
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography level="body1">
            <strong>Name:</strong> {formConfig.formName}
          </Typography>
          <Typography level="body1">
            <strong>Description:</strong> {formConfig.description || '-'}
          </Typography>
          <Typography level="body1">
            <strong>Created At:</strong> {new Date(parseInt(formConfig.createdAt)).toLocaleDateString()}
          </Typography>
        </Box>
        <Typography level="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
          Configuration JSON
        </Typography>
        <JsonEditor
          data={config}
          onUpdate={handleJsonUpdate}
          rootName="config"
          style={{ height: '500px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            variant="solid"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </Sheet>

      {/* Dialogue de confirmation */}
      <Modal open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <ModalDialog
          variant="outlined"
          sx={{ maxWidth: '400px', p: 3 }}
        >
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Confirm Save
          </Typography>
          <Typography level="body1" sx={{ mb: 3 }}>
            Are you sure you want to save changes to this form configuration?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setOpenConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleConfirmSave}
              loading={saving}
            >
              Confirm
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default FormConfigEdit;