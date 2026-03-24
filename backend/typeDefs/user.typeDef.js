const userTypeDef = `#graphql
    type User {
        _id: ID!
        username: String!
        name: String!
        password: String!
        profilePic: String
        gender: String!
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

    type LogoutResponse {
        message: String!
    }
`;

export default userTypeDef;
