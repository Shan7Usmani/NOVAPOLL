import { useEffect, useState } from "react";
import { loadPolls, deletePoll, pollTotal } from "../lib/store.js";

function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function Stat({ value, suffix = "", color = "", label }) {
  const n = useCountUp(value);
  return (
    <div className="stat glass">
      <div className={`stat-num ${color}`}>
        {n.toLocaleString()}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function MiniChart({ options }) {
  const max = Math.max(...options.map((o) => o.votes), 0);
  return (
    <div className="mini-chart" aria-hidden="true">
      {options.map((o, i) => (
        <i
          key={o.id}
          style={{ height: max ? `${Math.max(8, (o.votes / max) * 100)}%` : "8%" }}
          title={o.text}
        />
      ))}
    </div>
  );
}

export default function Home({ onCreate, onOpen }) {
  const [polls, setPolls] = useState(() => loadPolls());

  const refresh = () => setPolls(loadPolls());
  const remove = (id) => {
    deletePoll(id);
    refresh();
  };

  const liveCount = polls.filter((p) => !p.closed).length;
  const totalVotes = polls.reduce((s, p) => s + pollTotal(p), 0);

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-kicker">
          <span className="dot" /> Live crowdsignal
        </div>
        <h1 className="hero-title">
          Ask. Vote.
          <br />
          Watch it go live.
        </h1>
        <p className="hero-sub">
          Create a poll, add 3–4 options and launch. Voters stream in and results
          render as a living neon bar chart — counts, percentages and momentum
          in real time.
        </p>
        <div className="hero-cta">
          <button className="btn btn-neon" onClick={onCreate}>
            <span className="plus">+</span> Create a Poll
          </button>
        </div>
      </section>

      <section className="stats">
        <Stat value={polls.length} label="Polls created" />
        <Stat value={totalVotes} label="Votes cast" />
        <Stat value={liveCount} suffix=" live" color="cyan" label="Live now" />
      </section>

      <section className="panel glass" style={{ marginTop: "44px", maxWidth: "860px" }}>
        <h2 className="panel-title">
          Poll <span className="accent">History</span>
        </h2>
        <p className="panel-desc">Every poll you launch lives here. Open one to keep collecting votes, or close and lock results.</p>

        {polls.length === 0 ? (
          <div className="empty">
            <b>No polls yet</b>
            Launch your first poll to start collecting live votes.
          </div>
        ) : (
          <div className="history-grid">
            {polls.map((p) => {
              const total = pollTotal(p);
              return (
                <div className="history-item glass" key={p.id}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="history-q">
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.question}</span>
                      <span className={`chip ${p.closed ? "closed" : "live"}`}>
                        {p.closed ? "Closed" : "Live"}
                      </span>
                    </div>
                    <div className="history-meta">
                      {total.toLocaleString()} vote{total === 1 ? "" : "s"} &middot;{" "}
                      {p.options.length} options &middot;{" "}
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <MiniChart options={p.options} />
                    </div>
                  </div>
                  <div className="history-actions">
                    <button className="btn btn-cyan btn-sm" onClick={() => onOpen(p.id)}>
                      Open
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`Delete "${p.question}"?`)) remove(p.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
