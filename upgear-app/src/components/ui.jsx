// 共通UIコンポーネント

export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.2em", marginBottom: 6 }}>
        UPGEAR / {title.toUpperCase()}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
        {title}
      </h1>
      {sub && <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--bg3)",
      border: "1px solid var(--border)",
      padding: "20px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.2em",
      marginBottom: 16, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

export function StatBox({ label, value, unit, accent }) {
  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--border)",
      padding: "20px 24px",
    }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700,
        color: accent ? "var(--accent)" : "var(--text)",
        letterSpacing: "0.02em",
      }}>
        {value}
        {unit && <span style={{ fontSize: 13, color: "var(--text-dim)", marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

export function Tag({ children, color }) {
  const colors = {
    orange: { bg: "rgba(255,107,0,0.15)", text: "#FF6B00", border: "rgba(255,107,0,0.3)" },
    green:  { bg: "rgba(0,200,100,0.1)",  text: "#00c864", border: "rgba(0,200,100,0.2)" },
    blue:   { bg: "rgba(50,150,255,0.1)", text: "#3296ff", border: "rgba(50,150,255,0.2)" },
    gray:   { bg: "rgba(150,150,150,0.1)",text: "#888",    border: "rgba(150,150,150,0.2)" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-block", fontSize: 10, padding: "2px 8px",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: "0.1em",
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, variant = "default", small, disabled, style }) {
  const base = {
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid",
    fontFamily: "var(--font-mono)",
    fontSize: small ? 11 : 12,
    padding: small ? "4px 12px" : "8px 20px",
    letterSpacing: "0.05em",
    transition: "all 0.15s",
    opacity: disabled ? 0.4 : 1,
    ...style,
  };
  const variants = {
    default: { background: "transparent", color: "var(--text-dim)", borderColor: "var(--border)" },
    primary: { background: "var(--accent)", color: "#000", borderColor: "var(--accent)" },
    danger:  { background: "transparent", color: "#ff4444", borderColor: "#ff4444" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder, small, note }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em" }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          color: "var(--text)", fontFamily: "var(--font-mono)",
          fontSize: small ? 11 : 13, padding: small ? "6px 10px" : "8px 12px",
          outline: "none", width: "100%",
        }}
      />
      {note && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{note}</span>}
    </div>
  );
}

export function Textarea({ label, value, onChange, rows = 3, placeholder, note }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em" }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          color: "var(--text)", fontFamily: "var(--font-mono)",
          fontSize: 13, padding: "8px 12px", resize: "vertical", outline: "none", width: "100%",
        }}
      />
      {note && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{note}</span>}
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em" }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          color: "var(--text)", fontFamily: "var(--font-mono)",
          fontSize: 13, padding: "8px 12px", outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Divider() {
  return <div style={{ borderTop: "1px solid var(--border)", margin: "24px 0" }} />;
}

export function Grid({ cols = 2, gap = 16, children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
    }}>
      {children}
    </div>
  );
}

export function CopyBtn({ text, label = "COPY" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Btn small onClick={copy} variant={copied ? "primary" : "default"}>
      {copied ? "COPIED" : label}
    </Btn>
  );
}

import { useState } from "react";
