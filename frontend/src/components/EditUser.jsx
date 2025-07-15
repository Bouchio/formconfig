import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sheet, Typography, Button, Input, Checkbox, FormControl, FormLabel, 
  Box, CircularProgress, Chip, ChipDelete, Select, Option
} from '@mui/joy';
import { toast } from 'react-hot-toast';
import { GET_USERS, GET_USER } from '../graphql/queries';
import { UPDATE_USER } from '../graphql/mutations';

// Utility function to format timestamp to YYYY-MM-DD
const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date format:', timestamp);
    return '';
  }
};

// Utility function to format any date string to YYYY-MM-DD for input
const formatDateStringForInput = (dateString) => {
  if (!dateString) return '';
  try {
    // Si c'est déjà au format YYYY-MM-DD, on le retourne tel quel
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Sinon on essaie de parser la date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return '';
  }
};

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading: queryLoading, error, data } = useQuery(GET_USER, { variables: { id } });

  const [formData, setFormData] = useState({
    matricule: '',
    NIR: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    age: '',
    birthDate: '',
    gender: '',
    address: '',
    phone: '',
    hobbies: [],
    isActive: true,
    role: 'Utilisateur',
  });
  const [hobbyInput, setHobbyInput] = useState('');

  const [updateUser, { loading: mutationLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success('User updated successfully');
      navigate('/'); // Redirect to user list
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`);
    },
    refetchQueries: [{ query: GET_USERS }],
  });

  // Initialize form with user data
  useEffect(() => {
    if (data?.user) {
      setFormData({
        matricule: data.user.matricule || '',
        NIR: data.user.NIR || '',
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        username: data.user.username || '',
        email: data.user.email || '',
        age: data.user.age || '',
        birthDate: data.user.birthDate || '',
        gender: data.user.gender || '',
        address: data.user.address || '',
        phone: data.user.phone || '',
        hobbies: data.user.hobbies || [],
        isActive: data.user.isActive,
        role: data.user.role || 'Utilisateur',
      });
    }
  }, [data]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle hobby input changes
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id,
          input: {
            matricule: formData.matricule || null,
            NIR: formData.NIR || null,
            firstName: formData.firstName || null,
            lastName: formData.lastName || null,
            username: formData.username || null,
            email: formData.email || null,
            age: formData.age ? parseInt(formData.age) : null,
            birthDate: formData.birthDate || null,
            gender: formData.gender || null,
            address: formData.address || null,
            phone: formData.phone || null,
            hobbies: formData.hobbies,
            isActive: formData.isActive,
            role: formData.role || null,
          },
        },
      });
    } catch (error) {
      // Error handled by onError in useMutation
    }
  };

  // Handle loading and error states
  if (queryLoading) return <CircularProgress sx={{ mx: 'auto', mt: 4 }} />;
  if (error) return <Typography color="danger" sx={{ textAlign: 'center', mt: 4 }}>Error: {error.message}</Typography>;

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 4 }}>
      <Sheet sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface' }}>
        <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
          Edit User
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>First Name</FormLabel>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Last Name</FormLabel>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Matricule</FormLabel>
            <Input
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              placeholder="Enter matricule"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>NIR</FormLabel>
            <Input
              name="NIR"
              value={formData.NIR}
              onChange={handleChange}
              placeholder="Enter NIR"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Age</FormLabel>
            <Input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Birth Date</FormLabel>
            <Input
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Gender</FormLabel>
            <Input
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Enter gender"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Address</FormLabel>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Role</FormLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={(e, value) => setFormData({ ...formData, role: value })}
              placeholder="Select role"
            >
              <Option value="Utilisateur">Utilisateur</Option>
              <Option value="RH">RH</Option>
              <Option value="Directeur">Directeur</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Hobbies</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Input
                value={hobbyInput}
                onChange={handleHobbyInputChange}
                placeholder="Add a hobby"
              />
              <Button onClick={handleAddHobby} variant="solid" color="primary" size="sm">
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
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => navigate('/')}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="solid"
              color="primary"
              loading={mutationLoading}
            >
              Update
            </Button>
          </Box>
        </form>
      </Sheet>
    </Box>
  );
};

export default EditUser;