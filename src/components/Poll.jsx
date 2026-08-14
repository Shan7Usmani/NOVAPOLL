import { useEffect, useRef, useState } from "react";
import { getPoll, castVote, changeVote, closePoll, reopenPoll, pollTotal } from "../lib/store.js";
import { isRemote, remoteSave, remoteVote } from "../lib/remote.js";

const BOT_COLORS = ["#00ff7a", "#00d9ff", "#ffb02e", "#ff3d81", "#a78bfa", "#38f0c0"];
const BOT_BASES = ["NOVA", "XEN", "ORB", "SKY", "PULSE", "VEGA", "LYRA", "NEB", "ALT", "CRUX"];

function botPersona(pollId) {
  let h = 0;
  for (let i = 0; i < pollId.length; i++) h = (h * 31 + pollId.charCodeAt(i)) >>> 0;
  return {
    base: BOT_BASES[h % BOT_BASES.length],
    color: BOT_COLORS[(h >> 3) % BOT_COLORS.length],
    seed: h,
  };
}

function weightedPick(options) {
  const ws = options.map((o) => Math.pow(o.votes + 1, 1.4) + Math.random() * 5);
  const total = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ws.length; i++) {
    r -= ws[i];
    if (r <= 0) return i;
  }
  return ws.length - 1;
}

function sparkBuckets(events, bars = 36) {
  if (!events.length) return [];
  const cut = events.slice(-108);
  const buckets = Array(bars).fill(0);
  cut.forEach((e, j) => {
    const b = Math.min(bars - 1, Math.floor((j / cut.length) * bars));
    buckets[b] += 1;
  });
  const max = Math.max(...buckets, 1);
  return buckets.map((v) => (v / max) * 100);
}

export default function Poll({ poll, onUpdate, onOpen, onHome }) {
  const [myVote, setMyVote] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [now, setNow] = useState(Date.now());
  const personaRef = useRef(botPersona(poll.id));

  const total = pollTotal(poll);
  const live = !poll.closed;
  const maxV = Math.max(...poll.options.map((o) => o.votes), 0);
  const pct = (v) => (total ? Math.round((v / total) * 1000) / 10 : 0);
  const remaining = poll.expiresAt ? Math.max(0, Math.ceil((poll.expiresAt - now) / 1000)) : null;
  const mm = remaining != null ? String(Math.floor(remaining / 60)).padStart(2, "0") : "00";
  const ss = remaining != null ? String(remaining % 60).padStart(2, "0") : "00";

  const pushToast = (t) => setToasts((arr) => [...arr.slice(-2), t]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const last = toasts[toasts.length - 1];
    const t = setTimeout(() => setToasts((arr) => arr.filter((x) => x !== last)), 3600);
    return () => clearTimeout(t);
  }, [toasts]);

  useEffect(() => {
    if (!poll.expiresAt || poll.closed) return;
    if (Date.now() >= poll.expiresAt) {
      (async () => {
        if (isRemote) {
          await remoteSave({ ...poll, closed: true });
        } else {
          closePoll(poll.id);
        }
        onUpdate(getPoll(poll.id));
      })();
    }
  }, [now, poll, onUpdate]);

  useEffect(() => {
    if (poll.closed) return;
    let stopped = false;
    let timer;
    const persona = personaRef.current;
    const cap = isRemote ? 60 : 240;
    const tick = async () => {
      if (stopped) return;
      const cur = getPoll(poll.id);
      if (!cur || cur.closed) return;
      if (pollTotal(cur) >= cap) return;
      const idx = weightedPick(cur.options);
      const who = `${persona.base}-${(persona.seed + cur.events.length) % 90}`;
      if (isRemote) {
        const data = await remoteVote(cur.id, idx, who, null);
        if (data) {
          onUpdate(data);
          pushToast({ idx, who, color: persona.color });
        }
      } else {
        castVote(cur.id, idx, who);
        onUpdate(getPoll(cur.id));
        pushToast({ idx, who, color: persona.color });
      }
      timer = setTimeout(tick, 1500 + Math.random() * 2800);
    };
    timer = setTimeout(tick, 1200);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [poll.id, poll.closed, onUpdate]);

  const vote = async (idx) => {
    if (!live) return;
    if (myVote === idx) return;
    if (isRemote) {
      const from = myVote !== null ? myVote : null;
      const data = await remoteVote(poll.id, idx, "YOU", from);
      if (data) {
        setMyVote(idx);
        onUpdate(data);
      }
    } else {
      const cur = getPoll(poll.id);
      if (!cur) return;
      if (myVote !== null) changeVote(cur.id, myVote, idx, "YOU");
      else castVote(cur.id, idx, "YOU");
      setMyVote(idx);
      onUpdate(getPoll(cur.id));
    }
  };

  const share = async () => {
    const url = `${location.origin}${location.pathname}?p=${poll.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: poll.question, url });
        return;
      } catch {
        /* user dismissed share sheet — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      pushToast({ msg: "Share link copied to clipboard" });
    } catch {
      pushToast({ msg: url });
    }
  };

  const toggleClose = async () => {
    if (live) {
      const next = { ...poll, closed: true };
      if (isRemote) await remoteSave(next);
      else closePoll(poll.id);
      pushToast({ who: null, idx: null, color: null, msg: "Poll closed — results locked" });
      onUpdate(isRemote ? next : getPoll(poll.id));
    } else {
      const next = { ...poll, closed: false, expiresAt: null };
      if (isRemote) await remoteSave(next);
      else reopenPoll(poll.id);
      pushToast({ who: null, idx: null, color: null, msg: "Poll reopened for voting" });
      onUpdate(isRemote ? next : getPoll(poll.id));
    }
  };

  const sparks = sparkBuckets(poll.events);
  const avatars = poll.events.slice(-6).map((e, i) => {
    let h = 0;
    const s = String(e.who || e.o);
    for (let j = 0; j < s.length; j++) h = (h * 31 + s.charCodeAt(j)) >>> 0;
    return { key: poll.events.length - 6 + i, who: e.who, color: BOT_COLORS[(h + i) % BOT_COLORS.length] };
  });

  const winnerIdx = maxV > 0 ? poll.options.findIndex((o) => o.votes === maxV) : -1;

  return (
    <div className="view">
      <section className="poll-head">
        <span className={`live-badge ${live ? "" : "closed"}`}>
          <span className="dot" />
          {live ? "Live results" : "Poll closed"}
        </span>
        <h1 className="poll-q">{poll.question}</h1>
        <div className="poll-meta">
          <span className="live-count">
            {total.toLocaleString()} vote{total === 1 ? "" : "s"}
          </span>
          <span>{poll.options.length} options</span>
          {remaining != null && live && (
            <span className="countdown">
              Closes in {mm}:{ss}
            </span>
          )}
          {myVote !== null && (
            <span style={{ color: "var(--neon)" }}>Your vote: {poll.options[myVote].text}</span>
          )}
        </div>
      </section>

      <section className="panel glass">
        <div className="options">
          {poll.options.map((o, i) => {
            const v = o.votes || 0;
            const w = total ? (v / total) * 100 : 0;
            const isWinner = live && v === maxV && maxV > 0;
            return (
              <button
                key={o.id}
                className={`option ${myVote === i ? "voted" : ""} ${isWinner ? "winner" : ""}`}
                onClick={() => vote(i)}
                disabled={!live}
                aria-label={`Vote for ${o.text}`}
              >
                <span className="option-bar" style={{ width: `${w}%` }} />
                <span className="option-inner">
                  <span className="opt-rank">{isWinner ? "★" : i + 1}</span>
                  <span className="opt-text">{o.text}</span>
                  <span className="opt-votes">
                    <span className="opt-pct">{pct(v)}%</span>
                    <span className="opt-count">
                      {v.toLocaleString()} vote{v === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="opt-check">&#10003;</span>
                </span>
              </button>
            );
          })}
        </div>

        {!live && winnerIdx >= 0 && (
          <div className="result-banner">
            Winner: {poll.options[winnerIdx].text} with{" "}
            {pct(poll.options[winnerIdx].votes)}% of votes.
          </div>
        )}

        <div className="poll-foot">
          <div className="voters-pill">
            <div className="avatars">
              {avatars.map((a) => (
                <span key={a.key} className="avatar" style={{ background: a.color }}>
                  {String(a.who || "?").slice(0, 2)}
                </span>
              ))}
            </div>
            {poll.events.length > 0
              ? `${poll.events.length} recent activity`
              : live
              ? "Waiting for first vote…"
              : "No votes recorded"}
          </div>
          <div className="poll-tools">
            <button className="btn btn-cyan btn-sm" onClick={share}>
              &#128279; Share
            </button>
            <button className="btn btn-ghost btn-sm" onClick={toggleClose}>
              {live ? "Close poll" : "Reopen"}
            </button>
          </div>
        </div>

        {sparks.length > 0 && (
          <div className="spark-wrap">
            <div className="spark-head">
              <span>Vote momentum</span>
              <span>last {poll.events.length} votes</span>
            </div>
            <div className="spark" aria-hidden="true">
              {sparks.map((h, i) => (
                <i key={i} style={{ height: `${Math.max(4, h)}%` }} />
              ))}
            </div>
          </div>
        )}
      </section>

      <div id="toasts" className="toasts">
        {toasts.map((t, i) => (
          <div className="toast" key={t.id ?? i}>
            {t.msg ? (
              <span>{t.msg}</span>
            ) : (
              <>
                <span className="dot" style={{ background: t.color || "var(--neon)", boxShadow: `0 0 10px ${t.color || "var(--neon)"}` }} />
                <span>
                  <b>{t.who}</b> voted for <span className="t-opt">{poll.options[t.idx]?.text}</span>
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
