import { useEffect, useState } from "react";
import Home from "./Home";

export default function App() {
  const [data, setData] = useState({ headers: [], rows: [] });
  const [sheet, setSheet] = useState(null);
  const [player, setPlayer] = useState(null);

  const SHEET_ID = "1scNabdCXNCm2XTttoUzP1XuPeDzz3BbnE7fkTsde3r4";

  const [selectedCells, setSelectedCells] = useState({});
  const [selectedAvatars, setSelectedAvatars] = useState(0);
  const [selectedSpells, setSelectedSpells] = useState(0);
  const [selectedAtlas, setSelectedAtlas] = useState(0);

  const [avatarAnim, setAvatarAnim] = useState(false);
  const [spellAnim, setSpellAnim] = useState(false);
  const [otherAnim, setOtherAnim] = useState(false);

  const sitesData = {
    header: "Basic sites",
    rows: ["Wasteland", "Spire", "Stream", "Valley"],
  };

  const [siteCounts, setSiteCounts] = useState(
    Array(sitesData.rows.length).fill(0)
  );

  useEffect(() => {
    if (!sheet) return;

    fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet.sheetId}&range=A:C`
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
          const rows = json.table.rows.map((r) =>
            [0, 1, 2].map((i) => r.c[i]?.v ?? "")
          );
          setData({ headers, rows });
          setSelectedCells({});
          setSelectedAvatars(0);
          setSelectedSpells(0);
          setSelectedAtlas(0);
          setSiteCounts(Array(sitesData.rows.length).fill(0));
        } catch (e) {
          setData({ headers: [], rows: [] });
        }
      });
  }, [sheet]);

  const handleCheckboxChange = (colIndex, rowIndex, checked) => {
    setSelectedCells((prev) => {
      const newSelected = { ...prev };
      if (!newSelected[colIndex]) newSelected[colIndex] = {};
      newSelected[colIndex][rowIndex] = checked;
      return newSelected;
    });

    if (colIndex === 0) {
      setSelectedAvatars((prev) => prev + (checked ? 1 : -1));
      setAvatarAnim(true);
      setTimeout(() => setAvatarAnim(false), 300);
    } else if (colIndex === 1) {
      setSelectedSpells((prev) => prev + (checked ? 1 : -1));
      setSpellAnim(true);
      setTimeout(() => setSpellAnim(false), 300);
    } else if (colIndex === 2) {
      setSelectedAtlas((prev) => prev + (checked ? 1 : -1));
      setOtherAnim(true);
      setTimeout(() => setOtherAnim(false), 300);
    }
  };

  const handleSiteChange = (index, delta) => {
    setSiteCounts((prev) => {
      const newCounts = [...prev];
      newCounts[index] = Math.max(0, newCounts[index] + delta);

      if (delta !== 0) {
        setOtherAnim(true);
        setTimeout(() => setOtherAnim(false), 300);
      }
      return newCounts;
    });
  };

  const toggleAllSpells = (selectAll) => {
    const updates = {};
    let count = 0;
    data.rows.forEach((row, i) => {
      if (row[1] && i !== 0) {
        updates[i] = selectAll;
        if (selectAll) count++;
      }
    });
    setSelectedCells((prev) => ({ ...prev, 1: updates }));
    setSelectedSpells(selectAll ? count : 0);
  };

  const toggleAllAtlas = (selectAll) => {
    const updates = {};
    let count = 0;
    data.rows.forEach((row, i) => {
      if (row[2] && i !== 0) {
        updates[i] = selectAll;
        if (selectAll) count++;
      }
    });
    setSelectedCells((prev) => ({ ...prev, 2: updates }));
    setSelectedAtlas(selectAll ? count : 0);
  };

  const handleCopyToClipboard = () => {
    const allSelected = [];

    Object.entries(selectedCells).forEach(([colIndex, rows]) => {
      Object.entries(rows).forEach(([rowIndex, checked]) => {
        if (checked) {
          const val = data.rows[rowIndex]?.[colIndex];
          if (val) allSelected.push("1 " + val);
        }
      });
    });

    siteCounts.forEach((count, i) => {
      for (let j = 0; j < count; j++) {
        allSelected.push("1 " + sitesData.rows[i]);
      }
    });

    if (allSelected.length > 0) {
      navigator.clipboard.writeText(allSelected.join("\n"));
      alert("Copied to clipboard!");
    } else {
      alert("No items selected.");
    }
  };

  const renderTable = (colIndex, withCheckbox = false, extraHeader = null) => (
    <table className="min-w-[200px] border-collapse border">
      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
        <tr>
          <th className="border px-2 py-1 flex justify-between items-center">
            <span>{data.headers[colIndex]}</span>
            {extraHeader}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => {
          const cell = row[colIndex];
          const showCheckbox = withCheckbox && cell && i !== 0;
          return (
            <tr
              key={i}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedCells[colIndex]?.[i] ? "bg-yellow-200 dark:bg-yellow-600" : ""
              }`}
            >
              <td
                className={`border px-2 py-1 flex items-center text-black dark:text-white`}
              >
                {showCheckbox && (
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedCells[colIndex]?.[i] || false}
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

  const siteColors = [
    { bg: "bg-red-200 dark:bg-red-700", text: "text-red-800 dark:text-red-200" },
    { bg: "bg-blue-200 dark:bg-blue-700", text: "text-blue-800 dark:text-blue-200" },
    { bg: "bg-blue-800 dark:bg-blue-400", text: "text-white dark:text-white" },
    { bg: "bg-yellow-800 dark:bg-yellow-500", text: "text-white dark:text-white" },
  ];

  const renderSitesTable = () => (
    <table className="min-w-[200px] border-collapse border">
      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
        <tr>
          <th className="border px-2 py-1">
            {sitesData.header}
          </th>
        </tr>
      </thead>
      <tbody>
        {sitesData.rows.map((site, i) => {
          const color = siteColors[i] || { bg: "", text: "" };
          return (
            <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-700`}>
              <td
                className={`border px-2 py-1 flex items-center justify-between ${color.bg} ${color.text}`}
              >
                <span>{site}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSiteChange(i, -1)}
                    className="px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
                  >
                    –
                  </button>
                  <span>{siteCounts[i]}</span>
                  <button
                    onClick={() => handleSiteChange(i, +1)}
                    className="px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
                  >
                    +
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (!sheet) {
    return <Home onSelect={(playerObj) => { setSheet(playerObj); setPlayer(playerObj); }} />;
  }

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => { setSheet(null); setPlayer(null); }}
        className="mb-4 px-4 py-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        ← Back to player list
      </button>

      <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">
        {player?.playerName || sheet.sheetId}'s sealed card pool
      </h1>

      <div className="flex gap-6 mb-4 flex-wrap items-center">
        <span
          className={`font-medium transition-transform duration-200 ${
            avatarAnim ? "scale-110 text-blue-500 dark:text-blue-300" : "text-black dark:text-white"
          }`}
        >
          {selectedAvatars} avatars selected
        </span>
        <span
          className={`font-medium transition-transform duration-200 ${
            spellAnim ? "scale-110 text-purple-500 dark:text-purple-300" : "text-black dark:text-white"
          }`}
        >
          {selectedSpells} spells selected
        </span>
        <span
          className={`font-medium transition-transform duration-200 ${
            otherAnim ? "scale-110 text-green-600 dark:text-green-400" : "text-black dark:text-white"
          }`}
        >
          {siteCounts.reduce((a, b) => a + b, 0) + selectedAtlas} sites selected
        </span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="px-3 py-1 border rounded bg-yellow-200 dark:bg-yellow-700 hover:bg-yellow-300 dark:hover:bg-yellow-600"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-auto max-h-[70vh]">
        {renderTable(0, true)}
        {renderTable(
          1,
          true,
          <div className="flex gap-1">
            <button
              onClick={() => toggleAllSpells(true)}
              className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
            >
              Select all
            </button>
            <button
              onClick={() => toggleAllSpells(false)}
              className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
            >
              Unselect all
            </button>
          </div>
        )}
        {renderTable(
          2,
          true,
          <div className="flex gap-1">
            <button
              onClick={() => toggleAllAtlas(true)}
              className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
            >
              Select all
            </button>
            <button
              onClick={() => toggleAllAtlas(false)}
              className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
            >
              Unselect all
            </button>
          </div>
        )}
        {renderSitesTable()}
      </div>
    </div>
  );
}
