import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_RECURRING } from "../graphql/queries/transaction.query";
import { ADD_RECURRING, DELETE_RECURRING, TOGGLE_RECURRING } from "../graphql/mutations/user.mutation";
import { FaPlus, FaTrash, FaPause, FaPlay, FaSync } from "react-icons/fa";
import toast from "react-hot-toast";

const FREQ_COLORS = { daily: "text-yellow-400 bg-yellow-500/10", weekly: "text-blue-400 bg-blue-500/10", monthly: "text-purple-400 bg-purple-500/10" };
const CAT_COLORS  = { income: "text-green-400", expense: "text-red-400", saving: "text-blue-400" };

const RecurringTransactions = () => {
  const { data, refetch } = useQuery(GET_RECURRING);
  const [addRecurring, { loading: adding }] = useMutation(ADD_RECURRING, { refetchQueries: ["GetRecurring"] });
  const [deleteRecurring] = useMutation(DELETE_RECURRING, { refetchQueries: ["GetRecurring"] });
  const [toggleRecurring] = useMutation(TOGGLE_RECURRING, { refetchQueries: ["GetRecurring"] });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "", amount: "", type: "card", category: "expense",
    frequency: "monthly", nextDate: "", location: "",
  });

  const recurring = data?.getRecurring || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.nextDate) {
      toast.error("Fill description, amount and next date"); return;
    }
    try {
      await addRecurring({ variables: { input: { ...form, amount: parseFloat(form.amount) } } });
      toast.success("Recurring transaction added!");
      setForm({ description: "", amount: "", type: "card", category: "expense", frequency: "monthly", nextDate: "", location: "" });
      setShowForm(false);
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteRecurring({ variables: { id } }); toast.success("Deleted"); } catch (e) { toast.error(e.message); }
  };

  const handleToggle = async (id) => {
    try { await toggleRecurring({ variables: { id } }); } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FaSync className="text-indigo-400" size={13} /> Recurring Transactions
        </h3>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg transition">
          <FaPlus size={10} /> Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-700/50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Netflix" className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0" className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-2 outline-none">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="saving">Saving</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-2 outline-none">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-2 outline-none">
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Next Date</label>
            <input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 [color-scheme:dark]" />
          </div>
          <button type="submit" disabled={adding}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg transition">
            {adding ? "Adding..." : "Add Recurring"}
          </button>
        </form>
      )}

      {/* List */}
      {recurring.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No recurring transactions yet</p>
      ) : (
        <div className="space-y-2">
          {recurring.map((r) => (
            <div key={r._id} className={`flex items-center justify-between p-3 rounded-xl border transition ${
              r.active ? "bg-slate-700/50 border-slate-600" : "bg-slate-700/20 border-slate-700 opacity-60"
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-medium truncate">{r.description}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${FREQ_COLORS[r.frequency]}`}>
                    {r.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className={`font-semibold ${CAT_COLORS[r.category]}`}>₹{r.amount.toLocaleString()}</span>
                  <span>Next: {r.nextDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button onClick={() => handleToggle(r._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-600 hover:bg-slate-500 text-gray-300 transition">
                  {r.active ? <FaPause size={9} /> : <FaPlay size={9} />}
                </button>
                <button onClick={() => handleDelete(r._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                  <FaTrash size={9} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;
