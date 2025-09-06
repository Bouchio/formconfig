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
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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

export const ME = gql`
  query Me {
    me {
      id
      username
      firstName
      lastName
      email
      role
    }
  }
`;

export const GET_FORM_CONFIGS = gql`
  query GetFormConfigs {
    formConfigs {
      id
      formName
      description
      config
      createdAt
      updatedAt
    }
  }
`;

export const GET_FORM_CONFIG = gql`
  query GetFormConfig($id: ID!) {
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

export const GET_FORM_CONFIG_BY_NAME = gql`
  query GetFormConfigByName($formName: String!) {
    formConfigByName(formName: $formName) {
      id
      formName
      description
      config
      createdAt
      updatedAt
    }
  }
`;

// Queries pour les workflows
export const GET_WORKFLOWS = gql`
  query GetWorkflows {
    workflows {
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

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
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

export const GET_WORKFLOW_INSTANCES = gql`
  query GetWorkflowInstances {
    workflowInstances {
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
`;

export const GET_PENDING_WORKFLOW_INSTANCES = gql`
  query GetPendingWorkflowInstances {
    pendingWorkflowInstances {
      id
      workflowId
      workflow {
        id
        name
        description
        steps {
          order
          allowedRoles
          actions {
            name
            nextStep
            allowMessage
          }
        }
      }
      entityId
      entityType
      entity {
        id
        username
        firstName
        lastName
        email
        isActive
        role
      }
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
`;