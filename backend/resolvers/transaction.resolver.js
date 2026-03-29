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
      return { insights: "No transactions found.", score: 0, alerts: [], categoryInsights: "", predictedExpense: 0 };
    }

    // ✅ FIX: use tx.category (not tx.description) to sum income/expense/saving
    let income = 0, expense = 0, saving = 0;
    transactions.forEach((tx) => {
      const cat = tx.category?.toLowerCase();
      if (cat === "income")  income  += tx.amount;
      else if (cat === "expense") expense += tx.amount;
      else if (cat === "saving")  saving  += tx.amount;
    });

    // ✅ SCORE: weighted formula (0–100)
    let score = 50; // base
    // savings ratio bonus (up to +25)
    const totalIn = income + saving;
    if (totalIn > 0) score += Math.min(25, Math.round((saving / totalIn) * 25));
    // expense ratio penalty (up to -35)
    if (income > 0) {
      const expRatio = expense / income;
      if (expRatio <= 0.5)       score += 25;
      else if (expRatio <= 0.7)  score += 10;
      else if (expRatio <= 0.9)  score -= 10;
      else if (expRatio <= 1.0)  score -= 25;
      else                       score -= 35;
    } else {
      // no income at all
      score -= 20;
    }
    if (saving <= 0) score -= 10;
    score = Math.max(0, Math.min(100, score));

    // 🚨 ALERTS
    const alerts = [];
    if (expense > income)          alerts.push("⚠️ Expenses exceed income");
    if (saving <= 0)               alerts.push("⚠️ No savings detected");
    if (income > 0 && expense > income * 0.8) alerts.push("⚠️ Spending is above 80% of income");
    if (transactions.length < 3)   alerts.push("⚠️ Too few transactions — data may be incomplete");

    // 📊 expense breakdown by description (what the money was spent on)
    const categoryTotals = transactions.reduce((acc, tx) => {
      if (tx.category?.toLowerCase() === "expense") {
        const label = tx.description || "Other";
        acc[label] = (acc[label] || 0) + tx.amount;
      }
      return acc;
    }, {});
    for (const label in categoryTotals) {
      if (expense > 0 && categoryTotals[label] > expense * 0.3)
        alerts.push(`⚠️ High spending on "${label}"`);
    }

    // 📈 PREDICTION: average monthly expense
    const monthlyExpenses = {};
    transactions
      .filter((tx) => tx.category?.toLowerCase() === "expense")
      .forEach((tx) => {
        // Split string directly to avoid UTC shift (same fix as frontend)
        const parts = (tx.date || "").split("T")[0].split("-");
        if (parts.length < 2) return;
        const key = `${parts[0]}-${parts[1]}`;
        monthlyExpenses[key] = (monthlyExpenses[key] || 0) + tx.amount;
      });
    const monthValues = Object.values(monthlyExpenses);
    const predictedExpense = monthValues.length
      ? Math.round(monthValues.reduce((a, b) => a + b, 0) / monthValues.length)
      : 0;

    // helper: strip ALL markdown / symbols from AI text
    const cleanAI = (text) =>
      text
        .replace(/\*{1,3}/g, "")           // *, **, ***
        .replace(/_{1,2}/g, "")             // _, __
        .replace(/~~.*?~~/g, "")            // strikethrough
        .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline code / code blocks
        .replace(/#{1,6}\s*/g, "")          // headings
        .replace(/^\s*[-+>]\s+/gm, "")     // bullet points - + >
        .replace(/^\s*\d+[.):]\s+/gm, "")  // numbered lists 1. 1) 1:
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → keep label
        .replace(/---+/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const [insightRes, categoryRes] = await Promise.all([
      groq.chat.completions.create({
        model: "groq/compound",
        messages: [{
          role: "system",
          content: "You are a financial advisor. Output ONLY plain text. Absolutely no markdown. No asterisks, no dashes, no bullet points, no bold, no italic, no numbering, no symbols of any kind. Write each tip as a plain sentence on its own line with nothing before it."
        }, {
          role: "user",
          content: `Income: Rs ${income}\nExpense: Rs ${expense}\nSaving: Rs ${saving}\nScore: ${score}/100\n\nWrite exactly 3 financial tips. Each tip is one plain sentence on its own line. No symbols, no numbers, no dashes before the tip.`
        }],
        temperature: 0.4,
        max_tokens: 180,
      }),
      groq.chat.completions.create({
        model: "groq/compound",
        messages: [{
          role: "system",
          content: "Output ONLY plain text lines. No markdown, no asterisks, no dashes, no bullets, no bold. Each line must follow this exact format: LABEL|AMOUNT|ADVICE where LABEL is the expense name, AMOUNT is the rupee amount as a number, and ADVICE is a short plain text suggestion. Nothing else."
        }, {
          role: "user",
          content: `Expense items: ${JSON.stringify(categoryTotals)}\nTotal income: Rs ${income}\n\nFor each expense item output one line in format: LABEL|AMOUNT|ADVICE. Plain text only, no symbols.`
        }],
        temperature: 0.2,
        max_tokens: 200,
      }),
    ]);

    return {
      insights: cleanAI(insightRes.choices[0].message.content),
      score,
      alerts,
      categoryInsights: cleanAI(categoryRes.choices[0].message.content),
      predictedExpense,
    };
  } catch (error) {
    console.error("getFinancialInsights error:", error);
    return { insights: "Failed to generate insights", score: 0, alerts: [], categoryInsights: "", predictedExpense: 0 };
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