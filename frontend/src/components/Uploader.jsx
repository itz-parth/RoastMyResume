import { useState } from "react";
import axios from "axios";

function Uploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(res.data);
    } catch (e) {
      const message =
        e.response?.data?.detail ||
        "Failed to analyze resume. Make sure the backend server is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Roast My Resume</h1>

      <div>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {loading && <p>Analyzing your resume...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {response && (
        <div>
          <h2>
            ATS Score: {response.ats_score}/100 &mdash; Roast:{" "}
            {response.roast_level}
          </h2>

          <p>
            <em>{response.opening_roast}</em>
          </p>

          <h3>Summary</h3>
          <p>{response.summary}</p>

          <h3>Strengths</h3>
          <ul>
            {response.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>Weaknesses</h3>
          <ul>
            {response.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>

          <h3>Missing Keywords</h3>
          {response.missing_keywords.length > 0 ? (
            <ul>
              {response.missing_keywords.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          ) : (
            <p>None found</p>
          )}

          <h3>Improved Bullets</h3>
          {response.improved_bullets.length > 0 ? (
            <ul>
              {response.improved_bullets.map((b, i) => (
                <li key={i}>
                  <p>
                    <strong>Before:</strong> {b.original}
                  </p>
                  <p>
                    <strong>After:</strong> {b.improved}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No improvements suggested</p>
          )}

          <h3>Final Verdict</h3>
          <p>{response.final_verdict}</p>
        </div>
      )}
    </div>
  );
}

export default Uploader;
