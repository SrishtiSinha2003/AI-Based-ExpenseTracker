import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { UPDATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import toast from "react-hot-toast";
import { GET_TRANSACTION } from "../graphql/queries/transaction.query";
import { useParams } from "react-router-dom";

const Transaction = () => {
  const { id } = useParams();

  const { data, loading } = useQuery(GET_TRANSACTION, {
    variables: { id: id },
  });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);

  const [form, setForm] = useState({
    description: "",
    type: "",
    category: "",
    amount: "",
    location: "",
    date: new Date(),
  });

  useEffect(() => {
    if (data) {
      setForm({
        description: data.getTransaction.description,
        type: data.getTransaction.type,
        category: data.getTransaction.category,
        amount: data.getTransaction.amount,
        location: data.getTransaction.location,
        date: data.getTransaction.date,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTransaction({
        variables: {
          input: {
            transactionId: id,
            ...form,
            amount: parseFloat(form.amount),
          },
        },
      });
      toast.success("Transaction updated successfully");
      window.location.href = "/";
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (data === undefined) {
    return (
      <div className="absolute bottom-0 h-screen w-full flex justify-center items-center pt-20 md:pt-0">
        <h1 className="text-4xl">No acces to this transaction</h1>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 h-screen w-full flex justify-center items-center pt-20 md:pt-0">
      <form className="flex flex-col gap-2 md:gap-4 mt-4 p-3 md:p-0 w-full md:w-1/2 xl:w-1/3">
        <div className="flex flex-col gap-1 md:gap-2">
          <label htmlFor="description">Description</label>
          <input
            className="border rounded-lg p-2 text-black"
            type="text"
            id="description"
            name="description"
            maxLength="50"
            onChange={handleChange}
            placeholder={form.description}
          />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            <label className="text-nowrap" htmlFor="type">
              Payment Type
            </label>
            <select
              className="border rounded-lg p-2 text-black"
              name="type"
              id="type"
              onChange={handleChange}
            >
              <option value="card" selected={form.type === "card"}>
                Card
              </option>
              <option value="cash" selected={form.type === "cash"}>
                Cash
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            <label htmlFor="category">Category</label>
            <select
              className="border rounded-lg p-2 text-black"
              name="category"
              id="category"
              onChange={handleChange}
            >
              <option value="expense" selected={form.category === "expense"}>
                Expense
              </option>
              <option value="income" selected={form.category === "income"}>
                Income
              </option>
              <option value="saving" selected={form.category === "saving"}>
                Savings
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            <label htmlFor="amount">Amount</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="number"
              id="amount"
              name="amount"
              min={1}
              max={1000000}
              onChange={handleChange}
              placeholder={form.amount}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            <label htmlFor="location">Location</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="text"
              id="location"
              name="location"
              maxLength="50"
              onChange={handleChange}
              placeholder={form.location}
            />
          </div>
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            <label htmlFor="date">Date</label>
            <input
              className="border rounded-lg p-2 text-black"
              type="date"
              id="date"
              name="date"
              onChange={handleChange}
              value={form.date}
            />
          </div>
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded-md mt-4 hover:bg-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading || data === undefined}
        >
          Update transaction
        </button>
      </form>
    </div>
  );
};

export default Transaction;
