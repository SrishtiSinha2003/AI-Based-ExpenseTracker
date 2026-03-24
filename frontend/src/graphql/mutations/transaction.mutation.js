import { gql } from "@apollo/client";

export const ADD_TRANSACTION = gql`
  mutation AddTransaction($input: AddTransactionInput!) {
    addTransaction(input: $input) {
      _id
      amount
      type
      category
      description
      location
      date
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      _id
      amount
      type
      category
      description
      location
      date
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(transactionId: $id) {
      _id
      amount
      type
      category
      description
      location
      date
    }
  }
`;
