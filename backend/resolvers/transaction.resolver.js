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
        const userId = context.getUser().id;
        return await Transaction.find({ userId });
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
        const userId = context.getUser().id;
        const transaction = await Transaction.findOne({
          _id: transactionId,
          userId,
        });
        if (!transaction) throw new Error("Transaction not found");
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
        const userId = context.getUser().id;
        const transactions = await Transaction.find({ userId });

        const stats = transactions.reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {});

        return Object.keys(stats).map((key) => ({
          category: key,
          total: stats[key],
        }));
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },

    // 🔥 AI FINANCIAL INSIGHTS
    getFinancialInsights: async (_, __, context) => {
  try {
    const user = await context.getUser();
    if (!user) throw new Error("Unauthorized");

    const userId = user.id || user._id;
    const transactions = await Transaction.find({ userId });

    if (transactions.length === 0) {
      return {
        insights: "No transactions found.",
        score: 0,
        alerts: [],
      };
    }

    const summary = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const income = summary.income || 0;
    const expense = summary.expense || 0;
    const saving = summary.saving || 0;

    // 🧠 HEALTH SCORE LOGIC
    let score = 100;

    if (expense > income) score -= 40;
    if (saving === 0) score -= 20;
    if (expense > income * 0.8) score -= 20;
    if (transactions.length < 3) score -= 10;

    if (score < 0) score = 0;

    // 🚨 ALERTS
    const alerts = [];

    if (expense > income) {
      alerts.push("⚠️ Expenses exceed income");
    }

    if (saving === 0) {
      alerts.push("⚠️ No savings detected");
    }

    if (expense > income * 0.8) {
      alerts.push("⚠️ Spending is too high");
    }

    // 🤖 AI INSIGHTS (SHORT)
    const prompt = `
You are a financial assistant.

Give ONLY 3-4 short insights.

Rules:
- No markdown
- No headings
- No symbols like ** or ###
- No LaTeX
- No equations
- Each point in one line
- Max 15 words

Data:
Income: ${income}
Expense: ${expense}
Saving: ${saving}
`;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [{ role: "user", content: prompt }],
    });

    return {
      insights: response.choices[0].message.content,
      score,
      alerts,
    };
  } catch (error) {
    console.error(error);
    return {
      insights: "Failed to generate insights",
      score: 0,
      alerts: [],
    };
  }
},

    // 🤖 AI CHATBOT
    chatWithAI: async (_, { message }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const userId = user.id || user._id;
        const transactions = await Transaction.find({ userId });

        const prompt = `
You are a financial assistant.

User question: ${message}

User financial data:
${JSON.stringify(transactions)}

Answer briefly in 2-3 lines.
`;

        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const response = await groq.chat.completions.create({
          model: "groq/compound",
          messages: [{ role: "user", content: prompt }],
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error("🔥 Chatbot Error:", error);
        return "AI failed to respond.";
      }
    },
  },

  Mutation: {
    addTransaction: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");

        if (input.amount < 0 || input.amount > 1000000) {
          throw new Error("Invalid amount");
        }

        if (!input.description || !input.date || !input.amount) {
          throw new Error("Missing required fields");
        }

        const userId = context.getUser().id;
        const newTx = new Transaction({ ...input, userId });

        await newTx.save();
        return newTx;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },

    updateTransaction: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");

        const userId = context.getUser().id;
        const { transactionId, ...updates } = input;

        return await Transaction.findOneAndUpdate(
          { _id: transactionId, userId },
          updates,
          { new: true }
        );
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },

    deleteTransaction: async (_, { transactionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");

        const userId = context.getUser().id;

        return await Transaction.findOneAndDelete({
          _id: transactionId,
          userId,
        });
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },

  Transaction: {
    user: async (parent) => {
      try {
        return await User.findById(parent.userId);
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
};

export default transactionResolver;