import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_STATISTICS } from "../graphql/queries/transaction.query";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_META = {
  expense: { color: "#ef4444", glow: "rgba(239,68,68,0.35)", label: "Expense", icon: "💸" },
  income:  { color: "#22c55e", glow: "rgba(34,197,94,0.35)",  label: "Income",  icon: "💰" },
  saving:  { color: "#3b82f6", glow: "rgba(59,130,246,0.35)", label: "Saving",  icon: "🏦" },
};

// Custom plugin: glow shadow on arcs
const glowPlugin = {
  id: "arcGlow",
  beforeDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(139,92,246,0.4)";
    ctx.restore();
  },
};

const Chart = () => {
  const { data, loading, error } = useQuery(GET_STATISTICS);
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: "72%" }] });
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (data?.getStatistics?.length) {
      const s = data.getStatistics;
      const totalAmt = s.reduce((a, b) => a + b.total, 0);
      setTotal(totalAmt);
      setStats(s);
      setChartData({
        labels: s.map((i) => CATEGORY_META[i.category]?.label || i.category),
        datasets: [{
          data: s.map((i) => i.total),
          backgroundColor: s.map((i) => CATEGORY_META[i.category]?.color),
          hoverBackgroundColor: s.map((i) => CATEGORY_META[i.category]?.color),
          borderWidth: 3,
          borderColor: "#0f172a",
          hoverOffset: 10,
          cutout: "72%",
        }],
      });
    }
  }, [data]);

  if (loading) return <div className="bg-slate-800/60 p-6 rounded-2xl animate-pulse h-72 w-full max-w-sm" />;
  if (error) return <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">Error: {error.message}</div>;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700/50">
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block shadow-[0_0_6px_2px_rgba(99,102,241,0.6)]" />
          Spending Overview
        </h2>
        <span className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded-lg">All time</span>
      </div>

      {data?.getStatistics?.length > 0 ? (
        <>
          {/* Donut */}
          <div className="relative flex items-center justify-center" style={{ height: 220 }}>
            {/* Outer glow ring */}
            <div className="absolute w-44 h-44 rounded-full"
              style={{ boxShadow: "0 0 40px 8px rgba(99,102,241,0.15)", pointerEvents: "none" }} />

            <Doughnut
              data={chartData}
              plugins={[glowPlugin]}
              options={{
                maintainAspectRatio: false,
                animation: { animateRotate: true, duration: 900, easing: "easeInOutQuart" },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    borderWidth: 1,
                    titleColor: "#e2e8f0",
                    bodyColor: "#94a3b8",
                    padding: 10,
                    callbacks: {
                      label: (ctx) => {
                        const pct = ((ctx.raw / total) * 100).toFixed(1);
                        return `  ₹${ctx.raw.toLocaleString()}  (${pct}%)`;
                      },
                    },
                  },
                },
                onHover: (_, elements) => {
                  setActiveIndex(elements.length ? elements[0].index : null);
                },
              }}
            />

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeIndex !== null && stats[activeIndex] ? (
                <>
                  <span className="text-2xl">{CATEGORY_META[stats[activeIndex].category]?.icon}</span>
                  <p className="text-white text-lg font-bold leading-tight">
                    ₹{stats[activeIndex].total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{stats[activeIndex].category}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Total</p>
                  <p className="text-white text-2xl font-bold">₹{total.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{stats.length} categories</p>
                </>
              )}
            </div>
          </div>

          {/* Category breakdown bars */}
          <div className="mt-5 space-y-3">
            {stats.map((item) => {
              const meta = CATEGORY_META[item.category] || {};
              const pct = ((item.total / total) * 100).toFixed(1);
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 flex items-center gap-1.5">
                      <span>{meta.icon}</span> {meta.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{pct}%</span>
                      <span className="text-sm font-semibold" style={{ color: meta.color }}>
                        ₹{item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                        boxShadow: `0 0 6px 1px ${meta.glow}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-gray-500">
          <span className="text-4xl mb-3">📭</span>
          <p>No transactions yet</p>
        </div>
      )}
    </div>
  );
};

export default Chart;
