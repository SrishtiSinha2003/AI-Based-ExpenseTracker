import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { useMemo } from "react";

const TopSpendingDays = () => {
  const { data, loading } = useQuery(GET_TRANSACTIONS);

  const topDays = useMemo(() => {
    const txs = data?.getTransactions || [];
    const now = new Date();
    const byDay = {};

    txs.forEach((tx) => {
      if (tx.category !== "expense") return;
      const parts = (tx.date || "").split("T")[0].split("-");
      if (parseInt(parts[0]) !== now.getFullYear() || parseInt(parts[1]) - 1 !== now.getMonth()) return;
      const dateStr = (tx.date || "").split("T")[0];
      byDay[dateStr] = (byDay[dateStr] || 0) + tx.amount;
    });

    return Object.entries(byDay)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([date, amount]) => ({ date, amount }));
  }, [data]);

  if (loading) return <div className="bg-slate-800 rounded-2xl animate-pulse h-44 w-full" />;

  const max = topDays[0]?.amount || 1;

  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 w-full">
      <h3 className="text-white font-semibold text-sm mb-4">📅 Top Spending Days This Month</h3>

      {topDays.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No expense data this month</p>
      ) : (
        <div className="space-y-3">
          {topDays.map(({ date, amount }, i) => {
            const pct = (amount / max) * 100;
            const d = new Date(date + "T00:00:00");
            const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-4">#{i + 1}</span>
                    <span className="text-gray-300 text-xs">{label}</span>
                  </div>
                  <span className="text-red-400 text-xs font-semibold">₹{amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: i === 0 ? "#ef4444" : `rgba(239,68,68,${0.8 - i * 0.12})`,
                      boxShadow: i === 0 ? "0 0 8px rgba(239,68,68,0.5)" : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopSpendingDays;
