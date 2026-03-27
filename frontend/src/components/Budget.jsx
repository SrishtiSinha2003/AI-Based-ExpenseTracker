import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";

const GET_BUDGET = gql`
  query {
    getBudgetStatus {
      budget
      spent
      remaining
    }
  }
`;

const UPDATE_BUDGET = gql`
  mutation ($amount: Int!) {
    updateBudget(amount: $amount)
  }
`;

const Budget = () => {
  const { data, refetch } = useQuery(GET_BUDGET);
  const [updateBudget] = useMutation(UPDATE_BUDGET);

  const [input, setInput] = useState("");

  const handleUpdate = async () => {
    if (!input) return;

    await updateBudget({
      variables: { amount: parseInt(input) },
    });

    setInput("");
    refetch();
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl text-white shadow-lg">
      <h2 className="text-lg font-bold mb-2">💰 Budget Planner</h2>

      <p>Budget: ₹{data?.getBudgetStatus?.budget}</p>
      <p>Spent: ₹{data?.getBudgetStatus?.spent}</p>
      <p className="text-green-400">
        Remaining: ₹{data?.getBudgetStatus?.remaining}
      </p>

      {/* 🔥 INPUT */}
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          placeholder="Set budget"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="px-2 py-1 rounded text-black w-full"
        />

        <button
          onClick={handleUpdate}
          className="bg-indigo-500 px-3 py-1 rounded"
        >
          Set
        </button>
      </div>
    </div>
  );
};

export default Budget;