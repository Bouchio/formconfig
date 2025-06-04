import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Sheet, Typography, Button, Input, Checkbox, FormControl, FormLabel, Box, CircularProgress } from '@mui/joy';
import { toast } from 'react-hot-toast';

// Define GraphQL query to fetch a user by ID
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      _id
      matricule
      firstName
      lastName
      username
      email
      age
      birthDate
      gender
      address
      phone
      isActive
    }
  }
`;

// Define GraphQL mutation to update a user
const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      _id
      matricule
      firstName
      lastName
      username
      email
      age
      birthDate
      gender
      address
      phone
      isActive
    }
  }
`;

// Define GET_USERS for refetchQueries
const GET_USERS = gql`
  query GetUsers {
    users {
      _id
      matricule
      firstName
      lastName
      username
      email
      age
      birthDate
      gender
      address
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Utility function to format timestamp to YYYY-MM-DD
const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  return date.toISOString().split('T')[0];
};

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading: queryLoading, error, data } = useQuery(GET_USER, { variables: { id } });

  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    age: '',
    birthDate: '',
    gender: '',
    address: '',
    phone: '',
    isActive: true,
  });

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
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        username: data.user.username || '',
        email: data.user.email || '',
        age: data.user.age || '',
        birthDate: formatDateForInput(data.user.birthDate),
        gender: data.user.gender || '',
        address: data.user.address || '',
        phone: data.user.phone || '',
        isActive: data.user.isActive,
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id,
          input: {
            matricule: formData.matricule || null,
            firstName: formData.firstName || null,
            lastName: formData.lastName || null,
            username: formData.username || null,
            email: formData.email || null,
            age: formData.age ? parseInt(formData.age) : null,
            birthDate: formData.birthDate ? new Date(formData.birthDate).getTime().toString() : null,
            gender: formData.gender || null,
            address: formData.address || null,
            phone: formData.phone || null,
            isActive: formData.isActive,
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
          <FormControl sx={{ mb: 3 }}>
            <Checkbox
              label="Active"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
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