const KEY = "novapoll_polls_v1";

export const uid = () =>
  Math.random().toString(36).slice(2, 7) + Date.now().toString(36).slice(-4);

export function loadPolls() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function savePolls(polls) {
  localStorage.setItem(KEY, JSON.stringify(polls));
}

export function getPoll(id) {
  return loadPolls().find((p) => p.id === id) || null;
}

export function createPoll(question, optionTexts, ttlMin) {
  const poll = {
    id: uid(),
    question,
    options: optionTexts.map((text) => ({ id: uid(), text, votes: 0 })),
    createdAt: Date.now(),
    closed: false,
    expiresAt: ttlMin ? Date.now() + ttlMin * 60000 : null,
    events: [],
  };
  const polls = loadPolls();
  polls.unshift(poll);
  savePolls(polls);
  return poll;
}

function updatePoll(patch) {
  const polls = loadPolls();
  const i = polls.findIndex((p) => p.id === patch.id);
  if (i === -1) return null;
  polls[i] = { ...polls[i], ...patch };
  savePolls(polls);
  return polls[i];
}

export function castVote(id, optIdx, who) {
  const p = getPoll(id);
  if (!p) return null;
  const options = p.options.map((o, i) =>
    i === optIdx ? { ...o, votes: o.votes + 1 } : o
  );
  return updatePoll({
    id,
    options,
    events: [...p.events, { t: Date.now(), o: optIdx, who }],
  });
}

export function changeVote(id, fromIdx, toIdx, who) {
  const p = getPoll(id);
  if (!p) return null;
  const options = p.options.map((o, i) => {
    if (i === fromIdx) return { ...o, votes: Math.max(0, o.votes - 1) };
    if (i === toIdx) return { ...o, votes: o.votes + 1 };
    return o;
  });
  return updatePoll({
    id,
    options,
    events: [...p.events, { t: Date.now(), o: toIdx, who }],
  });
}

export function closePoll(id) {
  return updatePoll({ id, closed: true });
}

export function reopenPoll(id) {
  return updatePoll({ id, closed: false, expiresAt: null });
}

export function deletePoll(id) {
  const polls = loadPolls().filter((p) => p.id !== id);
  savePolls(polls);
}

export const pollTotal = (p) =>
  p.options.reduce((s, o) => s + (o.votes || 0), 0);
