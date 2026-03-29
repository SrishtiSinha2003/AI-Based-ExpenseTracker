import { FaTrash, FaEdit, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";
import { DELETE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

const CATEGORY_META = {
  income:  { icon: "💰", color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  badge: "bg-green-500/15 text-green-400" },
  expense: { icon: "💸", color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  badge: "bg-red-500/15 text-red-400" },
  saving:  { icon: "🏦", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", badge: "bg-blue-500/15 text-blue-400" },
};

const Card = ({ transaction }) => {
  const [deleteTransaction, { loading }] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetStatistics"],
  });

  const handleDelete = async () => {
    try {
      await deleteTransaction({ variables: { id: transaction._id } });
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const meta = CATEGORY_META[transaction.category] || CATEGORY_META.expense;
  const formattedDate = transaction.date
    ? new Date(transaction.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div
      className="relative rounded-2xl p-5 w-72 md:w-80 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
      style={{
        background: `linear-gradient(135deg, ${meta.bg}, rgba(15,23,42,0.9))`,
        border: `1px solid ${meta.border}`,
        boxShadow: `0 4px 24px ${meta.bg}`,
      }}
    >
      {/* Subtle glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: meta.color }}
      />

      {/* Top row: icon + category + actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${meta.color}20`, border: `1px solid ${meta.border}` }}
          >
            {meta.icon}
          </div>
          <div>
            <p className="text-white font-semibold capitalize text-sm">{transaction.category}</p>
            <p className="text-gray-500 text-xs">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDelete} disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
            <FaTrash size={11} />
          </button>
          <Link to={`/transaction/${transaction._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition">
            <FaEdit size={11} />
          </Link>
        </div>
      </div>

      {/* Amount — prominent */}
      <div className="mb-4">
        <p className="text-3xl font-bold" style={{ color: meta.color }}>
          ₹{transaction.amount.toLocaleString()}
        </p>
        {transaction.description && (
          <p className="text-gray-300 text-sm mt-0.5 truncate">{transaction.description}</p>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          {transaction.type === "card" ? <FaCreditCard size={11} /> : <FaMoneyBillWave size={11} />}
          <span className="capitalize">{transaction.type}</span>
        </div>

        {transaction.location && (
          <div className="flex items-center gap-1 text-gray-400 text-xs max-w-[120px]">
            <FaMapMarkerAlt size={10} className="shrink-0" />
            <span className="truncate">{transaction.location}</span>
          </div>
        )}

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
          {transaction.category}
        </span>
      </div>
    </div>
  );
};

export default Card;
