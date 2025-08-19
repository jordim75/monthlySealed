import { useEffect, useState } from "react";
import Home from "./Home";

export default function App() {
  const [data, setData] = useState({});
  const [sheet, setSheet] = useState(null); // null = home page
  const SHEET_ID = "1scNabdCXNCm2XTttoUzP1XuPeDzz3BbnE7fkTsde3r4";

  useEffect(() => {
    if (!sheet) return;

    fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet}&range=A:L`
    )
      .then((res) => res.text())
      .then((text) => {
        try {
          const json = JSON.parse(text.substr(47).slice(0, -2));
          const headers = json.table.cols.map((c) => c.label || "");
          const rows = json.table.rows.map((r) =>
            r.c.map((cell) => (cell ? cell.v : ""))
          );
          setData({ headers, rows });
        } catch (e) {
          setData({ headers: [], rows: [] });
        }
      });
  }, [sheet]);

  if (!sheet) {
    return <Home onSelect={setSheet} />;
  }

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => setSheet(null)}
        className="mb-4 px-4 py-2 border rounded hover:bg-gray-200"
      >
        ← Back to player list
      </button>

      <h1 className="text-2xl font-bold mb-4">Data of {sheet}</h1>

      <div className="overflow-auto max-h-[70vh] border rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {data.headers?.map((h, i) => (
                <th key={i} className="border px-2 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows?.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="border px-2 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
