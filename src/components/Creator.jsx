import { useState } from "react";
import { createPoll } from "../lib/store.js";

const TTLS = [
  { label: "Never expires", value: "never" },
  { label: "5 minutes", value: "5" },
  { label: "30 minutes", value: "30" },
  { label: "2 hours", value: "120" },
];

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function Creator({ onCreated, onCancel }) {
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(["", "", ""]);
  const [ttl, setTtl] = useState("never");
  const [err, setErr] = useState("");

  const addOpt = () => setOpts((o) => (o.length < 4 ? [...o, ""] : o));
  const delOpt = (i) => setOpts((o) => o.filter((_, j) => j !== i));
  const setOpt = (i, v) => setOpts((o) => o.map((x, j) => (j === i ? v : x)));

  const launch = () => {
    const cleaned = opts.map((o) => o.trim());
    if (q.trim().length < 5) return setErr("Give your poll a clear question (at least 5 characters).");
    if (cleaned.some((o) => !o)) return setErr("Every answer option needs a label.");
    if (cleaned.length < 3) return setErr("Add at least 3 answer options.");
    if (new Set(cleaned).size !== cleaned.length) return setErr("Answer options must be unique.");
    const ttlMin = ttl === "never" ? null : Number(ttl);
    onCreated(createPoll(q.trim(), cleaned, ttlMin));
  };

  return (
    <div className="view">
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="hero-kicker">
          <span className="dot" /> Launch console
        </div>
        <h1 className="hero-title" style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)" }}>
          Create a Poll
        </h1>
      </section>

      <section className="panel glass">
        <div className="field">
          <label className="field-label" htmlFor="q">
            Question <span className="field-count">{q.length}/120</span>
          </label>
          <input
            id="q"
            className="input"
            maxLength={120}
            placeholder="e.g. Which cloud are we migrating to first?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && launch()}
          />
        </div>

        <div className="field">
          <div className="field-label">
            Answer options <span className="field-count">{opts.length}/4</span>
          </div>
          {opts.map((o, i) => (
            <div className="opt-row" key={i}>
              <span className="opt-badge">{LETTERS[i]}</span>
              <input
                className="input"
                maxLength={60}
                placeholder={`Option ${LETTERS[i]} — e.g. ${["AWS", "GCP", "Azure", "On-prem"][i] ?? "Custom"}`}
                value={o}
                onChange={(e) => setOpt(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (opts.length < 4) addOpt();
                    else launch();
                  }
                }}
              />
              <button
                className="opt-del"
                onClick={() => delOpt(i)}
                disabled={opts.length <= 3}
                aria-label={`Remove option ${LETTERS[i]}`}
                style={{ opacity: opts.length <= 3 ? 0.3 : 1 }}
              >
                &times;
              </button>
            </div>
          ))}
          <div className="opt-actions">
            <button className="link-btn" onClick={addOpt} disabled={opts.length >= 4}>
              {opts.length >= 4 ? "Max 4 options reached" : "+ Add another option"}
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="ttl">
              Poll expiry
            </label>
            <select
              id="ttl"
              className="input"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
            >
              {TTLS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err && (
          <p className="hint" style={{ color: "var(--pink)" }}>
            {err}
          </p>
        )}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-neon" onClick={launch}>
            Launch Poll <span aria-hidden="true">&#9654;</span>
          </button>
        </div>

        <p className="hint">
          <b>Tip:</b> voting is open to everyone with the share link — results
          animate live on every screen.
        </p>
      </section>
    </div>
  );
}
