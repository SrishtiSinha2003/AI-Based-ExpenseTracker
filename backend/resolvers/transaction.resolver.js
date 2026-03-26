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
        categoryInsights: "",
      };
    }

    const summary = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const income = summary.income || 0;
    const expense = summary.expense || 0;
    const saving = summary.saving || 0;

    // 🧠 HEALTH SCORE
    let score = 100;
    if (expense > income) score -= 40;
    if (saving === 0) score -= 20;
    if (expense > income * 0.8) score -= 20;
    if (transactions.length < 3) score -= 10;
    if (score < 0) score = 0;

    // 🚨 ALERTS
    const alerts = [];

    if (expense > income) alerts.push("⚠️ Expenses exceed income");
    if (saving === 0) alerts.push("⚠️ No savings detected");
    if (expense > income * 0.8)
      alerts.push("⚠️ Spending is too high (>80% income)");

    // 📊 CATEGORY TOTALS
    const categoryTotals = transactions.reduce((acc, tx) => {
      if (tx.type === "expense") {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      }
      return acc;
    }, {});

    for (const category in categoryTotals) {
      if (categoryTotals[category] > income * 0.3) {
        alerts.push(`⚠️ High spending on ${category}`);
      }
    }

    if (transactions.length < 3) {
      alerts.push("⚠️ Too few transactions — data may be incomplete");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // 🤖 GENERAL INSIGHTS
    const prompt = `
Give 3 short financial tips.

Rules:
- One line each
- No markdown
- No symbols

Data:
Income: ${income}
Expense: ${expense}
Saving: ${saving}
`;

    const response = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [{ role: "user", content: prompt }],
    });

    // 🤖 CATEGORY-WISE AI INSIGHTS
    const categoryPrompt = `
Analyze spending category-wise.

Rules:
- One line per category
- Max 12 words
- No markdown or symbols

Data:
${JSON.stringify(categoryTotals)}
`;

    const categoryResponse = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [{ role: "user", content: categoryPrompt }],
    });

    return {
      insights: response.choices[0].message.content,
      score,
      alerts,
      categoryInsights:
        categoryResponse.choices[0].message.content,
    };
  } catch (error) {
    console.error(error);
    return {
      insights: "Failed to generate insights",
      score: 0,
      alerts: [],
      categoryInsights: "",
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