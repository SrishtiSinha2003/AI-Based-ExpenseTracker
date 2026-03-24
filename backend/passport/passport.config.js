import { GraphQLLocalStrategy } from "graphql-passport";
import passport from "passport";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("User not found.");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password.");
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
