import { useState } from "react";
import { useMutation } from "@apollo/client";
import { COMPLETE_ONBOARDING } from "../graphql/mutations/user.mutation";
import { GET_AUTH_USER } from "../graphql/queries/user.query";
import toast from "react-hot-toast";
import { FaWallet, FaChartPie, FaRobot, FaBell, FaArrowRight, FaCheck } from "react-icons/fa";

const STEPS = [
  {
    icon: <FaChartPie size={32} className="text-indigo-400" />,
    title: "Track Every Rupee",
    desc: "Log income, expenses and savings. See where your money goes with beautiful charts.",
  },
  {
    icon: <FaRobot size={32} className="text-purple-400" />,
    title: "AI-Powered Insights",
    desc: "Get personalized financial tips, spending predictions and a health score — all powered by AI.",
  },
  {
    icon: <FaBell size={32} className="text-yellow-400" />,
    title: "Smart Alerts",
    desc: "Get notified when you're close to your budget limit or when recurring payments are due.",
  },
  {
    icon: <FaWallet size={32} className="text-green-400" />,
    title: "Set Your Budget",
    desc: "Set a monthly budget to keep your spending in check. You can always change it later.",
    isBudget: true,
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState("20000");
  const [completeOnboarding, { loading }] = useMutation(COMPLETE_ONBOARDING, {
    refetchQueries: [{ query: GET_AUTH_USER }],
  });

  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      const b = parseInt(budget);
      if (!b || b < 100) { toast.error("Enter a valid budget (min ₹100)"); return; }
      try {
        await completeOnboarding({ variables: { budget: b } });
        toast.success("Welcome aboard! 🎉");
      } catch (e) {
        toast.error(e.message);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  const current = STEPS[step];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-900">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-indigo-500" : i < step ? "w-4 bg-indigo-500/50" : "w-4 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-5">
            {current.icon}
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{current.desc}</p>

          {current.isBudget && (
            <div className="mb-6">
              <div className="flex items-center bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 gap-2 focus-within:border-indigo-500 transition">
                <span className="text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 20000"
                  className="bg-transparent text-white text-lg w-full outline-none placeholder-gray-500"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">Recommended: ₹15,000 – ₹50,000/month</p>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            {isLast ? (
              <><FaCheck size={14} /> {loading ? "Setting up..." : "Get Started"}</>
            ) : (
              <>Next <FaArrowRight size={13} /></>
            )}
          </button>

          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="mt-3 text-gray-500 text-sm hover:text-gray-300 transition">
              ← Back
            </button>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">Step {step + 1} of {STEPS.length}</p>
      </div>
    </div>
  );
};

export default Onboarding;
