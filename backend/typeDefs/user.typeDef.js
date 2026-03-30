const userTypeDef = `#graphql
    type User {
        _id: ID!
        username: String!
        name: String!
        password: String!
        profilePic: String
        gender: String!
        budget: Int
        onboardingDone: Boolean
        transactions: [Transaction!]
    }

    type Query {
        getUser(userId: ID!): User
        authUser: User
    }

    type Mutation {
        register(input: RegisterInput!): User
        login(input: LoginInput): User
        logout: LogoutResponse
        updateProfile(input: UpdateProfileInput!): User
        completeOnboarding(budget: Int!): User
    }

    input RegisterInput {
        username: String!
        name: String!
        password: String!
        gender: String!
    }

    input LoginInput {
        username: String!
        password: String!
    }

    input UpdateProfileInput {
        name: String
        gender: String
    }

    type LogoutResponse {
        message: String!
    }

    extend type Mutation {
        updateBudget(amount: Int!): Int
    }
`;

export default userTypeDef;
