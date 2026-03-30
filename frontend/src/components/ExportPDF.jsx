import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { GET_AUTH_USER } from "../graphql/queries/user.query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaDownload } from "react-icons/fa";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ExportPDF = () => {
  const { data: txData } = useQuery(GET_TRANSACTIONS);
  const { data: userData } = useQuery(GET_AUTH_USER);
  const [type, setType] = useState("monthly");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const transactions = txData?.getTransactions || [];
  const username = userData?.authUser?.username || "User";

  const generate = () => {
    const doc = new jsPDF();
    const filtered = transactions.filter((tx) => {
      const parts = (tx.date || "").split("T")[0].split("-");
      if (parts.length < 3) return false;
      const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1;
      if (type === "monthly") return y === year && m === month;
      return y === year;
    });

    const income  = filtered.filter((t) => t.category === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.category === "expense").reduce((s, t) => s + t.amount, 0);
    const saving  = filtered.filter((t) => t.category === "saving").reduce((s, t) => s + t.amount, 0);

    const title = type === "monthly"
      ? `${MONTHS[month]} ${year} — Financial Report`
      : `${year} — Annual Financial Report`;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Tracker", 14, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(title, 14, 26);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 180);
    doc.text(`Generated for @${username} on ${new Date().toLocaleDateString("en-IN")}`, 14, 34);

    // Summary boxes
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    const summaryY = 50;
    const boxes = [
      { label: "Total Income",  value: `Rs ${income.toLocaleString()}`,  color: [34, 197, 94] },
      { label: "Total Expense", value: `Rs ${expense.toLocaleString()}`, color: [239, 68, 68] },
      { label: "Total Saving",  value: `Rs ${saving.toLocaleString()}`,  color: [59, 130, 246] },
      { label: "Net Balance",   value: `Rs ${(income - expense).toLocaleString()}`, color: income >= expense ? [34, 197, 94] : [239, 68, 68] },
    ];
    boxes.forEach((b, i) => {
      const x = 14 + i * 46;
      doc.setFillColor(...b.color);
      doc.roundedRect(x, summaryY, 42, 20, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(b.label, x + 4, summaryY + 7);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(b.value, x + 4, summaryY + 15);
      doc.setFont("helvetica", "normal");
    });

    // Table
    autoTable(doc, {
      startY: summaryY + 28,
      head: [["Date", "Description", "Category", "Type", "Amount"]],
      body: filtered.map((tx) => [
        tx.date?.split("T")[0] || "",
        tx.description,
        tx.category,
        tx.type,
        `Rs ${tx.amount.toLocaleString()}`,
      ]),
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: { 4: { halign: "right" } },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount} — Expense Tracker`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`${type === "monthly" ? `${MONTHS[month]}_${year}` : year}_report.pdf`);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
        <FaFilePdf className="text-red-400" /> Export Report
      </h3>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        {["monthly", "yearly"].map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              type === t ? "bg-indigo-500 text-white" : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {type === "monthly" && (
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
            className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
          className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 outline-none">
          {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <button onClick={generate}
        className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium py-2.5 rounded-xl transition">
        <FaDownload size={12} /> Download PDF
      </button>
    </div>
  );
};

export default ExportPDF;
