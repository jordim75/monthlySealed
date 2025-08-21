import { useEffect, useState } from "react";

export default function Home({ onSelect }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ID del full de CONTROL (on tens A=SheetId, B=Visible, C=PlayerName)
  const CONTROL_SHEET_ID = "1v3EkI14BRHWkYGS3I0I4jyE_7bzABRRbxifFBfFJLnY";
  const CONTROL_SHEET_NAME = "Control";

  useEffect(() => {
    const fetchControl = async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          `https://docs.google.com/spreadsheets/d/${CONTROL_SHEET_ID}/gviz/tq` +
          `?tqx=out:json&sheet=${encodeURIComponent(CONTROL_SHEET_NAME)}&range=A:C`;

        const res = await fetch(url);
        const text = await res.text();

        // Parse robuste del format gviz
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (!match) throw new Error("No s'ha pogut parsejar la resposta de Google Sheets.");
        const json = JSON.parse(match[1]);

        const rows = (json.table?.rows ?? []).map(r =>
          (r.c ?? []).map(c => (c && c.v != null ? String(c.v) : ""))
        );

        // Construeix llista de jugadors visibles (B === YES), amb nom a C
        const visiblePlayers = rows
          .filter(r => (r[1] || "").trim().toUpperCase() === "YES")
          .map(r => ({
            sheetId: (r[0] || "").trim(),      // P1, P2, ...
            playerName: (r[2] || "").trim(),   // Nom del jugador
          }))
          // descarta files sense sheetId
          .filter(p => p.sheetId.length > 0);

        setPlayers(visiblePlayers);
      } catch (e) {
        setError(e.message || "Error loading Control sheet");
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
  }, []);

  if (loading) {
    return <div className="p-6">Loading players…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="mb-2">Error: {error}</p>
        <p>Revisa que el full “{CONTROL_SHEET_NAME}” sigui públic i tingui dades a A:C.</p>
      </div>
    );
  }

  if (players.length === 0) {
    return <div className="p-6">No active players (Visible = YES) found in Control.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active players</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((p) => (
          <button
            key={p.sheetId}
            onClick={() => onSelect(p)}   
            className="w-full border-2 border-gray-400 rounded-xl p-4 text-center
                       hover:bg-gray-100 hover:border-gray-600 
                       transition-all duration-150 shadow-sm"
            title={p.sheetId}
          >
            <span className="font-medium block">{p.playerName || p.sheetId}</span>
            <span className="text-sm text-gray-500">{p.sheetId}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
