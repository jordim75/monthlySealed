import { useEffect, useState } from "react";

export default function Home({ onSelect }) {
  const [players, setPlayers] = useState([]);

  const SHEET_ID = "1v3EkI14BRHWkYGS3I0I4jyE_7bzABRRbxifFBfFJLnY";

  useEffect(() => {
    fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Control&range=A:B`
    )
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows.map((r) => r.c.map((cell) => (cell ? cell.v : "")));
        const visiblePlayers = rows
          .filter((r) => r[1]?.toString().toUpperCase() === "YES")
          .map((r) => r[0]);
        setPlayers(visiblePlayers);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select a player</h1>
      <div className="grid grid-cols-4 gap-4">
        {players.map((player) => (
          <button
            key={player}
            onClick={() => onSelect(player)}
            className="border rounded p-2 hover:bg-gray-200"
          >
            {player}
          </button>
        ))}
      </div>
    </div>
  );
}
