const typeDefs = `#graphql
  scalar JSON

  type User {
    id: ID!
    matricule: String
    NIR: String
    firstName: String
    lastName: String
    username: String
    email: String
    age: Int
    birthDate: String
    gender: String
    address: String
    phone: String
    hobbies: [String]
    isActive: Boolean
    role: String
    createdAt: String
    updatedAt: String
  }

  type AuthResponse {
    success: Boolean!
    message: String
    user: User
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input UserInput {
    matricule: String
    NIR: String
    firstName: String
    lastName: String
    username: String
    email: String
    age: Int
    birthDate: String
    gender: String
    address: String
    phone: String
    hobbies: [String]
    isActive: Boolean
    role: String
  }

  input UpdateUserInput {
    matricule: String
    NIR: String
    firstName: String
    lastName: String
    username: String
    email: String
    age: Int
    birthDate: String
    gender: String
    address: String
    phone: String
    hobbies: [String]
    isActive: Boolean
    role: String
  }

  type FormConfig {
    id: ID!
    formName: String!
    description: String
    config: JSON!
    createdAt: String
    updatedAt: String
  }

  input FormConfigInput {
    formName: String!
    description: String
    config: JSON!
  }

  input UpdateFormConfigInput {
    formName: String
    description: String
    config: JSON
  }

  # Types pour les workflows
  type WorkflowAction {
    name: String!
    nextStep: String!
    stateChanges: [StateChange]
    allowMessage: Boolean!
  }

  type StateChange {
    field: String!
    value: JSON
  }

  type WorkflowStep {
    order: Int!
    allowedRoles: [String!]!
    actions: [WorkflowAction!]!
  }

  type Workflow {
    id: ID!
    name: String!
    description: String
    trigger: String!
    steps: [WorkflowStep!]!
    isActive: Boolean!
    createdAt: String
    updatedAt: String
  }

  type WorkflowHistoryEntry {
    stepOrder: Int!
    action: String!
    userId: ID!
    user: User
    message: String
    timestamp: String!
  }

  type WorkflowInstance {
    id: ID!
    workflowId: ID!
    workflow: Workflow
    entityId: ID!
    entityType: String!
    entity: User
    currentStep: Int!
    status: String!
    history: [WorkflowHistoryEntry!]!
    createdAt: String
    updatedAt: String
  }

  input WorkflowActionInput {
    name: String!
    nextStep: String!
    stateChanges: [StateChangeInput]
    allowMessage: Boolean
  }

  input StateChangeInput {
    field: String!
    value: JSON
  }

  input WorkflowStepInput {
    order: Int!
    allowedRoles: [String!]!
    actions: [WorkflowActionInput!]!
  }

  input WorkflowInput {
    name: String!
    description: String
    trigger: String!
    steps: [WorkflowStepInput!]!
    isActive: Boolean
  }

  input UpdateWorkflowInput {
    name: String
    description: String
    trigger: String
    steps: [WorkflowStepInput]
    isActive: Boolean
  }

  input WorkflowActionExecutionInput {
    instanceId: ID!
    action: String!
    message: String
  }

  type WorkflowActionResponse {
    success: Boolean!
    message: String
    instance: WorkflowInstance
  }

  type Query {
    users: [User]
    user(id: ID!): User
    formConfigs: [FormConfig]
    formConfig(id: ID!): FormConfig
    formConfigByName(formName: String!): FormConfig
    me: User
    # Queries pour les workflows
    workflows: [Workflow]
    workflow(id: ID!): Workflow
    workflowInstances: [WorkflowInstance]
    workflowInstance(id: ID!): WorkflowInstance
    pendingWorkflowInstances: [WorkflowInstance]
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): User
    createDraftUser: User
    createFormConfig(input: FormConfigInput!): FormConfig
    updateFormConfig(id: ID!, input: UpdateFormConfigInput!): FormConfig
    deleteFormConfig(id: ID!): FormConfig
    login(input: LoginInput!): AuthResponse!
    logout: AuthResponse!
    # Mutations pour les workflows
    createWorkflow(input: WorkflowInput!): Workflow
    updateWorkflow(id: ID!, input: UpdateWorkflowInput!): Workflow
    deleteWorkflow(id: ID!): Workflow
    executeWorkflowAction(input: WorkflowActionExecutionInput!): WorkflowActionResponse!
  }
`;

export default typeDefs;