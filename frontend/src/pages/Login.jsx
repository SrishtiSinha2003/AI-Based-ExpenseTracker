import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN } from "../graphql/mutations/user.mutation";
import { toast } from "react-hot-toast";

const Login = () => {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [login, { loading, error }] = useMutation(LOGIN, {
    refetchQueries: ["GetAuthUser", "GetTransactions", "GetStatistics"],
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ variables: { input: loginData } });
      if (error) {
        console.log(error.message);
      }
      toast.success("User logged in successfully");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="absolute bottom-0 h-screen w-full flex justify-center items-center">
      <div className="border rounded-lg bg-gray-100 text-gray-900 flex flex-col p-4 w-72 md:w-96">
        <h3 className="text-2xl font-bold text-center p-4">Login</h3>
        <p className="text-center text-gray-500 font-semibold">
          Log in to your account
        </p>
        <form className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username">Username</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="text"
              id="username"
              name="username"
              maxLength="20"
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
            />
          </div>
          <button
            className="bg-blue-500 text-white rounded-lg p-2 mt-4 hover:opacity-80"
            onClick={handleSubmit}
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-500 font-semibold pt-4">
          Don't have an account?{" "}
          <a href="/register" className="font-bold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
