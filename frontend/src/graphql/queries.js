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