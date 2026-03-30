const notificationTypeDef = `#graphql
    type Notification {
        _id: ID!
        message: String!
        type: String!
        read: Boolean!
        createdAt: String!
    }

    type RecurringTransaction {
        _id: ID!
        amount: Float!
        type: String!
        category: String!
        description: String!
        location: String
        frequency: String!
        nextDate: String!
        active: Boolean!
    }

    type ComparisonData {
        label: String!
        income: Float!
        expense: Float!
        saving: Float!
    }

    extend type Query {
        getNotifications: [Notification!]
        getUnreadCount: Int!
        getRecurring: [RecurringTransaction!]
        getComparison(type: String!): [ComparisonData!]
    }

    extend type Mutation {
        markNotificationsRead: Boolean
        addRecurring(input: RecurringInput!): RecurringTransaction!
        deleteRecurring(id: ID!): Boolean
        toggleRecurring(id: ID!): RecurringTransaction!
    }

    input RecurringInput {
        amount: Float!
        type: String!
        category: String!
        description: String!
        location: String
        frequency: String!
        nextDate: String!
    }
`;

export default notificationTypeDef;
