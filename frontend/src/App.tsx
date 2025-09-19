import React, { useState } from "react";
import API from "./api";

function App() {
  const [offer, setOffer] = useState({ name: "", value_props: "", ideal_use_cases: "" });
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Save Offer ---
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/offer", {
        ...offer,
        ideal_use_cases: offer.ideal_use_cases.split(",").map((s) => s.trim()),
      });
      alert(res.data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Upload Leads CSV ---
  const handleFileUpload = async () => {
    if (!file) return alert("Upload a CSV file first!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/leads/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${res.data.count} leads uploaded`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Run Scoring ---
  const handleScore = async () => {
    setLoading(true);
    try {
      const res = await API.post("/score");
      setResults(res.data.results);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  // --- Export CSV ---
  const handleExport = () => {
    window.open("http://localhost:3000/results/export", "_blank");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 Lead Intent Scoring</h1>

      {/* Offer Form */}
      <h2>1. Set Offer</h2>
      <form onSubmit={handleOfferSubmit}>
        <input placeholder="Name" value={offer.name} onChange={(e) => setOffer({ ...offer, name: e.target.value })} />
        <input placeholder="Value Props" value={offer.value_props} onChange={(e) => setOffer({ ...offer, value_props: e.target.value })} />
        <input placeholder="Ideal Use Cases (comma separated)" value={offer.ideal_use_cases} onChange={(e) => setOffer({ ...offer, ideal_use_cases: e.target.value })} />
        <button type="submit">Save Offer</button>
      </form>

      {/* Upload CSV */}
      <h2>2. Upload Leads CSV</h2>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleFileUpload}>Upload</button>

      {/* Scoring */}
      <h2>3. Run Scoring</h2>
      <button onClick={handleScore} disabled={loading}>{loading ? "Scoring..." : "Run Scoring"}</button>

      {/* Results */}
      <h2>4. Results</h2>
      {results.length > 0 ? (
        <div>
          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Intent</th>
                <th>Score</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {results.map((lead, idx) => (
                <tr key={idx}>
                  <td>{lead.name}</td>
                  <td>{lead.role}</td>
                  <td>{lead.company}</td>
                  <td>{lead.industry}</td>
                  <td>{lead.location}</td>
                  <td>{lead.intent}</td>
                  <td>{lead.score}</td>
                  <td>{lead.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleExport}>Export CSV</button>
        </div>
      ) : (
        <p>No results yet.</p>
      )}
    </div>
  );
}

export default App;
