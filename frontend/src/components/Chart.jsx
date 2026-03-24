import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_STATISTICS } from "../graphql/queries/transaction.query";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
  const { data, loading, error } = useQuery(GET_STATISTICS);

  const chartColors = {
    expense: "#ef4444",
    income: "#22c55e",
    saving: "#3b82f6",
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
        cutout: "70%", // 🔥 thinner donut (modern look)
      },
    ],
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (data) {
      const stats = data.getStatistics;

      const categories = stats.map((item) => item.category);
      const values = stats.map((item) => item.total);

      const colors = categories.map((cat) => chartColors[cat]);

      const totalAmount = values.reduce((a, b) => a + b, 0);

      setTotal(totalAmount);

      setChartData({
        labels: categories,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
            cutout: "70%",
          },
        ],
      });
    }
  }, [data]);

  if (loading)
    return (
      <div className="bg-slate-800 p-6 rounded-2xl animate-pulse h-64" />
    );

  if (error)
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
        Error: {error.message}
      </div>
    );

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-white">
        📊 Spending Overview
      </h2>

      {data?.getStatistics?.length > 0 ? (
        <div className="relative">
          {/* Chart */}
          <Doughnut
            data={chartData}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    color: "#cbd5f5",
                    padding: 20,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `₹${context.raw}`;
                    },
                  },
                },
              },
            }}
          />

          {/* 🔥 Center Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-white text-xl font-bold">
              ₹{total}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center py-10">
          No data available
        </div>
      )}
    </div>
  );
};

export default Chart;