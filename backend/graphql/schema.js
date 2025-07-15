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

  type Query {
    users: [User]
    user(id: ID!): User
    formConfigs: [FormConfig]
    formConfig(id: ID!): FormConfig
    formConfigByName(formName: String!): FormConfig
    me: User
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
  }
`;

export default typeDefs;