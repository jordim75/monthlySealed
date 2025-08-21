import { useEffect, useState } from "react";
import Home from "./Home";

export default function App() {
  const [data, setData] = useState({ headers: [], rows: [] });
  const [sheet, setSheet] = useState(null);
  const SHEET_ID = "1scNabdCXNCm2XTttoUzP1XuPeDzz3BbnE7fkTsde3r4";

  const [selectedAvatars, setSelectedAvatars] = useState(0);
  const [selectedSpells, setSelectedSpells] = useState(0);

  const [selectedCells, setSelectedCells] = useState({ 0: {}, 1: {} });

  const [avatarAnim, setAvatarAnim] = useState(false);
  const [spellAnim, setSpellAnim] = useState(false);

  useEffect(() => {
    if (!sheet) return;

    fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet}&range=A:C`
    )
      .then((res) => res.text())
      .then((text) => {
        try {
          const json = JSON.parse(text.substr(47).slice(0, -2));
          const headers = [
            json.table.cols[0]?.label || "",
            json.table.cols[1]?.label || "",
            json.table.cols[2]?.label || "",
          ];
          const rows = json.table.rows.map((r) => [0, 1, 2].map((i) => r.c[i]?.v ?? ""));
          setData({ headers, rows });
          setSelectedAvatars(0);
          setSelectedSpells(0);
          setSelectedCells({ 0: {}, 1: {} });
        } catch (e) {
          setData({ headers: [], rows: [] });
        }
      });
  }, [sheet]);

  useEffect(() => {
    if (selectedAvatars !== 0) {
      setAvatarAnim(true);
      const t = setTimeout(() => setAvatarAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [selectedAvatars]);

  useEffect(() => {
    if (selectedSpells !== 0) {
      setSpellAnim(true);
      const t = setTimeout(() => setSpellAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [selectedSpells]);

  const handleCheckboxChange = (colIndex, rowIndex, checked) => {
    if (colIndex === 0) setSelectedAvatars((prev) => prev + (checked ? 1 : -1));
    if (colIndex === 1) setSelectedSpells((prev) => prev + (checked ? 1 : -1));

    setSelectedCells((prev) => ({
      ...prev,
      [colIndex]: { ...prev[colIndex], [rowIndex]: checked },
    }));
  };

  const handleDownload = () => {
    const allSelected = [];
    Object.entries(selectedCells).forEach(([colIndex, rows]) => {
      Object.entries(rows).forEach(([rowIndex, checked]) => {
        if (checked) {
          const val = data.rows[rowIndex][colIndex];
          if (val) allSelected.push(val);
        }
      });
    });
    const blob = new Blob([allSelected.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTable = (colIndex, withCheckbox = false) => (
    <table className="min-w-[200px] border-collapse border">
      <thead className="bg-gray-100 sticky top-0">
        <tr>
          <th className="border px-2 py-1">{data.headers[colIndex]}</th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => {
          const cell = row[colIndex];
          const showCheckbox = withCheckbox && cell && i !== 0;
          return (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border px-2 py-1 flex items-center">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={!!selectedCells[colIndex]?.[i]}
                    onChange={(e) =>
                      handleCheckboxChange(colIndex, i, e.target.checked)
                    }
                  />
                )}
                {cell || "\u00A0"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (!sheet) return <Home onSelect={setSheet} />;

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => setSheet(null)}
        className="mb-4 px-4 py-2 border rounded hover:bg-gray-200"
      >
        ← Back to player list
      </button>

      <h1 className="text-2xl font-bold mb-2">Data of {sheet}</h1>

      <div className="flex gap-6 mb-4">
        <span
          className={`font-medium transition-transform duration-200 ${
            avatarAnim ? "scale-110 text-blue-500" : ""
          }`}
        >
          {selectedAvatars} avatars selected
        </span>
        <span
          className={`font-medium transition-transform duration-200 ${
            spellAnim ? "scale-110 text-purple-500" : ""
          }`}
        >
          {selectedSpells} spells selected
        </span>
        <button
          onClick={handleDownload}
          className="ml-4 px-3 py-1 border rounded bg-green-200 hover:bg-green-300"
        >
          Download selected
        </button>
      </div>

      <div className="flex gap-6 overflow-auto max-h-[70vh]">
        {renderTable(0, true)}
        {renderTable(1, true)}
        {renderTable(2, false)}
      </div>
    </div>
  );
}
