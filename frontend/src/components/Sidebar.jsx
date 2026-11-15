import {
  LayoutDashboard,
  BatteryCharging,
  GitCompareArrows,
  CalendarDays,
  Zap,
  ChevronRight,
  X
} from "lucide-react";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "settings", label: "Battery & Prices", icon: BatteryCharging },
  { id: "results", label: "DP vs Greedy", icon: GitCompareArrows },
  { id: "schedule", label: "Usage Strategy", icon: CalendarDays }
];

export default function Sidebar({
  activePage,
  setActivePage,
  mobileMenu,
  setMobileMenu
}) {
  return (
    <>
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Zap size={22} fill="currentColor" />
          </div>

          <div className="brand-copy">
            <h2>Sustanic</h2>
            <small>OPTIMIZING LIFE</small>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activePage === id ? "active" : ""}`}
              onClick={() => {
                setActivePage(id);
                setMobileMenu(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>

              {activePage === id && (
                <ChevronRight className="nav-chevron" size={15} />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <div>
              <strong>Local engine online</strong>
              <small>Node API · localhost:5000</small>
            </div>
          </div>

          <p>© 2026 Sustanic · Optimizing life</p>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
    </>
  );
}