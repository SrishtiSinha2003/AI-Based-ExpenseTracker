import SpendingTrend from "../components/SpendingTrends";
import AIInsights from "../components/Insights";
import ChatBot from "../components/ChatBot";

const Analytics = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
        📊 Analytics & Insights
      </h2>
      <p className="text-center text-gray-400 mb-10">Deep dive into your spending patterns</p>

      {/* Spending Trend — full width */}
      <div className="mb-8">
        <SpendingTrend />
      </div>

      {/* AI Insights + ChatBot side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsights />
        <ChatBot />
      </div>
    </div>
  );
};

export default Analytics;
