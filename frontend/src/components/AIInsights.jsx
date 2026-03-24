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

  // 🔥 Split insights into clean UI blocks
  const insights =
    data?.getFinancialInsights?.split("\n").filter(Boolean) || [];

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

      {/* Insights */}
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