import { useMutation } from "@apollo/client";
import { useState } from "react";
import { REGISTER } from "../graphql/mutations/user.mutation";
import { toast } from "react-hot-toast";

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    password: "",
    gender: "",
  });

  const [register, { loading, error }] = useMutation(REGISTER, {
    refetchQueries: ["GetAuthUser"],
  });

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ variables: { input: registerData } });
      if (error) {
        console.log(error.message);
      }
      toast.success("User registered successfully");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="absolute bottom-0 h-screen w-full flex justify-center items-center md:pt-0">
      <div className="border rounded-lg bg-gray-100 text-gray-900 flex flex-col p-4 w-72 md:w-96">
        <h3 className="text-2xl font-bold text-center p-4">Register</h3>
        <p className="text-center text-gray-500 font-semibold">
          Create an account and track your expenses
        </p>
        <form className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Full Name</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="text"
              id="name"
              name="name"
              maxLength="45"
              onChange={handleChange}
            />
          </div>
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
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="male">Male</label>
              <input
                type="radio"
                id="male"
                name="gender"
                value="male"
                onClick={handleChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="female">Female</label>
              <input
                type="radio"
                id="female"
                name="gender"
                value="female"
                onClick={handleChange}
              />
            </div>
          </div>
          <button
            className="bg-blue-500 text-white rounded-lg p-2 mt-4 hover:opacity-80"
            onClick={handleSubmit}
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-500 font-semibold pt-4">
          Already have an account?{" "}
          <a href="/login" className="font-bold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
