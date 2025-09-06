// Remplacez CREATE_USER par ces nouvelles mutations
// Importez-les au début de votre fichier CreateUser.jsx

import { gql } from '@apollo/client';

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
      role
      createdAt
      updatedAt
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

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      matricule
      NIR
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
      role
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      firstName
      lastName
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        username
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const CREATE_FORM_CONFIG = gql`
  mutation CreateFormConfig($input: FormConfigInput!) {
    createFormConfig(input: $input) {
      id
      formName
      description
      config
      createdAt
      updatedAt
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

export const DELETE_FORM_CONFIG = gql`
  mutation DeleteFormConfig($id: ID!) {
    deleteFormConfig(id: $id) {
      id
      formName
    }
  }
`;

// Mutations pour les workflows
export const CREATE_WORKFLOW = gql`
  mutation CreateWorkflow($input: WorkflowInput!) {
    createWorkflow(input: $input) {
      id
      name
      description
      trigger
      steps {
        order
        allowedRoles
        actions {
          name
          nextStep
          stateChanges {
            field
            value
          }
          allowMessage
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WORKFLOW = gql`
  mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
    updateWorkflow(id: $id, input: $input) {
      id
      name
      description
      trigger
      steps {
        order
        allowedRoles
        actions {
          name
          nextStep
          stateChanges {
            field
            value
          }
          allowMessage
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id) {
      id
      name
    }
  }
`;

export const EXECUTE_WORKFLOW_ACTION = gql`
  mutation ExecuteWorkflowAction($input: WorkflowActionExecutionInput!) {
    executeWorkflowAction(input: $input) {
      success
      message
      instance {
        id
        workflowId
        workflow {
          id
          name
          description
        }
        entityId
        entityType
        currentStep
        status
        history {
          stepOrder
          action
          userId
          user {
            id
            firstName
            lastName
            username
          }
          message
          timestamp
        }
        createdAt
        updatedAt
      }
    }
  }
`;