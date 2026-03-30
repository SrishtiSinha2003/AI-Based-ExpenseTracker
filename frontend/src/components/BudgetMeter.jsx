import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";
import { FaWallet, FaPen, FaCheck } from "react-icons/fa";

const GET_BUDGET = gql`
  query { getBudgetStatus { budget spent remaining } }
`;
const UPDATE_BUDGET = gql`
  mutation ($amount: Int!) { updateBudget(amount: $amount) }
`;

const BudgetMeter = () => {
  const { data, refetch } = useQuery(GET_BUDGET);
  const [updateBudget] = useMutation(UPDATE_BUDGET);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  const budget    = data?.getBudgetStatus?.budget    || 0;
  const spent     = data?.getBudgetStatus?.spent     || 0;
  const remaining = data?.getBudgetStatus?.remaining ?? budget;

  const pct     = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
  const status   = pct >= 90 ? "Critical" : pct >= 70 ? "Warning" : "On Track";
  const statusColor = pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-400" : "text-green-400";

  // Days remaining in month
  const now       = new Date();
  const daysLeft  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const dailyLeft = daysLeft > 0 && remaining > 0 ? Math.round(remaining / daysLeft) : 0;

  const handleSave = async () => {
    const val = parseInt(input);
    if (!val || val < 100) return;
    await updateBudget({ variables: { amount: val } });
    setInput("");
    setEditing(false);
    refetch();
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FaWallet className="text-indigo-400" size={13} />
          Monthly Budget
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${statusColor}`}>{status}</span>
          <button
            onClick={() => { setEditing((v) => !v); setInput(""); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 transition"
          >
            <FaPen size={10} />
          </button>
        </div>
      </div>

      {/* Edit input */}
      {editing && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 gap-1 focus-within:border-indigo-500 transition">
            <span className="text-gray-400 text-sm">₹</span>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="New budget"
              className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
            />
          </div>
          <button onClick={handleSave}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition">
            <FaCheck size={11} />
          </button>
        </div>
      )}

      {/* Amount row */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Spent</p>
          <p className="text-white text-2xl font-bold">₹{spent.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs mb-0.5">of ₹{budget.toLocaleString()}</p>
          <p className="text-sm font-semibold" style={{ color: barColor }}>{pct.toFixed(0)}% used</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}60` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Remaining", value: `₹${remaining.toLocaleString()}`, color: remaining >= 0 ? "text-green-400" : "text-red-400" },
          { label: "Days Left",  value: daysLeft,                         color: "text-blue-400" },
          { label: "Daily Left", value: dailyLeft > 0 ? `₹${dailyLeft.toLocaleString()}` : "—", color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-700/50 rounded-xl p-2.5 text-center">
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetMeter;
