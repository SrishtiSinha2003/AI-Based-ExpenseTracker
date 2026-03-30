import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { UPDATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { GET_TRANSACTION } from "../graphql/queries/transaction.query";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft, FaCheck, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft } from "react-icons/fa";

const CATEGORY_STYLES = {
  expense: "bg-red-500/20 text-red-400 border-red-500/40",
  income:  "bg-green-500/20 text-green-400 border-green-500/40",
  saving:  "bg-blue-500/20 text-blue-400 border-blue-500/40",
};

const CAT_META = {
  expense: { icon: "💸", color: "#ef4444" },
  income:  { icon: "💰", color: "#22c55e" },
  saving:  { icon: "🏦", color: "#3b82f6" },
};

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon size={11} className="text-gray-500" />} {label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-700/60 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition placeholder-gray-500";

const Transaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useQuery(GET_TRANSACTION, { variables: { id } });
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION);

  const [form, setForm] = useState({
    description: "", type: "card", category: "expense",
    amount: "", location: "", date: "",
  });

  useEffect(() => {
    if (data?.getTransaction) {
      const tx = data.getTransaction;
      setForm({
        description: tx.description || "",
        type:        tx.type        || "card",
        category:    tx.category    || "expense",
        amount:      tx.amount      || "",
        location:    tx.location    || "",
        date:        tx.date?.split("T")[0] || "",
      });
    }
  }, [data]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) {
      toast.error("Fill description, amount and date"); return;
    }
    try {
      await updateTransaction({
        variables: { input: { transactionId: id, ...form, amount: parseFloat(form.amount) } },
      });
      toast.success("Transaction updated!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data?.getTransaction) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400 text-lg">Transaction not found</p>
      <button onClick={() => navigate("/")} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2">
        <FaArrowLeft size={12} /> Back to Dashboard
      </button>
    </div>
  );

  const meta = CAT_META[form.category] || CAT_META.expense;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6">
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
              {meta.icon}
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Edit Transaction</h2>
              <p className="text-gray-400 text-xs capitalize">{form.category} · {form.type}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category toggle */}
            <div className="flex gap-2">
              {["expense", "income", "saving"].map((cat) => (
                <button key={cat} type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                    form.category === cat ? CATEGORY_STYLES[cat] : "bg-slate-700 text-gray-400 border-slate-600 hover:bg-slate-600"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Description */}
            <Field label="Description" icon={FaAlignLeft}>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="e.g. Grocery shopping" className={inputCls} />
            </Field>

            {/* Amount + Type */}
            <div className="flex gap-3">
              <Field label="Amount (₹)">
                <div className="flex items-center bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 gap-1 focus-within:border-indigo-500 transition">
                  <span className="text-gray-500 text-sm">₹</span>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange}
                    placeholder="0" min={1} max={1000000}
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500" />
                </div>
              </Field>
              <Field label="Payment Type">
                <select name="type" value={form.type} onChange={handleChange}
                  className={inputCls}>
                  <option value="card">💳 Card</option>
                  <option value="cash">💵 Cash</option>
                </select>
              </Field>
            </div>

            {/* Location */}
            <Field label="Location" icon={FaMapMarkerAlt}>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Mumbai" className={inputCls} />
            </Field>

            {/* Date */}
            <Field label="Date" icon={FaCalendarAlt}>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className={`${inputCls} [color-scheme:dark]`} />
            </Field>

            {/* Submit */}
            <button type="submit" disabled={updating}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20">
              <FaCheck size={12} />
              {updating ? "Updating..." : "Update Transaction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
