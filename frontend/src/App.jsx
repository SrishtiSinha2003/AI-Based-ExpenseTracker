import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import Analytics from "./pages/Analytics";
import Planning from "./pages/Planning";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import ChatBot from "./components/ChatBot";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@apollo/client";
import { GET_AUTH_USER } from "./graphql/queries/user.query";

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
      <Routes>
        {/* Onboarding gate */}
        <Route path="/onboarding" element={
          !authUser ? <Navigate to="/login" /> :
          authUser.onboardingDone ? <Navigate to="/" /> :
          <Onboarding />
        } />

        <Route path="/" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <Home />
        } />
        <Route path="/analytics" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <Analytics />
        } />
        <Route path="/planning" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <Planning />
        } />
        <Route path="/profile" element={
          !authUser ? <Navigate to="/login" /> :
          needsOnboarding ? <Navigate to="/onboarding" /> :
          <Profile />
        } />
        <Route path="/login"    element={authUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={authUser ? <Navigate to="/" /> : <Register />} />
        <Route path="/transaction/:id" element={authUser ? <Transaction /> : <Navigate to="/login" />} />
      </Routes>
      {authUser && !needsOnboarding && <ChatBot />}
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
