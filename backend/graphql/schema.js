const typeDefs = `#graphql
  type User {
    id: ID!
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
    createdAt: String
    updatedAt: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): User
    createDraftUser: User!
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
`;

export default typeDefs;