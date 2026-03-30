import Notification from "../models/notification.model.js";
import Recurring from "../models/recurring.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const notificationResolver = {
  Query: {
    getNotifications: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      return await Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(20);
    },

    getUnreadCount: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) return 0;
      return await Notification.countDocuments({ userId: user.id, read: false });
    },

    getRecurring: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      return await Recurring.find({ userId: user.id }).sort({ createdAt: -1 });
    },

    getComparison: async (_, { type }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      const transactions = await Transaction.find({ userId: user.id });
      const now = new Date();

      if (type === "monthly") {
        // Last 6 months
        const result = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
          result[key] = { label: key, income: 0, expense: 0, saving: 0 };
        }
        transactions.forEach((tx) => {
          const parts = (tx.date || "").split("T")[0].split("-");
          if (parts.length < 3) return;
          const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1;
          const key = `${MONTHS[m]} ${y}`;
          if (result[key]) {
            const cat = tx.category?.toLowerCase();
            if (cat === "income" || cat === "expense" || cat === "saving")
              result[key][cat] += tx.amount;
          }
        });
        return Object.values(result);
      }

      if (type === "yearly") {
        // Last 3 years
        const result = {};
        for (let i = 2; i >= 0; i--) {
          const y = now.getFullYear() - i;
          result[y] = { label: String(y), income: 0, expense: 0, saving: 0 };
        }
        transactions.forEach((tx) => {
          const parts = (tx.date || "").split("T")[0].split("-");
          if (parts.length < 1) return;
          const y = parseInt(parts[0]);
          if (result[y]) {
            const cat = tx.category?.toLowerCase();
            if (cat === "income" || cat === "expense" || cat === "saving")
              result[y][cat] += tx.amount;
          }
        });
        return Object.values(result);
      }

      return [];
    },
  },

  Mutation: {
    markNotificationsRead: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      await Notification.updateMany({ userId: user.id, read: false }, { read: true });
      return true;
    },

    addRecurring: async (_, { input }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      const rec = new Recurring({ ...input, userId: user.id });
      await rec.save();
      await Notification.create({
        userId: user.id,
        message: `Recurring ${input.category} of ₹${input.amount} (${input.frequency}) added.`,
        type: "info",
      });
      return rec;
    },

    deleteRecurring: async (_, { id }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      await Recurring.findOneAndDelete({ _id: id, userId: user.id });
      return true;
    },

    toggleRecurring: async (_, { id }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      const rec = await Recurring.findOne({ _id: id, userId: user.id });
      if (!rec) throw new Error("Not found");
      rec.active = !rec.active;
      await rec.save();
      return rec;
    },

    updateProfile: async (_, { input }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      const updates = {};
      if (input.name) updates.name = input.name;
      if (input.gender) {
        updates.gender = input.gender;
        const displayName = input.name || user.name;
        updates.profilePic = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${input.gender === "male" ? "6366f1" : "ec4899"}&color=fff&bold=true&size=128`;
      }
      return await User.findByIdAndUpdate(user.id, updates, { new: true });
    },

    completeOnboarding: async (_, { budget }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      const updated = await User.findByIdAndUpdate(
        user.id,
        { budget, onboardingDone: true },
        { new: true }
      );
      await Notification.create({
        userId: user.id,
        message: `Welcome! Your monthly budget is set to ₹${budget}. Start tracking your finances!`,
        type: "success",
      });
      return updated;
    },
  },
};

export default notificationResolver;
