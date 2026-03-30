import SpendingTrend from "../components/SpendingTrends";
import AIInsights from "../components/Insights";
import Comparison from "../components/Comparison";

const Analytics = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
        📊 Analytics & Insights
      </h2>
      <p className="text-center text-gray-400 mb-10">Deep dive into your spending patterns</p>

      <div className="mb-6">
        <SpendingTrend />
      </div>

      <div className="mb-6">
        <Comparison />
      </div>

      <div>
        <AIInsights />
      </div>
    </div>
  );
};

export default Analytics;
