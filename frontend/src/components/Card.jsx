import {
  FaCartPlus,
  FaCashRegister,
  FaEdit,
  FaIdCard,
  FaLocationArrow,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { DELETE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

const Card = ({ transaction }) => {
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetStatistics"],
  });

  const handleDelete = async () => {
    try {
      await deleteTransaction({ variables: { id: transaction._id } });
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const styles = {
    income: {
      bg: "from-green-500/20 to-green-700/40",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    expense: {
      bg: "from-red-500/20 to-red-700/40",
      text: "text-red-400",
      border: "border-red-500/30",
    },
    saving: {
      bg: "from-blue-500/20 to-blue-700/40",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
  };

  const current = styles[transaction.category];

  return (
    <div
      className={`rounded-2xl p-5 w-80 md:w-96 
      bg-gradient-to-br ${current.bg} 
      border ${current.border} 
      backdrop-blur-md shadow-lg 
      hover:scale-[1.02] hover:shadow-xl 
      transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xl font-semibold capitalize ${current.text}`}>
          {transaction.category}
        </h3>

        <div className="flex items-center gap-3 text-gray-300">
          <button
            onClick={handleDelete}
            className="hover:text-red-400 transition"
          >
            <FaTrash />
          </button>

          <Link
            to={`/transaction/${transaction._id}`}
            className="hover:text-indigo-400 transition"
          >
            <FaEdit />
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600 mb-3"></div>

      {/* Content */}
      <div className="space-y-2 text-sm text-gray-200">
        <div className="flex items-center gap-2">
          <FaIdCard className="opacity-70" />
          <p className="truncate">
            <span className="text-gray-400">Desc:</span>{" "}
            {transaction.description}
          </p>
        </div>

        <div className="flex items-center gap-2 capitalize">
          <FaCartPlus className="opacity-70" />
          <p>
            <span className="text-gray-400">Type:</span> {transaction.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FaCashRegister className="opacity-70" />
          <p>
            <span className="text-gray-400">Amount:</span>{" "}
            <span className={`font-semibold ${current.text}`}>
              ₹{transaction.amount}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FaLocationArrow className="opacity-70" />
          <p className="truncate">
            <span className="text-gray-400">Location:</span>{" "}
            {transaction.location || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;