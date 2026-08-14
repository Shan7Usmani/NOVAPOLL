export default function Topbar({ onHome, onCreate }) {
  return (
    <header className="topbar glass">
      <button className="brand" onClick={onHome} aria-label="NOVAPOLL home">
        <span className="brand-mark">◈</span>
        <span className="brand-name">
          NOVA<span className="accent">POLL</span>
        </span>
      </button>
      <nav className="topnav">
        <button className="nav-link" onClick={onHome}>
          Home
        </button>
        <button className="btn btn-neon btn-sm" onClick={onCreate}>
          <span className="plus">+</span> New Poll
        </button>
      </nav>
    </header>
  );
}
