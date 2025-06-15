import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box, Sheet, Typography, Button, Input, Select, Option,
  FormControl, FormLabel, FormHelperText, Checkbox, Chip, ChipDelete, CircularProgress,
} from '@mui/joy';
import { toast } from 'react-hot-toast';
import { formConfigToZodSchema } from '../formConfigToZodSchema';
import { CREATE_DRAFT_USER, UPDATE_USER, DELETE_USER } from '../graphql/mutations';
import { GET_FORM_CONFIG } from '../graphql/queries';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    matricule: '',
    NIR: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    age: '',
    birthDate: '',
    endDate: '',
    gender: '',
    address: '',
    phone: '',
    isActive: true,
    hobbies: [],
  });
  const [errors, setErrors] = useState({});
  const [hobbyInput, setHobbyInput] = useState('');

  // Récupérer la configuration depuis la BDD
  const { loading: configLoading, error: configError, data: configData } = useQuery(GET_FORM_CONFIG, {
    variables: { formName: 'createUser' },
  });

  const [createDraftUser, { loading: draftLoading }] = useMutation(CREATE_DRAFT_USER, {
    onCompleted: (data) => {
      const draftId = data.createDraftUser.id;
      setFormData((prevData) => ({ ...prevData, id: draftId }));
      localStorage.setItem('draftUserId', draftId);
      // console.log('Draft user created with ID:', draftId);
      // console.log('localStorage draftUserId:', localStorage.getItem('draftUserId'));
    },
    onError: (error) => {
      toast.error(`Error creating draft user: ${error.message}`);
      console.error('Draft creation error:', error);
    },
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      localStorage.removeItem('draftUserId');
      toast.success('User created successfully');
      navigate('/');
      // console.log('Draft submitted, localStorage cleared:', localStorage.getItem('draftUserId'));
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`);
      console.error('Update user error:', error);
    },
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    onError: (error) => {
      toast.error(`Error deleting draft user: ${error.message}`);
      console.error('Delete draft error:', error);
    },
  });

  let hasCreated = false;

  // Gérer la création ou la réutilisation du brouillon au chargement
  useEffect(() => {
    const initializeDraft = async () => {
      const savedDraftId = localStorage.getItem('draftUserId');
      if (savedDraftId) {
        // console.log('Reusing existing draft ID:', savedDraftId);
        setFormData((prevData) => ({ ...prevData, id: savedDraftId }));
      } else if (!hasCreated) {
        hasCreated = true;
        // console.log('Creating new draft user');
        try {
          await createDraftUser();
        } catch (error) {
          console.error('Failed to create draft:', error);
        }
      }
    };

    initializeDraft();

    // Gérer les rechargements
    const handleBeforeUnload = (event) => {
      localStorage.setItem('isReloading', 'true');
      // console.log('Before unload, isReloading set to true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Nettoyage asynchrone lors du démontage
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const isReloading = localStorage.getItem('isReloading') === 'true';
      const draftId = localStorage.getItem('draftUserId');
      if (draftId && !isReloading) {
        // console.log('Cleaning up draft ID:', draftId);
        deleteUser({ variables: { id: draftId } })
          .then(() => {
            localStorage.removeItem('draftUserId');
            // console.log('Draft deleted successfully:', draftId);
            // console.log('localStorage after cleanup:', localStorage.getItem('draftUserId'));
          })
          .catch((error) => {
            console.error('Failed to delete draft during cleanup:', error);
          });
      }
      if (isReloading) {
        localStorage.removeItem('isReloading');
        // console.log('Reload detected, isReloading cleared');
      }
    };
  }, []);

  // Générer le schéma de validation à partir de la config BDD
  const validationSchema = useMemo(() => {
    if (!configData?.formConfigByName?.config) return null;
    return formConfigToZodSchema(configData.formConfigByName.config);
  }, [configData]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleHobbyInputChange = (event) => {
    setHobbyInput(event.target.value);
  };

  const handleAddHobby = () => {
    if (hobbyInput.trim() && !formData.hobbies.includes(hobbyInput.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        hobbies: [...prevData.hobbies, hobbyInput.trim()],
      }));
      setHobbyInput('');
    }
  };

  const handleRemoveHobby = (hobby) => {
    setFormData((prevData) => ({
      ...prevData,
      hobbies: prevData.hobbies.filter((h) => h !== hobby),
    }));
  };

  const transformFormDataForZod = (data) => {
    const transformedData = { ...data };
    for (const key in transformedData) {
      const value = transformedData[key];
      if (typeof value === 'string' && value.trim() === '') {
        transformedData[key] = null;
      }
      if (typeof value === 'number' && isNaN(value)) {
        transformedData[key] = null;
      }
      if (Array.isArray(value) && value.length === 0) {
        transformedData[key] = null;
      }
    }
    return transformedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validationSchema) {
      toast.error('Form configuration not loaded');
      return;
    }
    const dataToValidate = transformFormDataForZod(formData);
    const result = validationSchema.safeParse(dataToValidate);
    if (!result.success) {
      const newErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        newErrors[fieldName] = issue.message;
      });
      setErrors(newErrors);
      toast.error('Please correct the errors in the form.');
      return;
    }
    setErrors({});
    const input = { ...result.data };
    delete input.id;
    // console.log('Submitting data:', { id: formData.id, input });
    try {
      await updateUser({ variables: { id: formData.id, input } });
    } catch (error) {
      // Error handled by onError
    }
  };

  const handleCancel = async () => {
    const draftId = formData.id;
    if (draftId) {
      // console.log('Canceling, deleting draft ID:', draftId);
      try {
        await deleteUser({ variables: { id: draftId } });
        localStorage.removeItem('draftUserId');
        // console.log('Draft deleted successfully on cancel:', draftId);
        // console.log('localStorage after cancel:', localStorage.getItem('draftUserId'));
      } catch (error) {
        console.error('Failed to delete draft on cancel:', error);
      }
    }
    navigate('/');
  };

  // Gérer le chargement et les erreurs de la configuration
  if (configLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (configError || !configData?.formConfigByName?.config) {
    return (
      <Box sx={{ maxWidth: '600px', mx: 'auto', py: 4 }}>
        <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
          <Typography level="h2" color="danger">
            {configError ? `Error loading form configuration: ${configError.message}` : 'Form configuration not found'}
          </Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Sheet>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 4 }}>
      <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
        <Typography level="h2" sx={{ mb: 4 }}>
          Create User
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 2 }} error={!!errors.matricule}>
            <FormLabel>Matricule</FormLabel>
            <Input
              value={formData.matricule}
              onChange={handleChange('matricule')}
              placeholder="Enter matricule"
            />
            {errors.matricule && <FormHelperText>{errors.matricule}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.NIR}>
            <FormLabel>NIR</FormLabel>
            <Input
              value={formData.NIR}
              onChange={handleChange('NIR')}
              placeholder="Enter NIR"
            />
            {errors.NIR && <FormHelperText>{errors.NIR}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Enter first name"
            />
            {errors.firstName && <FormHelperText>{errors.firstName}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Enter last name"
            />
            {errors.lastName && <FormHelperText>{errors.lastName}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input
              value={formData.username}
              onChange={handleChange('username')}
              placeholder="Enter username"
            />
            {errors.username && <FormHelperText>{errors.username}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter email"
            />
            {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.age}>
            <FormLabel>Age</FormLabel>
            <Input
              value={formData.age}
              onChange={handleChange('age')}
              placeholder="Enter age"
              type="number"
            />
            {errors.age && <FormHelperText>{errors.age}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.birthDate}>
            <FormLabel>Birth Date</FormLabel>
            <Input
              value={formData.birthDate}
              onChange={handleChange('birthDate')}
              type="date"
            />
            {errors.birthDate && <FormHelperText>{errors.birthDate}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.endDate}>
            <FormLabel>End Date</FormLabel>
            <Input
              value={formData.endDate}
              onChange={handleChange('endDate')}
              type="date"
            />
            {errors.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.gender}>
            <FormLabel>Gender</FormLabel>
            <Select
              value={formData.gender}
              onChange={(e, value) => setFormData({ ...formData, gender: value })}
              placeholder="Select gender"
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.address}>
            <FormLabel>Address</FormLabel>
            <Input
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="Enter address"
            />
            {errors.address && <FormHelperText>{errors.address}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Input
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="Enter phone number"
              type="tel"
            />
            {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }} error={!!errors.hobbies}>
            <FormLabel>Hobbies</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Input
                value={hobbyInput}
                onChange={handleHobbyInputChange}
                placeholder="Add a hobby"
              />
              <Button onClick={handleAddHobby} variant="solid" color="primary">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.hobbies.map((hobby, index) => (
                <Chip
                  key={index}
                  variant="soft"
                  color="primary"
                  endDecorator={<ChipDelete onDelete={() => handleRemoveHobby(hobby)} />}
                >
                  {hobby}
                </Chip>
              ))}
            </Box>
            {errors.hobbies && <FormHelperText>{errors.hobbies}</FormHelperText>}
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Active</FormLabel>
            <Checkbox
              checked={formData.isActive}
              onChange={handleChange('isActive')}
              label="Is Active"
            />
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="solid"
              color="primary"
              loading={draftLoading || updateLoading}
              fullWidth
            >
              Create
            </Button>
            <Button
              onClick={handleCancel}
              variant="outlined"
              color="neutral"
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Sheet>
    </Box>
  );
};

export default CreateUser;