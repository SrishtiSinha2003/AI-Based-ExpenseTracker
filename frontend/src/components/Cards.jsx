import { useQuery } from "@apollo/client";
import { useState } from "react";
import Card from "./Card";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { FaSearch } from "react-icons/fa";

const FILTERS = ["all", "expense", "income", "saving"];

const FILTER_STYLES = {
  all:     "bg-slate-600 text-white",
  expense: "bg-red-500/20 text-red-400 border border-red-500/30",
  income:  "bg-green-500/20 text-green-400 border border-green-500/30",
  saving:  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

const Cards = () => {
  const { data, loading, error } = useQuery(GET_TRANSACTIONS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  if (loading)
    return (
      <div className="w-full flex flex-wrap gap-4 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-72 md:w-80 h-44 bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  if (error)
    return <p className="text-red-400 text-center">Error loading transactions</p>;

  const transactions = data?.getTransactions || [];

  const filtered = transactions.filter((t) => {
    const matchFilter = filter === "all" || t.category === filter;
    const matchSearch =
      !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f ? FILTER_STYLES[f] : "bg-slate-800 text-gray-400 hover:bg-slate-700"
              }`}
            >
              {f === "all" ? `All (${transactions.length})` : `${f} (${transactions.filter((t) => t.category === f).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 w-full sm:w-56 focus-within:border-indigo-500 transition">
          <FaSearch className="text-gray-500 shrink-0" size={12} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <div className="flex flex-wrap justify-center xl:justify-start gap-4">
          {filtered.map((transaction) => (
            <Card key={transaction._id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 w-full">
          <span className="text-5xl mb-3">🔍</span>
          <p className="text-base">No transactions found</p>
          <p className="text-sm mt-1">Try a different filter or search term</p>
        </div>
      )}
    </div>
  );
};

export default Cards;
