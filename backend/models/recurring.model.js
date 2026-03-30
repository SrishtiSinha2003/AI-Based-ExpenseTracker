import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["cash", "card"], required: true },
  category: { type: String, enum: ["income", "expense", "saving"], required: true },
  description: { type: String, required: true },
  location: { type: String, default: "" },
  frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
  nextDate: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Recurring = mongoose.model("Recurring", recurringSchema);
export default Recurring;
