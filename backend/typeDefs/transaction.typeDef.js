const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        amount: Float!
        type: String!
        category: String!
        date: String!
        description: String!
        location: String
        user: User!
    }

    type FinancialInsights {
    insights: String
    score: Int
    alerts: [String]
    categoryInsights: String
    predictedExpense: Int
    }

    type Query {
        getTransactions: [Transaction!]
        getTransaction(transactionId: ID!): Transaction
        getStatistics: [CategoryStatistics!]
        getFinancialInsights:  FinancialInsights
        chatWithAI(message: String!): String
    }

    type Mutation {
        addTransaction(input: AddTransactionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transactionId: ID!): Transaction!
    }

    type CategoryStatistics {
        category: String!
        total: Float!
    }

    input AddTransactionInput {
        amount: Float!
        type: String!
        category: String!
        date: String!
        description: String!
        location: String
    }

    input UpdateTransactionInput {
        transactionId: ID!
        amount: Float
        type: String
        category: String
        date: String
        description: String
        location: String
    }
`;

export default transactionTypeDef;
