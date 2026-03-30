import { useQuery } from "@apollo/client";
import { useState, useMemo } from "react";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import Card from "../components/Card";
import { FaSearch, FaFilter, FaSort, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["all", "expense", "income", "saving"];
const TYPES      = ["all", "card", "cash"];
const SORTS      = [
  { value: "date-desc",   label: "Newest First" },
  { value: "date-asc",    label: "Oldest First" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "amount-asc",  label: "Lowest Amount" },
];

const CAT_STYLES = {
  all:     "bg-slate-700 text-white",
  expense: "bg-red-500/20 text-red-400 border border-red-500/30",
  income:  "bg-green-500/20 text-green-400 border border-green-500/30",
  saving:  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

const PAGE_SIZE = 9;

const Transactions = () => {
  const { data, loading } = useQuery(GET_TRANSACTIONS);

  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("all");
  const [type,      setType]      = useState("all");
  const [sort,      setSort]      = useState("date-desc");
  const [minAmt,    setMinAmt]    = useState("");
  const [maxAmt,    setMaxAmt]    = useState("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [page,      setPage]      = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let txs = data?.getTransactions || [];

    if (search)   txs = txs.filter((t) => t.description?.toLowerCase().includes(search.toLowerCase()) || t.location?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "all") txs = txs.filter((t) => t.category === category);
    if (type !== "all")     txs = txs.filter((t) => t.type === type);
    if (minAmt)   txs = txs.filter((t) => t.amount >= parseFloat(minAmt));
    if (maxAmt)   txs = txs.filter((t) => t.amount <= parseFloat(maxAmt));
    if (dateFrom) txs = txs.filter((t) => (t.date || "").split("T")[0] >= dateFrom);
    if (dateTo)   txs = txs.filter((t) => (t.date || "").split("T")[0] <= dateTo);

    txs = [...txs].sort((a, b) => {
      if (sort === "date-desc")   return (b.date || "") > (a.date || "") ? 1 : -1;
      if (sort === "date-asc")    return (a.date || "") > (b.date || "") ? 1 : -1;
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc")  return a.amount - b.amount;
      return 0;
    });

    return txs;
  }, [data, search, category, type, sort, minAmt, maxAmt, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = category !== "all" || type !== "all" || minAmt || maxAmt || dateFrom || dateTo;

  const clearFilters = () => {
    setCategory("all"); setType("all");
    setMinAmt(""); setMaxAmt("");
    setDateFrom(""); setDateTo("");
    setPage(1);
  };

  const inputCls = "bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition placeholder-gray-500 w-full [color-scheme:dark]";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
        💳 All Transactions
      </h2>
      <p className="text-center text-gray-400 mb-8">Search, filter and manage all your transactions</p>

      {/* Search + Filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
          <FaSearch className="text-gray-500 shrink-0" size={13} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by description or location..."
            className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500" />
          {search && <FaTimes className="text-gray-500 cursor-pointer hover:text-white" size={12} onClick={() => setSearch("")} />}
        </div>

        <div className="flex gap-2">
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-slate-800 border border-slate-700 text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${showFilters || hasActiveFilters ? "bg-indigo-500 text-white" : "bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700"}`}>
            <FaFilter size={11} /> Filters {hasActiveFilters && `(active)`}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${category === c ? CAT_STYLES[c] : "bg-slate-800 text-gray-400 hover:bg-slate-700"}`}>
            {c === "all" ? `All (${(data?.getTransactions || []).length})` : `${c} (${(data?.getTransactions || []).filter((t) => t.category === c).length})`}
          </button>
        ))}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Payment Type</label>
                <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={inputCls}>
                  {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t === "all" ? "All Types" : t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Min Amount</label>
                <input type="number" value={minAmt} onChange={(e) => { setMinAmt(e.target.value); setPage(1); }} placeholder="₹ 0" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Max Amount</label>
                <input type="number" value={maxAmt} onChange={(e) => { setMaxAmt(e.target.value); setPage(1); }} placeholder="₹ ∞" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">To Date</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className={inputCls} />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs py-2 rounded-lg transition flex items-center justify-center gap-1">
                  <FaTimes size={10} /> Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-gray-500 text-xs mb-4">
        Showing {paginated.length} of {filtered.length} transactions
      </p>

      {/* Cards */}
      {loading ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="w-72 md:w-80 h-44 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : paginated.length > 0 ? (
        <motion.div layout className="flex flex-wrap justify-center xl:justify-start gap-4">
          <AnimatePresence>
            {paginated.map((tx) => (
              <motion.div key={tx._id} layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}>
                <Card transaction={tx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <span className="text-5xl mb-3">🔍</span>
          <p className="text-base">No transactions match your filters</p>
          <button onClick={clearFilters} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition">Clear filters</button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-400 text-xs disabled:opacity-40 hover:bg-slate-700 transition">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) => p === "..." ? (
              <span key={`ellipsis-${i}`} className="text-gray-500 text-xs px-1">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === p ? "bg-indigo-500 text-white" : "bg-slate-800 text-gray-400 hover:bg-slate-700"}`}>
                {p}
              </button>
            ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-400 text-xs disabled:opacity-40 hover:bg-slate-700 transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
