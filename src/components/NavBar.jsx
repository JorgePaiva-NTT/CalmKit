export default function NavBar({ view, setView }) {
  const tabs = ["coach", "anchors", "log", "export"]
  return (
    <nav>
      {tabs.map((t) => (
        <button key={t} onClick={() => setView(t)} className={view === t ? "active" : ""}>
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </nav>
  )
}