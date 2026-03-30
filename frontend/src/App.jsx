import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Planning from "./pages/Planning";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import ChatBot from "./components/ChatBot";
import ThemeToggle from "./components/ThemeToggle";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@apollo/client";
import { GET_AUTH_USER } from "./graphql/queries/user.query";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

const AnimatedRoutes = ({ authUser, needsOnboarding }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={
          !authUser ? <Navigate to="/login" /> :
          authUser.onboardingDone ? <Navigate to="/" /> :
          <PageWrapper><Onboarding /></PageWrapper>
        } />
        <Route path="/" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <PageWrapper><Home /></PageWrapper>
        } />
        <Route path="/analytics" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <PageWrapper><Analytics /></PageWrapper>
        } />
        <Route path="/planning" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <PageWrapper><Planning /></PageWrapper>
        } />
        <Route path="/transactions" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <PageWrapper><Transactions /></PageWrapper>
        } />
        <Route path="/profile" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <PageWrapper><Profile /></PageWrapper>
        } />
        <Route path="/login"    element={authUser ? <Navigate to="/" /> : <PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={authUser ? <Navigate to="/" /> : <PageWrapper><Register /></PageWrapper>} />
        <Route path="/transaction/:id" element={
          authUser ? <PageWrapper><Transaction /></PageWrapper> : <Navigate to="/login" />
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { data, loading, error } = useQuery(GET_AUTH_USER);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <p className="text-white text-center mt-10">Error loading user</p>;

  const authUser = data?.authUser ?? null;
  const needsOnboarding = authUser && !authUser.onboardingDone;

  return (
    <BrowserRouter>
      {authUser && !needsOnboarding && <Header />}
      <AnimatedRoutes authUser={authUser} needsOnboarding={needsOnboarding} />
      {authUser && !needsOnboarding && <ChatBot />}
      <ThemeToggle />
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" } }} />
    </BrowserRouter>
  );
}

export default App;
