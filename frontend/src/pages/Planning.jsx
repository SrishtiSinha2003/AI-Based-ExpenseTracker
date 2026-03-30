import Budget from "../components/Budget";
import SavingGoal from "../components/SavingGoals";
import RecurringTransactions from "../components/RecurringTransactions";
import ExportPDF from "../components/ExportPDF";

const Planning = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        💰 Financial Planning
      </h2>
      <p className="text-center text-gray-400 mb-10">Manage your budget, goals and recurring payments</p>

      {/* Row 1: Budget + Saving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-semibold">Budget Planner</h3>
          <Budget />
          <div className="bg-slate-800 p-4 rounded-xl text-sm text-gray-400">
            <p className="text-white font-medium mb-2">💡 Budget Tips</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Follow the 50/30/20 rule — needs, wants, savings</li>
              <li>Review your budget at the start of each month</li>
              <li>Track every expense, even small ones</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-semibold">Saving Goals</h3>
          <SavingGoal />
          <div className="bg-slate-800 p-4 rounded-xl text-sm text-gray-400">
            <p className="text-white font-medium mb-2">🎯 Goal Tips</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Set SMART goals — Specific, Measurable, Achievable</li>
              <li>Automate savings transfers on payday</li>
              <li>Celebrate small milestones to stay motivated</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Row 2: Recurring + Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecurringTransactions />
        <ExportPDF />
      </div>
    </div>
  );
};

export default Planning;
