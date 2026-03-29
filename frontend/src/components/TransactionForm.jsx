import { useMutation, useQuery } from "@apollo/client";
import { useState, useRef, useEffect } from "react";
import { ADD_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { toast } from "react-hot-toast";
import { FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft } from "react-icons/fa";

const CATEGORY_STYLES = {
  expense: "bg-red-500/20 text-red-400 border-red-500/40",
  income:  "bg-green-500/20 text-green-400 border-green-500/40",
  saving:  "bg-blue-500/20 text-blue-400 border-blue-500/40",
};

const AutocompleteInput = ({ id, name, value, onChange, suggestions, placeholder, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 gap-2 focus-within:border-indigo-500 transition">
        {Icon && <Icon className="text-gray-500 shrink-0" size={13} />}
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => { onChange(e); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
          {filtered.slice(0, 5).map((s) => (
            <li
              key={s}
              onMouseDown={() => { onChange({ target: { name, value: s } }); setOpen(false); }}
              className="px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700 cursor-pointer flex items-center gap-2"
            >
              <span className="text-indigo-400 text-xs">↩</span> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TransactionForm = () => {
  const initialState = { description: "", type: "card", category: "expense", amount: "", location: "", date: "" };
  const [form, setForm] = useState(initialState);

  const { data: txData } = useQuery(GET_TRANSACTIONS);
  const [addTransaction, { loading }] = useMutation(ADD_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetStatistics"],
  });

  const pastDescriptions = [...new Set((txData?.getTransactions || []).map((t) => t.description).filter(Boolean))];
  const pastLocations    = [...new Set((txData?.getTransactions || []).map((t) => t.location).filter(Boolean))];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) {
      toast.error("Please fill description, amount and date");
      return;
    }
    try {
      await addTransaction({ variables: { input: { ...form, amount: parseFloat(form.amount) } } });
      toast.success("Transaction added!");
      setForm(initialState);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-xl">
      <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block shadow-[0_0_6px_2px_rgba(99,102,241,0.6)]" />
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category toggle */}
        <div className="flex gap-2">
          {["expense", "income", "saving"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm({ ...form, category: cat })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                form.category === cat ? CATEGORY_STYLES[cat] : "bg-slate-700 text-gray-400 border-slate-600 hover:bg-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
          <AutocompleteInput
            id="description" name="description" value={form.description}
            onChange={handleChange} suggestions={pastDescriptions}
            placeholder="e.g. Grocery shopping" icon={FaAlignLeft}
          />
        </div>

        {/* Amount + Type row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1.5 block">Amount (₹)</label>
            <div className="flex items-center bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 gap-1 focus-within:border-indigo-500 transition">
              <span className="text-gray-500 text-sm">₹</span>
              <input
                type="number" name="amount" min={1} max={1000000}
                value={form.amount} onChange={handleChange}
                placeholder="0"
                className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1.5 block">Payment Type</label>
            <select
              name="type" value={form.type} onChange={handleChange}
              className="w-full bg-slate-700/60 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition"
            >
              <option value="card">💳 Card</option>
              <option value="cash">💵 Cash</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Location</label>
          <AutocompleteInput
            id="location" name="location" value={form.location}
            onChange={handleChange} suggestions={pastLocations}
            placeholder="e.g. Mumbai" icon={FaMapMarkerAlt}
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
          <div className="flex items-center bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 gap-2 focus-within:border-indigo-500 transition">
            <FaCalendarAlt className="text-gray-500 shrink-0" size={13} />
            <input
              type="date" name="date" value={form.date} onChange={handleChange}
              className="bg-transparent text-white text-sm w-full outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <FaPlus size={12} />
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
