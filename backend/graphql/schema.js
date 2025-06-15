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
    createdAt: String
    updatedAt: String
  }

  type FormConfig {
    id: ID!
    formName: String!
    description: String!
    config: JSON!
    createdAt: String
    updatedAt: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
    formConfigs: [FormConfig]
    formConfig(id: ID!): FormConfig
    formConfigByName(formName: String!): FormConfig
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): User
    createDraftUser: User!
    createFormConfig(input: CreateFormConfigInput!): FormConfig
    updateFormConfig(id: ID!, input: UpdateFormConfigInput!): FormConfig
    deleteFormConfig(id: ID!): FormConfig
  }

  input CreateUserInput {
    matricule: String
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
  }

  input UpdateUserInput {
    matricule: String
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
  }

  input CreateFormConfigInput {
    formName: String!
    description: String!
    config: JSON!
  }

  input UpdateFormConfigInput {
    formName: String
    description: String
    config: JSON
  }
`;

export default typeDefs;