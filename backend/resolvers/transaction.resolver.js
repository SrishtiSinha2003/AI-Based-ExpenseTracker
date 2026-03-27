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

      getBudgetStatus: async (_, __, context) => {
  const user = await context.getUser();
  if (!user) throw new Error("Unauthorized");

  const userId = user.id;
  const transactions = await Transaction.find({ userId });

  let expense = 0;

  transactions.forEach((tx) => {
    if (tx.category?.toLowerCase() === "expense") {
      expense += tx.amount;
    }
  });

  const budget = user.budget || 20000; // 🔥 static (or make dynamic later)

  return {
    budget,
    spent: expense,
    remaining: budget - expense,
  };
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
        predictedExpense: 0,
      };
    }

    // 🧠 INCOME & EXPENSE (FIXED FOR YOUR DATA)
    let income = 0;
    let expense = 0;
    let saving = 0;

transactions.forEach((tx) => {
  const category = tx.description || "Other";

  if (category === "income") {
    income += tx.amount;
  } else if (category === "expense") {
    expense += tx.amount;
  } else if (category === "saving") {
    saving += tx.amount;
  }
});


    // 🧠 HEALTH SCORE
    let score = 100;
    if (expense > income) score -= 40;
    if (saving <= 0) score -= 20;
    if (expense > income * 0.8) score -= 20;
    if (transactions.length < 3) score -= 10;
    if (score < 0) score = 0;

    // 🚨 ALERTS
    const alerts = [];

    if (expense > income) alerts.push("⚠️ Expenses exceed income");
    if (saving <= 0) alerts.push("⚠️ No savings detected");
    if (expense > income * 0.8)
      alerts.push("⚠️ Spending is too high (>80% income)");

    // 📊 CATEGORY TOTALS (FIXED)
    const categoryTotals = transactions.reduce((acc, tx) => {
  if (tx.category?.toLowerCase() === "expense") {
    const category = tx.description || "Other";
    acc[category] = (acc[category] || 0) + tx.amount;
  }
  return acc;
}, {});

    for (const category in categoryTotals) {
      if (categoryTotals[category] > expense * 0.3) {
        alerts.push(`⚠️ High spending on ${category}`);
      }
    }

    if (transactions.length < 3) {
      alerts.push("⚠️ Too few transactions — data may be incomplete");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // 🤖 GENERAL AI INSIGHTS (CLEAN OUTPUT)
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

    // 🤖 CATEGORY AI INSIGHTS
      const categoryPrompt = `
Return ONLY category insights.

Rules:
- One line per category
- Format: Category: short advice
- Max 8 words per line
- No explanation
- No JSON explanation
- No extra text

Example:
Food: Reduce spending
Travel: Moderate spending

Data:
${JSON.stringify(categoryTotals)}
`;

    const categoryResponse = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [{ role: "user", content: categoryPrompt }],
    });

    // 📈 PREDICTION (FIXED)
    const expenseTransactions = transactions.filter(
  (tx) => tx.category?.toLowerCase() === "expense"
);

    const monthlyExpenses = {};

    expenseTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      monthlyExpenses[key] =
        (monthlyExpenses[key] || 0) + tx.amount;
    });

    const months = Object.keys(monthlyExpenses);

    let predictedExpense = 0;

    if (months.length > 0) {
      const total = Object.values(monthlyExpenses).reduce(
        (a, b) => a + b,
        0
      );
      predictedExpense = Math.round(total / months.length);
    }

    return {
      insights: response.choices[0].message.content,
      score,
      alerts,
      categoryInsights:
        categoryResponse.choices[0].message.content,
      predictedExpense,
    };
  } catch (error) {
    console.error(error);
    return {
      insights: "Failed to generate insights",
      score: 0,
      alerts: [],
      categoryInsights: "",
      predictedExpense: 0,
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
    updateBudget: async (_, { amount }, context) => {
  const user = await context.getUser();
  if (!user) throw new Error("Unauthorized");

  user.budget = amount;
  await user.save();

  return user.budget;
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