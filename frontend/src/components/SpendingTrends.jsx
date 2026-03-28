import { useQuery, gql } from "@apollo/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GET_TRANSACTIONS = gql`
  query {
    getTransactions {
      amount
      date
    }
  }
`;

const SpendingTrend = () => {
  const { data } = useQuery(GET_TRANSACTIONS);

  // 🧠 Process monthly data
  const monthlyData = {};

  data?.getTransactions?.forEach((tx) => {
    const month = new Date(tx.date).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += tx.amount;
  });

  const chartData = Object.keys(monthlyData).map((month) => ({
    month,
    amount: monthlyData[month],
  }));

  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-lg w-full md:w-[500px]">
      <h2 className="text-white text-lg font-semibold mb-3">
        📈 Monthly Spending Trend
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrend;