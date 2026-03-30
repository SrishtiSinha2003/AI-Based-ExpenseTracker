import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_COMPARISON } from "../graphql/queries/transaction.query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Comparison = () => {
  const [type, setType] = useState("monthly");
  const { data, loading } = useQuery(GET_COMPARISON, { variables: { type } });

  const chartData = data?.getComparison || [];

  if (loading) return <div className="bg-slate-800 rounded-2xl animate-pulse h-64" />;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">
          📊 {type === "monthly" ? "Last 6 Months" : "Year-over-Year"} Comparison
        </h3>
        <div className="flex gap-2">
          {["monthly", "yearly"].map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`text-xs px-3 py-1 rounded-lg capitalize transition ${
                type === t ? "bg-indigo-500 text-white" : "bg-slate-700 text-gray-400 hover:bg-slate-600"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-400 text-center py-10 text-sm">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
              formatter={(v) => `₹${v.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            <Bar dataKey="income"  fill="#22c55e" name="Income"  radius={[3, 3, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[3, 3, 0, 0]} />
            <Bar dataKey="saving"  fill="#3b82f6" name="Saving"  radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Comparison;
