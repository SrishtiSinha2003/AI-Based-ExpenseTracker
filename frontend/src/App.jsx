import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import Analytics from "./pages/Analytics";
import Planning from "./pages/Planning";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@apollo/client";
import { GET_AUTH_USER } from "./graphql/queries/user.query";

function App() {
  const { data, loading, error } = useQuery(GET_AUTH_USER);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user</p>;

  const authUser = data?.authUser ?? null;

  return (
    <BrowserRouter>
      {authUser && <Header />}
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={authUser ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/planning" element={authUser ? <Planning /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={authUser ? <Navigate to="/" /> : <Register />} />
        <Route path="/transaction/:id" element={authUser ? <Transaction /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
