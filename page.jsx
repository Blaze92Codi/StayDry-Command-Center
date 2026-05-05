 "use client";

import { useState } from "react";

export default function Page() {
  const [clientName, setClientName] = useState("");
  const [propertyIssue, setPropertyIssue] = useState("");
  const [fieldNotes, setFieldNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateResponse() {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, propertyIssue, fieldNotes })
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput(data.error || "Something went wrong.");
      } else {
        setOutput(data.response);
      }
    } catch (err) {
      setOutput("Connection error. Check your Vercel API setup.");
    }

    setLoading(false);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>StayDry Command</h1>
        <p style={styles.subtitle}>Waterproofing Client Response Generator</p>

        <label style={styles.label}>Client Name</label>
        <input style={styles.input} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Example: John Smith" />

        <label style={styles.label}>Property Issue</label>
        <textarea style={styles.textarea} value={propertyIssue} onChange={(e) => setPropertyIssue(e.target.value)} placeholder="Example: Backup sump pump running constantly..." />

        <label style={styles.label}>Field Notes</label>
        <textarea style={styles.textarea} value={fieldNotes} onChange={(e) => setFieldNotes(e.target.value)} placeholder="Example: Zoeller pump not on block, debris in pit, float not engaging..." />

        <button style={styles.button} onClick={generateResponse} disabled={loading}>
          {loading ? "Generating..." : "Generate Client Response"}
        </button>

        {output && (
          <section style={styles.outputBox}>
            <button style={styles.copyButton} onClick={copyOutput}>Copy Response</button>
            <pre style={styles.output}>{output}</pre>
          </section>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#111827",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: "850px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
  },
  title: {
    margin: "0",
    fontSize: "34px",
    fontWeight: "800"
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "#475569"
  },
  label: {
    display: "block",
    fontWeight: "700",
    marginTop: "16px",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "16px"
  },
  textarea: {
    width: "100%",
    minHeight: "95px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    resize: "vertical"
  },
  button: {
    width: "100%",
    marginTop: "22px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#0f766e",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer"
  },
  outputBox: {
    marginTop: "24px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px"
  },
  copyButton: {
    marginBottom: "12px",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #94a3b8",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: "700"
  },
  output: {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    fontSize: "15px",
    lineHeight: "1.5"
  }
};
