import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { useMemo } from "react";
import { FaFire, FaCalendarDay, FaTag, FaArrowUp } from "react-icons/fa";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const InsightCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-slate-700/50 rounded-xl p-4 flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="text-white font-semibold text-sm truncate">{value}</p>
      {sub && <p className="text-gray-500 text-[11px] mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

const TopSpendingInsights = () => {
  const { data, loading } = useQuery(GET_TRANSACTIONS);

  const insights = useMemo(() => {
    const txs = data?.getTransactions || [];
    const now = new Date();
    const thisMonth = txs.filter((tx) => {
      const parts = (tx.date || "").split("T")[0].split("-");
      return parseInt(parts[0]) === now.getFullYear() && parseInt(parts[1]) - 1 === now.getMonth();
    });

    const expenses = thisMonth.filter((t) => t.category === "expense");
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

    // Top 3 expenses by amount
    const top3 = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);

    // Highest spending day
    const byDay = {};
    expenses.forEach((tx) => {
      const d = (tx.date || "").split("T")[0];
      byDay[d] = (byDay[d] || 0) + tx.amount;
    });
    const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];

    // Most frequent description
    const freq = {};
    expenses.forEach((tx) => { freq[tx.description] = (freq[tx.description] || 0) + 1; });
    const topFreq = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

    // Savings rate
    const income = thisMonth.filter((t) => t.category === "income").reduce((s, t) => s + t.amount, 0);
    const savingsRate = income > 0 ? Math.round(((income - totalExpense) / income) * 100) : null;

    return { top3, topDay, topFreq, savingsRate, totalExpense, txCount: expenses.length };
  }, [data]);

  if (loading) return <div className="bg-slate-800 rounded-2xl animate-pulse h-48 w-full" />;

  const { top3, topDay, topFreq, savingsRate, totalExpense, txCount } = insights;
  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FaFire className="text-orange-400" size={13} /> Top Spending Insights
        </h3>
        <span className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded-lg">{monthLabel}</span>
      </div>

      {txCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No expense transactions this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top 3 expenses */}
          {top3.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Expenses</p>
              <div className="space-y-1.5">
                {top3.map((tx, i) => (
                  <div key={tx._id} className="flex items-center justify-between bg-slate-700/40 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">#{i + 1}</span>
                      <p className="text-white text-xs font-medium truncate max-w-[160px]">{tx.description}</p>
                    </div>
                    <span className="text-red-400 text-xs font-semibold">₹{tx.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {topDay && (
              <InsightCard
                icon={<FaCalendarDay size={14} />}
                label="Highest Day"
                value={`₹${topDay[1].toLocaleString()}`}
                sub={topDay[0]}
                color="#f59e0b"
              />
            )}
            {topFreq && (
              <InsightCard
                icon={<FaTag size={14} />}
                label="Most Frequent"
                value={topFreq[0]}
                sub={`${topFreq[1]}x this month`}
                color="#8b5cf6"
              />
            )}
            {savingsRate !== null && (
              <InsightCard
                icon={<FaArrowUp size={14} />}
                label="Savings Rate"
                value={`${Math.max(0, savingsRate)}%`}
                sub={savingsRate >= 20 ? "✅ Above 20% goal" : "⚠️ Below 20% goal"}
                color={savingsRate >= 20 ? "#22c55e" : "#ef4444"}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSpendingInsights;
