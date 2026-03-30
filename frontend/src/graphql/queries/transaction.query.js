import { gql } from "@apollo/client";

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    getTransactions {
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

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    getTransaction(transactionId: $id) {
      _id
      amount
      type
      category
      description
      location
      date
      user {
        username
        name
        profilePic
        gender
      }
    }
  }
`;

export const GET_STATISTICS = gql`
  query GetStatistics {
    getStatistics {
      category
      total
    }
  }
`;

export const GET_FINANCIAL_INSIGHTS = gql`
  query GetFinancialInsights {
    getFinancialInsights {
      insights
      score
      alerts
      categoryInsights
      predictedExpense
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      _id
      message
      type
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    getUnreadCount
  }
`;

export const GET_RECURRING = gql`
  query GetRecurring {
    getRecurring {
      _id
      amount
      type
      category
      description
      location
      frequency
      nextDate
      active
    }
  }
`;

export const GET_COMPARISON = gql`
  query GetComparison($type: String!) {
    getComparison(type: $type) {
      label
      income
      expense
      saving
    }
  }
`;
