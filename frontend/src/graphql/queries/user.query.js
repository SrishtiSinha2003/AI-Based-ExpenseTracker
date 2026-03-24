import { gql } from "@apollo/client";

export const GET_AUTH_USER = gql`
  query GetAuthUser {
    authUser {
      _id
      username
      name
      profilePic
      gender
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      _id
      username
      name
      profilePic
      gender
      transactions {
        amount
        type
        category
        description
        location
        date
      }
    }
  }
`;
