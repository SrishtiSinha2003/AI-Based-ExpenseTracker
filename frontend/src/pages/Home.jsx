import { useMutation, useQuery } from "@apollo/client";
import Chart from "../components/Chart";
import TransactionForm from "../components/TransactionForm";
import Cards from "../components/Cards";
import BudgetMeter from "../components/BudgetMeter";
import SpendingHeatmap from "../components/SpendingHeatmap";
import TopSpendingInsights from "../components/TopSpendingInsights";
import TopSpendingDays from "../components/TopSpendingDays";
import { FaSignOutAlt, FaChartPie, FaWallet, FaArrowRight, FaList } from "react-icons/fa";
import { GET_AUTH_USER } from "../graphql/queries/user.query";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const QuickLink = ({ to, icon, label, desc, color }) => (
  <Link to={to} className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 transition p-4 rounded-xl group">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div className="flex-1">
      <p className="text-white font-medium">{label}</p>
      <p className="text-gray-400 text-xs">{desc}</p>
    </div>
    <FaArrowRight className="text-gray-600 group-hover:text-indigo-400 transition" size={12} />
  </Link>
);

const Home = () => {
  const { data } = useQuery(GET_AUTH_USER);
  const [logout] = useMutation(LOGOUT, { refetchQueries: ["GetAuthUser"] });

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out successfully"); }
    catch (error) { toast.error(error.message); }
  };

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto px-4 pb-16">

      {/* Welcome bar */}
      <section className="flex items-center justify-between w-full mb-6 bg-slate-800/50 px-6 py-4 rounded-2xl">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Welcome back, <span className="text-indigo-400">{data?.authUser?.username}</span> 👋
          </h3>
          <p className="text-gray-400 text-sm">Here's your financial overview</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition bg-slate-700 px-3 py-2 rounded-lg">
          <FaSignOutAlt /> Logout
        </button>
      </section>

      {/* Budget meter */}
      <div className="w-full mb-6">
        <BudgetMeter />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
        <QuickLink to="/analytics"
          icon={<FaChartPie className="text-indigo-400" size={18} />}
          label="Analytics" desc="Trends, AI tips, predictions"
          color="bg-indigo-500/10" />
        <QuickLink to="/planning"
          icon={<FaWallet className="text-green-400" size={18} />}
          label="Planning" desc="Budget & saving goals"
          color="bg-green-500/10" />
        <QuickLink to="/transactions"
          icon={<FaList className="text-purple-400" size={18} />}
          label="Transactions" desc="Search & filter all entries"
          color="bg-purple-500/10" />
      </div>

      {/* Chart + Form */}
      <section className="flex flex-col md:flex-row gap-8 w-full justify-center mb-8">
        <div className="flex-shrink-0 w-full md:w-auto">
          <Chart />
        </div>
        <div className="flex-1 min-w-0">
          <TransactionForm />
        </div>
      </section>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
        <TopSpendingInsights />
        <TopSpendingDays />
      </div>

      {/* Heatmap */}
      <div className="w-full mb-8">
        <SpendingHeatmap />
      </div>

      {/* Recent transactions */}
      <section className="w-full pb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
            Recent Transactions
          </h3>
          <Link to="/transactions" className="text-indigo-400 text-xs hover:text-indigo-300 transition">
            View all →
          </Link>
        </div>
        <Cards />
      </section>
    </div>
  );
};

export default Home;
