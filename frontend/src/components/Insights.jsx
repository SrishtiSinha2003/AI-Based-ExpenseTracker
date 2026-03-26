import { useQuery } from "@apollo/client";
import { GET_FINANCIAL_INSIGHTS } from "../graphql/queries/transaction.query";
import { FaRobot, FaSync } from "react-icons/fa";

const AIInsights = () => {
  const { loading, error, data, refetch } = useQuery(
    GET_FINANCIAL_INSIGHTS
  );

  if (loading)
    return (
      <div className="bg-slate-800 p-6 rounded-2xl animate-pulse h-40 mt-6 mb-10" />
    );

  if (error)
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mt-6 mb-10">
        Error: {error.message}
      </div>
    );

  const insightsText = data?.getFinancialInsights?.insights || "";
  const score = data?.getFinancialInsights?.score || 0;
  const alerts = data?.getFinancialInsights?.alerts || [];

  const cleanText = insightsText
  .replace(/\\\[.*?\\\]/g, "") // remove LaTeX
  .replace(/\*\*/g, "")       // remove **
  .replace(/---/g, "")        // remove ---
  .replace(/#/g, "")          // remove headings
  .trim();

const insights = cleanText.split("\n").filter(Boolean);

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mt-6 mb-10 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaRobot className="text-indigo-400" />
          AI Financial Insights
        </h2>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg hover:bg-indigo-500/30 transition"
        >
          <FaSync />
          Refresh
        </button>
      </div>

      {/* 💯 SCORE */}
      <p className="text-lg text-green-400 mb-3">
        💯 Score: {score}/100
      </p>

        <div className="mt-4">
  <h3 className="text-indigo-400 font-semibold mb-2">
    📊 Category Insights
  </h3>

  {data?.getFinancialInsights?.categoryInsights
    ?.split("\n")
    .filter(Boolean)
    .map((item, i) => (
      <div
        key={i}
        className="bg-slate-700 p-2 rounded-lg text-gray-200 mb-2"
      >
        {item}
      </div>
    ))}
</div>


      {/* 📈 PREDICTION */}
<p className="text-yellow-400 mb-3">
  📈 Next Month Prediction: ₹
  {data?.getFinancialInsights?.predictedExpense || 0}
</p>

      {/* 🚨 ALERTS */}
      <div className="mb-4 space-y-2">
  {alerts.length > 0 ? (
    alerts.map((alert, i) => (
      <div
        key={i}
        className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg"
      >
        {alert}
      </div>
    ))
  ) : (
    <p className="text-green-400">✅ No major issues detected</p>
  )}
</div>
{/* 📊 CATEGORY INSIGHTS */}
<div className="mt-4">
  <h3 className="text-indigo-400 font-semibold mb-2">
    📊 Category Insights
  </h3>

  {data?.getFinancialInsights?.categoryInsights
    ?.split("\n")
    .filter(Boolean)
    .map((item, i) => (
      <div
        key={i}
        className="bg-slate-700 p-2 rounded-lg text-gray-200 mb-2"
      >
        {item}
      </div>
    ))}
</div>
      {/* INSIGHTS */}
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((item, i) => (
            <div
              key={i}
              className="bg-slate-700 p-3 rounded-lg text-gray-200 hover:bg-slate-600 transition flex gap-2"
            >
              <span>💡</span>
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No insights available</p>
        )}
      </div>
    </div>
  );
};

export default AIInsights;