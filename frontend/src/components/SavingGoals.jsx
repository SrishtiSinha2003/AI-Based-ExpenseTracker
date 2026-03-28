import { useState } from "react";

const SavingGoal = () => {
  const [goal, setGoal] = useState(50000);
  const [saved, setSaved] = useState(10000);

  const percentage = Math.min((saved / goal) * 100, 100);

  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-lg text-white w-[300px]">
      <h2 className="text-lg font-semibold mb-3">🎯 Saving Goal</h2>

      <p>Goal: ₹{goal}</p>
      <p>Saved: ₹{saved}</p>

      {/* Progress bar */}
      <div className="w-full bg-slate-700 h-3 rounded-full mt-3">
        <div
          className="h-3 bg-green-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm mt-2 text-green-400">
        {percentage.toFixed(0)}% completed
      </p>

      {/* Inputs */}
      <div className="mt-3 flex flex-col gap-2">
        <input
          type="number"
          placeholder="Set Goal"
          onChange={(e) => setGoal(Number(e.target.value))}
          className="px-2 py-1 rounded text-black"
        />

        <input
          type="number"
          placeholder="Add Savings"
          onChange={(e) => setSaved(Number(e.target.value))}
          className="px-2 py-1 rounded text-black"
        />
      </div>
    </div>
  );
};

export default SavingGoal;