import { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaChevronDown } from "react-icons/fa";

const QUICK_SUGGESTIONS = [
  "How is my spending this month?",
  "Am I saving enough?",
  "Where am I overspending?",
  "Give me a savings plan",
  "How can I reduce expenses?",
  "What is my financial health?",
];

const stripMarkdown = (text) =>
  (text || "")
    .replace(/\*{1,3}/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/^\s*[-+>]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/`+/g, "")
    .replace(/---+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const formatTime = (date) =>
  date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi! I'm your AI financial assistant. Ask me anything about your finances or pick a suggestion below.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: msg, time: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: `query Chat($message: String!) { chatWithAI(message: $message) }`,
          variables: { message: msg },
        }),
      });
      const data = await res.json();
      const reply = stripMarkdown(data?.data?.chatWithAI || "Sorry, I couldn't process that.");
      setMessages((prev) => [...prev, { role: "bot", content: reply, time: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Connection error. Please try again.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? "bg-slate-700 rotate-0"
            : "bg-indigo-500 hover:bg-indigo-600 hover:scale-110"
        }`}
        style={{ boxShadow: open ? undefined : "0 0 24px rgba(99,102,241,0.5)" }}
        aria-label="Open AI Chat"
      >
        {open ? <FaTimes className="text-white" size={18} /> : <FaRobot className="text-white" size={20} />}
      </button>

      {/* Unread dot when closed */}
      {!open && (
        <span className="fixed bottom-[62px] right-[62px] z-50 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
      )}

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ height: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <FaRobot className="text-indigo-400" size={14} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Finance AI</p>
              <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
            <FaChevronDown size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-600">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-sm"
                    : "bg-slate-700 text-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-gray-600 text-[10px] mt-1 px-1">{formatTime(msg.time)}</span>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start">
              <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {showSuggestions && (
          <div className="px-4 pb-2 shrink-0">
            <p className="text-gray-500 text-xs mb-2">Quick suggestions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-slate-700 hover:bg-indigo-500/20 hover:text-indigo-300 text-gray-300 border border-slate-600 hover:border-indigo-500/40 px-2.5 py-1 rounded-full transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-700 shrink-0">
          <div className="flex items-end gap-2 bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your finances..."
              className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500 max-h-24"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0"
            >
              <FaPaperPlane size={12} className="text-white" />
            </button>
          </div>
          <p className="text-gray-600 text-[10px] mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
