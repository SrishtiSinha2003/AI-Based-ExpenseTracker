import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS, GET_UNREAD_COUNT } from "../graphql/queries/transaction.query";
import { MARK_NOTIFICATIONS_READ } from "../graphql/mutations/user.mutation";
import { FaBell, FaCheckDouble } from "react-icons/fa";

const TYPE_STYLES = {
  alert:   "bg-red-500/10 border-red-500/20 text-red-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  success: "bg-green-500/10 border-green-500/20 text-green-400",
  info:    "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
};

const TYPE_ICONS = { alert: "🚨", warning: "⚠️", success: "✅", info: "ℹ️" };

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, { pollInterval: 30000 });
  const { data, refetch } = useQuery(GET_NOTIFICATIONS, { skip: !open });
  const [markRead] = useMutation(MARK_NOTIFICATIONS_READ);

  const unread = countData?.getUnreadCount || 0;
  const notifications = data?.getNotifications || [];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) {
      await refetch();
      if (unread > 0) {
        await markRead();
        refetchCount();
      }
    }
  };

  const formatTime = (ts) => {
    const d = new Date(parseInt(ts));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
      >
        <FaBell className="text-gray-400" size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <p className="text-white font-semibold text-sm">Notifications</p>
            <FaCheckDouble className="text-gray-500 hover:text-indigo-400 cursor-pointer transition" size={13}
              onClick={async () => { await markRead(); refetchCount(); refetch(); }} />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                <p className="text-2xl mb-2">🔔</p>No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`mx-3 my-2 p-3 rounded-xl border text-xs ${TYPE_STYLES[n.type] || TYPE_STYLES.info} ${!n.read ? "opacity-100" : "opacity-60"}`}>
                  <p className="flex items-start gap-1.5">
                    <span>{TYPE_ICONS[n.type] || "ℹ️"}</span>
                    <span className="leading-relaxed">{n.message}</span>
                  </p>
                  <p className="text-right mt-1 opacity-60">{formatTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
