import { useQuery, gql } from "@apollo/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useState } from "react";

const GET_TRANSACTIONS = gql`
  query {
    getTransactions {
      amount
      date
      type
      category
    }
  }
`;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SpendingTrend = () => {
  const { data, loading } = useQuery(GET_TRANSACTIONS);
  const [view, setView] = useState("daily"); // daily | monthly

  const now = new Date();
  const currentMonth = now.getMonth();   // local month, 0-indexed
  const currentYear  = now.getFullYear(); // local year

  // Daily data for current month
  const dailyData = {};
  // Monthly data across all months
  const monthlyData = {};

  data?.getTransactions?.forEach((tx) => {
    if (!tx.date) return;

    // Parse date parts directly from the string (YYYY-MM-DD) to avoid
    // UTC-vs-local shift that causes new Date("2025-07-15") to land on July 14 in IST
    const parts = tx.date.split("T")[0].split("-");
    if (parts.length < 3) return;
    const year  = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day   = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return;

    const cat = tx.category?.toLowerCase();

    // Monthly aggregation
    const monthKey = MONTHS[month];
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { month: monthKey, expense: 0, income: 0, saving: 0 };
    if (cat === "expense" || cat === "income" || cat === "saving")
      monthlyData[monthKey][cat] = (monthlyData[monthKey][cat] || 0) + tx.amount;

    // Daily aggregation — only current month
    if (month === currentMonth && year === currentYear) {
      if (!dailyData[day]) dailyData[day] = { day: `${day}`, expense: 0, income: 0, saving: 0 };
      if (cat === "expense" || cat === "income" || cat === "saving")
        dailyData[day][cat] = (dailyData[day][cat] || 0) + tx.amount;
    }
  });

  const dailyChartData = Object.values(dailyData).sort((a, b) => parseInt(a.day) - parseInt(b.day));
  const monthlyChartData = MONTHS.filter((m) => monthlyData[m]).map((m) => monthlyData[m]);

  const chartData = view === "daily" ? dailyChartData : monthlyChartData;
  const xKey = view === "daily" ? "day" : "month";

  if (loading) return <div className="bg-slate-800 p-6 rounded-2xl animate-pulse h-64" />;

  return (
    <div className="bg-slate-800 p-5 rounded-2xl shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">
          📈 {view === "daily" ? `${MONTHS[currentMonth]} ${currentYear} — Daily Trend` : "Monthly Trend"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("daily")}
            className={`text-xs px-3 py-1 rounded-lg transition ${view === "daily" ? "bg-indigo-500 text-white" : "bg-slate-700 text-gray-400 hover:bg-slate-600"}`}
          >
            This Month
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`text-xs px-3 py-1 rounded-lg transition ${view === "monthly" ? "bg-indigo-500 text-white" : "bg-slate-700 text-gray-400 hover:bg-slate-600"}`}
          >
            All Months
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No data for this period</p>
      ) : view === "daily" ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v) => `₹${v}`}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expense" />
            <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incGrad)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="saving" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Saving" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
              formatter={(v) => `₹${v}`}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saving" fill="#3b82f6" name="Saving" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SpendingTrend;
