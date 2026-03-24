import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import Groq from "groq-sdk";

const transactionResolver = {
  Query: {
    getTransactions: async (_, __, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser().id;
        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    getTransaction: async (_, { transactionId }, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser().id;
        const transaction = await Transaction.findOne({
          _id: transactionId,
          userId,
        });
        if (!transaction) {
          throw new Error("Transaction not found");
        }
        return transaction;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    getStatistics: async (_, __, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser().id;
        const transactions = await Transaction.find({ userId });
        const statistics = transactions.reduce((acc, transaction) => {
          if (acc[transaction.category]) {
            acc[transaction.category] += transaction.amount;
          } else {
            acc[transaction.category] = transaction.amount;
          }
          return acc;
        }, {});
        return Object.keys(statistics).map((key) => ({
          category: key,
          total: statistics[key],
        }));
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    getFinancialInsights: async (_, __, context) => {
      try {
        const user = await context.getUser();
        if (!user) {
          throw new Error("Unauthorized");
        }
        const userId = user.id || user._id;
        const transactions = await Transaction.find({ userId });

        if (transactions.length === 0) {
          return 'No transactions found. Add some expenses to get insights!';
        }

        // Aggregate data for AI
        const summary = transactions.reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {});

        const totalIncome = summary.income || 0;
        const totalExpense = summary.expense || 0;
        const totalSaving = summary.saving || 0;

        // Prepare prompt for AI
        const prompt = `
You are a smart financial assistant.

Give ONLY 3-4 short insights based on this data.

Rules:
- Keep each point under 20 words
- No headings
- No tables
- No long explanations
- Use simple language
- Use bullet points

Data:
Income: ${totalIncome}
Expense: ${totalExpense}
Savings: ${totalSaving}
Breakdown: ${JSON.stringify(summary)}
Transactions: ${transactions.length}
`;
        

      const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const response = await groq.chat.completions.create({
  model: "groq/compound",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

return response.choices[0].message.content;

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.error("🔥 FULL AI ERROR:");
  console.error(error);
  console.error(error?.response?.data);
  return 'Unable to generate insights at this time. Please try again later.';
      }
    },
  },
  
  Mutation: {
    addTransaction: async (_, { input }, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        if (input.amount < 0 || input.amount > 1000000) {
          throw new Error("Invalid amount");
        }
        if (!input.description || !input.date || !input.amount) {
          throw new Error("Please provide all required fields");
        }
        const userId = await context.getUser().id;
        const newTransaction = new Transaction({ ...input, userId });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    updateTransaction: async (_, { input }, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        if (input.amount < 0 || input.amount > 1000000) {
          throw new Error("Invalid amount");
        }
        const userId = await context.getUser().id;
        const { transactionId, ...updates } = input;
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { _id: transactionId, userId },
          updates,
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    deleteTransaction: async (_, { transactionId }, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser().id;
        const deletedTransaction = await Transaction.findOneAndDelete({
          _id: transactionId,
          userId,
        });
        return deletedTransaction;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
  Transaction: {
    user: async (parent) => {
      try {
        const userId = parent.userId;
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
};

export default transactionResolver;
