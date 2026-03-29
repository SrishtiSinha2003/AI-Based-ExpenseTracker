import { useQuery } from "@apollo/client";
import { GET_FINANCIAL_INSIGHTS } from "../graphql/queries/transaction.query";
import { FaRobot, FaSync, FaExclamationTriangle, FaCheckCircle, FaChartLine, FaLightbulb } from "react-icons/fa";

// Strip any stray markdown the AI sneaks through despite instructions
const stripMarkdown = (text) =>
  (text || "")
    .replace(/\*{1,3}/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/^\s*[-+>]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/`+/g, "")
    .replace(/---+/g, "")
    .trim();

const ScoreRing = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Excellent" : score >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <p className="text-sm mt-1 font-medium" style={{ color }}>{label}</p>
    </div>
  );
};

// Parse "LABEL|AMOUNT|ADVICE" lines from backend
const parseCategoryInsights = (raw) => {
  const lines = stripMarkdown(raw).split("\n").filter(Boolean);
  return lines.map((line) => {
    const parts = line.split("|");
    if (parts.length === 3) {
      return {
        label: parts[0].trim(),
        amount: parseFloat(parts[1].trim()) || null,
        advice: parts[2].trim(),
      };
    }
    // fallback: try "Label: advice" format
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      return {
        label: line.slice(0, colonIdx).trim(),
        amount: null,
        advice: line.slice(colonIdx + 1).trim(),
      };
    }
    return { label: null, amount: null, advice: line.trim() };
  }).filter((item) => item.advice);
};

const TIP_COLORS = ["#6366f1", "#8b5cf6", "#ec4899"];

const AIInsights = () => {
  const { loading, error, data, refetch } = useQuery(GET_FINANCIAL_INSIGHTS);

  if (loading)
    return <div className="bg-slate-800 p-6 rounded-2xl animate-pulse h-64" />;

  if (error)
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
        Error: {error.message}
      </div>
    );

  const score     = data?.getFinancialInsights?.score || 0;
  const alerts    = data?.getFinancialInsights?.alerts || [];
  const predicted = data?.getFinancialInsights?.predictedExpense || 0;

  // Tips: strip markdown, split by newline, filter empty
  const tips = stripMarkdown(data?.getFinancialInsights?.insights || "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);

  // Category breakdown: structured parse
  const categoryItems = parseCategoryInsights(data?.getFinancialInsights?.categoryInsights || "");

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg w-full flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <FaRobot className="text-indigo-400" /> AI Financial Insights
        </h2>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-500/30 transition"
        >
          <FaSync size={10} /> Refresh
        </button>
      </div>

      {/* Score + Prediction */}
      <div className="flex items-center gap-5 bg-slate-700/50 p-4 rounded-xl">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
            <FaChartLine size={12} /> Next Month Prediction
          </div>
          <p className="text-2xl font-bold text-white">₹{predicted.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Based on your spending patterns</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">⚠️ Alerts</p>
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              <FaExclamationTriangle className="mt-0.5 shrink-0" size={11} />
              <span>{stripMarkdown(alert)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm">
          <FaCheckCircle size={13} /> No major issues detected
        </div>
      )}

      {/* Category Breakdown */}
      {categoryItems.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">📊 Expense Breakdown</p>
          <div className="space-y-2">
            {categoryItems.map((item, i) => (
              <div key={i} className="bg-slate-700/60 rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {item.label && (
                    <p className="text-white text-sm font-medium truncate">{item.label}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{item.advice}</p>
                </div>
                {item.amount !== null && (
                  <span className="text-red-400 text-sm font-semibold shrink-0">
                    ₹{item.amount.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Tips */}
      {tips.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            <FaLightbulb className="inline mr-1 text-yellow-400" size={11} />
            Smart Tips
          </p>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-slate-700/60 hover:bg-slate-700 transition p-3 rounded-xl"
              >
                {/* Numbered badge */}
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: TIP_COLORS[i] ?? "#6366f1" }}
                >
                  {i + 1}
                </span>
                <p className="text-gray-200 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AIInsights;
