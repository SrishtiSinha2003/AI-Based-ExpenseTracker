import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_AUTH_USER } from "../graphql/queries/user.query";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { UPDATE_PROFILE, LOGOUT } from "../graphql/mutations/user.mutation";
import toast from "react-hot-toast";
import { FaUser, FaSignOutAlt, FaEdit, FaCheck, FaTimes, FaCalendarAlt, FaChartBar } from "react-icons/fa";

const Avatar = ({ src, name, size = "w-16 h-16" }) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=6366f1&color=fff&bold=true&size=128`;
  return (
    <img
      src={src || fallback}
      alt={name || "avatar"}
      onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
      className={`${size} rounded-2xl object-cover border-2 border-indigo-500/40`}
    />
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-slate-700/50 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="text-gray-400 text-xs mt-1">{label}</p>
  </div>
);

const Profile = () => {
  const { data: userData, refetch } = useQuery(GET_AUTH_USER);
  const { data: txData } = useQuery(GET_TRANSACTIONS);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE, { refetchQueries: ["GetAuthUser"] });
  const [logout] = useMutation(LOGOUT, { refetchQueries: ["GetAuthUser"] });

  const user = userData?.authUser;
  const transactions = txData?.getTransactions || [];

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", gender: "" });

  const totalIncome  = transactions.filter((t) => t.category === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.category === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSaving  = transactions.filter((t) => t.category === "saving").reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const startEdit = () => {
    setForm({ name: user?.name || "", gender: user?.gender || "" });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ variables: { input: form } });
      toast.success("Profile updated!");
      setEditing(false);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out"); } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-8">
        👤 My Profile
      </h2>

      {/* Profile card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <Avatar src={user?.profilePic} name={user?.name} />
            <div>
              <h3 className="text-white text-xl font-bold">{user?.name}</h3>
              <p className="text-gray-400 text-sm">@{user?.username}</p>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                {user?.gender}
              </span>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-2 rounded-lg transition">
              <FaEdit size={11} /> Edit
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg transition disabled:opacity-50">
                <FaCheck size={10} /> {loading ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-500 text-gray-300 text-xs px-4 py-2 rounded-lg transition">
                <FaTimes size={10} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Account info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <FaUser size={11} className="text-indigo-400" />
            <span>Username: <span className="text-white">@{user?.username}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FaCalendarAlt size={11} className="text-indigo-400" />
            <span>Budget: <span className="text-white">₹{(user?.budget || 0).toLocaleString()}/mo</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FaChartBar size={11} className="text-indigo-400" />
            <span>Transactions: <span className="text-white">{transactions.length}</span></span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Income"  value={`₹${totalIncome.toLocaleString()}`}  color="#22c55e" />
        <StatCard label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} color="#ef4444" />
        <StatCard label="Total Saving"  value={`₹${totalSaving.toLocaleString()}`}  color="#3b82f6" />
        <StatCard label="Net Balance"   value={`₹${netBalance.toLocaleString()}`}   color={netBalance >= 0 ? "#22c55e" : "#ef4444"} />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-xl transition text-sm font-medium"
      >
        <FaSignOutAlt /> Sign Out
      </button>
    </div>
  );
};

export default Profile;
