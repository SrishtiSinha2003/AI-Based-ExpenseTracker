import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
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


console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
