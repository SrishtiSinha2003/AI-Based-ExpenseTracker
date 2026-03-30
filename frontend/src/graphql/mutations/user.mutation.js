import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      _id
      username
      name
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      username
      name
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      _id
      name
      gender
      profilePic
    }
  }
`;

export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($budget: Int!) {
    completeOnboarding(budget: $budget) {
      _id
      onboardingDone
      budget
    }
  }
`;

export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`;

export const ADD_RECURRING = gql`
  mutation AddRecurring($input: RecurringInput!) {
    addRecurring(input: $input) {
      _id
      description
      amount
      frequency
      nextDate
      active
    }
  }
`;

export const DELETE_RECURRING = gql`
  mutation DeleteRecurring($id: ID!) {
    deleteRecurring(id: $id)
  }
`;

export const TOGGLE_RECURRING = gql`
  mutation ToggleRecurring($id: ID!) {
    toggleRecurring(id: $id) {
      _id
      active
    }
  }
`;
