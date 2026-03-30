import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { useState, useMemo } from "react";

const DAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Returns YYYY-MM-DD string from a Date in local time
const toLocalDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getColor = (amount, max) => {
  if (!amount || amount === 0) return { bg: "#1e293b", opacity: 1 };
  const intensity = Math.min(amount / max, 1);
  if (intensity < 0.25) return { bg: "#ef4444", opacity: 0.25 };
  if (intensity < 0.5)  return { bg: "#ef4444", opacity: 0.5 };
  if (intensity < 0.75) return { bg: "#ef4444", opacity: 0.75 };
  return { bg: "#ef4444", opacity: 1 };
};

const SpendingHeatmap = () => {
  const { data, loading } = useQuery(GET_TRANSACTIONS);
  const [tooltip, setTooltip] = useState(null); // { date, amount, x, y }
  const [selectedDay, setSelectedDay] = useState(null);

  // Build last 365 days grid
  const { days, dailyMap, maxAmount } = useMemo(() => {
    const dailyMap = {};
    (data?.getTransactions || []).forEach((tx) => {
      if (tx.category !== "expense") return;
      const dateStr = (tx.date || "").split("T")[0];
      if (!dateStr) return;
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + tx.amount;
    });

    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(toLocalDateStr(d));
    }

    const maxAmount = Math.max(...Object.values(dailyMap), 1);
    return { days, dailyMap, maxAmount };
  }, [data]);

  // Pad start so first day aligns to correct weekday column
  const firstDayOfWeek = new Date(days[0]).getDay();
  const padded = [...Array(firstDayOfWeek).fill(null), ...days];

  // Group into weeks (columns of 7)
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels: find first day of each month in the grid
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    week.forEach((d) => {
      if (!d) return;
      const date = new Date(d + "T00:00:00");
      if (date.getDate() === 1) {
        monthLabels.push({ week: wi, label: MONTHS[date.getMonth()] });
      }
    });
  });

  // Transactions for selected day
  const selectedTxs = selectedDay
    ? (data?.getTransactions || []).filter((tx) => (tx.date || "").split("T")[0] === selectedDay)
    : [];

  if (loading) return <div className="bg-slate-800 rounded-2xl animate-pulse h-44 w-full" />;

  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">🔥 Spending Heatmap</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>Less</span>
          {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
            <div key={o} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(239,68,68,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 ml-7">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.week === wi);
              return (
                <div key={wi} className="w-3 text-[9px] text-gray-500 text-center">
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 rows (days) × N cols (weeks) */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAYS.map((d, i) => (
                <div key={d} className="w-5 h-3 text-[9px] text-gray-500 flex items-center justify-end pr-1">
                  {i % 2 === 1 ? d.slice(0, 1) : ""}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((dateStr, di) => {
                  if (!dateStr) return <div key={di} className="w-3 h-3" />;
                  const amount = dailyMap[dateStr] || 0;
                  const { bg, opacity } = getColor(amount, maxAmount);
                  const isSelected = selectedDay === dateStr;
                  return (
                    <div
                      key={dateStr}
                      className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                      style={{
                        backgroundColor: bg,
                        opacity,
                        outline: isSelected ? "1px solid #6366f1" : "none",
                        outlineOffset: "1px",
                      }}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      onMouseEnter={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setTooltip({ date: dateStr, amount, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-600 text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
        >
          <p className="font-medium">{tooltip.date}</p>
          <p className="text-red-400">{tooltip.amount > 0 ? `₹${tooltip.amount.toLocaleString()} spent` : "No expenses"}</p>
        </div>
      )}

      {/* Selected day transactions */}
      {selectedDay && (
        <div className="mt-4 border-t border-slate-700 pt-4">
          <p className="text-white text-xs font-medium mb-2">
            {selectedDay} — {selectedTxs.length > 0 ? `${selectedTxs.length} transaction${selectedTxs.length > 1 ? "s" : ""}` : "No transactions"}
          </p>
          {selectedTxs.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {selectedTxs.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between bg-slate-700/50 px-3 py-2 rounded-lg">
                  <div>
                    <p className="text-white text-xs font-medium">{tx.description}</p>
                    <p className="text-gray-400 text-[10px] capitalize">{tx.category} · {tx.type}</p>
                  </div>
                  <span className={`text-xs font-semibold ${
                    tx.category === "income" ? "text-green-400" :
                    tx.category === "saving" ? "text-blue-400" : "text-red-400"
                  }`}>
                    ₹{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpendingHeatmap;
