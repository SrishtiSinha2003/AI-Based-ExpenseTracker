import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["cash", "card"],
  },
  category: {
    type: String,
    enum: ["income", "expense", "saving"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  date: {
    type: String,
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
