import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
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
      createdAt
      updatedAt
    }
  }
`;

export const GET_FORM_CONFIG = gql`
  query GetFormConfig($formName: String!) {
    formConfigByName(formName: $formName) {
      id
      formName
      description
      config
    }
  }
`;

export const GET_FORM_CONFIGS = gql`
  query GetFormConfigs {
    formConfigs {
      id
      formName
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_FORM_CONFIG_BY_ID = gql`
  query GetFormConfigById($id: ID!) {
    formConfig(id: $id) {
      id
      formName
      description
      config
      createdAt
      updatedAt
    }
  }
`;