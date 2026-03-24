import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Transaction from "../models/transaction.model.js";

const userResolver = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    getUser: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
  Mutation: {
    register: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userExists = await User.findOne({ username });
        if (userExists) {
          throw new Error("Username already exists");
        }

        const profilePicMan =
          "https://avatar.iran.liara.run/public/boy?username=" + username;
        const profilePicWoman =
          "https://avatar.iran.liara.run/public/girl?username=" + username;

        const profilePic = gender === "male" ? profilePicMan : profilePicWoman;

        const user = new User({
          username,
          name,
          password: hashedPassword,
          gender,
          profilePic,
        });

        await user.save();
        await context.login(user);
        return user;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;

        if (!username || !password) {
          throw new Error("All fields are required");
        }

        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((error) => {
          if (error) {
            throw new Error("An error occurred");
          }
        });
        context.res.clearCookie("connect.sid");

        return { message: "Logged out" };
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
  User: {
    transactions: async (parent) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "An error occurred");
      }
    },
  },
};

export default userResolver;
