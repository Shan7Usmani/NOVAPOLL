import { useCallback, useEffect, useState } from "react";
import { getPoll } from "./lib/store.js";
import { isRemote, remoteLoad, remoteSave, remoteSubscribe } from "./lib/remote.js";
import Topbar from "./components/Topbar.jsx";
import Home from "./components/Home.jsx";
import Creator from "./components/Creator.jsx";
import Poll from "./components/Poll.jsx";

function pollUrl(id) {
  return `${location.pathname}?p=${id}`;
}

export default function App() {
  const [view, setView] = useState("home");
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("p");
    if (!id) return;
    (async () => {
      const remote = isRemote ? await remoteLoad(id) : null;
      const found = remote || getPoll(id);
      if (found) {
        setPoll(found);
        setView("poll");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isRemote || !poll) return;
    return remoteSubscribe(poll.id, (data) => setPoll(data));
  }, [poll?.id]);

  const goHome = () => {
    setPoll(null);
    setView("home");
    if (location.search) history.replaceState(null, "", location.pathname);
  };

  const openPoll = async (id) => {
    const remote = isRemote ? await remoteLoad(id) : null;
    const found = remote || getPoll(id);
    if (!found) return;
    setPoll(found);
    setView("poll");
    history.replaceState(null, "", pollUrl(id));
  };

  const created = async (p) => {
    if (isRemote) await remoteSave(p);
    setPoll(p);
    setView("poll");
    history.replaceState(null, "", pollUrl(p.id));
  };

  const syncPoll = useCallback((p) => setPoll(p), []);

  return (
    <>
      <Topbar
        onHome={goHome}
        onCreate={() => setView("create")}
      />
      <main className="container" aria-live="polite">
        {view === "home" && <Home onCreate={() => setView("create")} onOpen={openPoll} />}
        {view === "create" && <Creator onCreated={created} onCancel={goHome} />}
        {view === "poll" && poll && (
          <Poll poll={poll} onUpdate={syncPoll} onOpen={openPoll} onHome={goHome} />
        )}
      </main>
      <footer className="footer">
        <span>NOVAPOLL &middot; built by Shan Usmani</span>
        <span className="footer-dot">&#9679;</span>
        <span>Vicodathon Live Steer Challenge</span>
      </footer>
    </>
  );
}
