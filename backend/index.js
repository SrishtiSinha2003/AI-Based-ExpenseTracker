import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";
import connectMongo from "connect-mongodb-session";
import session from "express-session";
import passport from "passport";
import { buildContext } from "graphql-passport";
import { configurePassport } from "./passport/passport.config.js";
import Recurring from "./models/recurring.model.js";
import Transaction from "./models/transaction.model.js";
import Notification from "./models/notification.model.js";
import User from "./models/user.model.js";

dotenv.config({ path: path.resolve("./.env") });
configurePassport();

const app = express();

const httpServer = http.createServer(app);

const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 3,
      httpOnly: true,
    },
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),

  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);
app.use(express.static(path.join(path.resolve(), "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 4000;
await connectDB();
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

// Cron: runs every day at midnight — processes recurring transactions
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const due = await Recurring.find({ active: true, nextDate: { $lte: todayStr } });

    for (const rec of due) {
      // Create the transaction
      await Transaction.create({
        userId: rec.userId,
        amount: rec.amount,
        type: rec.type,
        category: rec.category,
        description: rec.description,
        location: rec.location || "Auto",
        date: todayStr,
      });

      // Compute next date
      const next = new Date(today);
      if (rec.frequency === "daily")   next.setDate(next.getDate() + 1);
      if (rec.frequency === "weekly")  next.setDate(next.getDate() + 7);
      if (rec.frequency === "monthly") next.setMonth(next.getMonth() + 1);
      rec.nextDate = next.toISOString().split("T")[0];
      await rec.save();

      // Notify user
      await Notification.create({
        userId: rec.userId,
        message: `Auto-added: ${rec.category} ₹${rec.amount} — ${rec.description}`,
        type: "info",
      });

      // Budget alert check
      const user = await User.findById(rec.userId);
      if (user && rec.category === "expense") {
        const month = todayStr.slice(0, 7);
        const txs = await Transaction.find({ userId: rec.userId });
        const monthlyExpense = txs
          .filter((t) => t.category === "expense" && t.date?.startsWith(month))
          .reduce((s, t) => s + t.amount, 0);
        const budget = user.budget || 20000;
        if (monthlyExpense >= budget * 0.9) {
          await Notification.create({
            userId: rec.userId,
            message: `⚠️ You've used ${Math.round((monthlyExpense / budget) * 100)}% of your monthly budget.`,
            type: "warning",
          });
        }
      }
    }
    console.log(`Cron: processed ${due.length} recurring transactions`);
  } catch (err) {
    console.error("Cron error:", err);
  }
});

console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
