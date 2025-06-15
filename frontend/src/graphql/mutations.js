// Remplacez CREATE_USER par ces nouvelles mutations
// Importez-les au début de votre fichier CreateUser.jsx

import { gql } from '@apollo/client';

// Define GraphQL mutation to create a user
export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
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
      hobbies
      isActive
    }
  }
`;

// Mutation pour créer un utilisateur "vide" pour obtenir un ID
// Le backend ne devrait générer que l'ID à ce stade, les autres champs sont optionnels/null.
export const CREATE_DRAFT_USER = gql`
  mutation CreateDraftUser {
    createDraftUser {
      id
    }
  }
`;

// Mutation pour mettre à jour l'utilisateur existant (le brouillon)
// Define GraphQL mutation to update a user
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
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
      hobbies
      isActive
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

export const UPDATE_FORM_CONFIG = gql`
  mutation UpdateFormConfig($id: ID!, $input: UpdateFormConfigInput!) {
    updateFormConfig(id: $id, input: $input) {
      id
      formName
      description
      config
      createdAt
      updatedAt
    }
  }
`;