import { useState } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Timer,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthProvider.jsx";
import { useNavigate, useLocation, Link } from "react-router-dom";

const navigation = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: BookOpenCheck, label: "Subjects", path: "/app/subjects" },
  { icon: ClipboardList, label: "Tasks", path: "/app/tasks" },
  { icon: CalendarDays, label: "Calendar", path: "/app/calendar" },
  { icon: Timer, label: "Focus", path: "/app/focus" },
  { icon: ChartNoAxesColumnIncreasing, label: "Study history", path: "/app/sessions" },
  { icon: CircleUserRound, label: "Settings", path: "/app/settings" },
];

export default function AppShell({ pageTitle = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTitle = navigation.find(({ path }) => location.pathname.startsWith(path))?.label ?? pageTitle;

  async function handleLogout() {
    try { await logout(); } finally { navigate("/", { replace: true }); }
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setSidebarOpen(false)} type="button" />}
      <aside aria-label="StudySync workspace" className={`app-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <NavLink aria-label="StudySync dashboard" className="brand app-brand" onClick={() => setSidebarOpen(false)} to="/app/dashboard">
          <span className="brand-mark"><BookOpenCheck aria-hidden="true" /></span>
          <span>studysync</span>
        </NavLink>
        <p className="sidebar-label">WORKSPACE</p>
        <nav aria-label="Workspace navigation" className="sidebar-nav">
          {navigation.map(({ icon: Icon, label, path }) => (
            <NavLink className={({ isActive }) => `sidebar-link${isActive ? " is-active" : ""}`} key={path} onClick={() => setSidebarOpen(false)} to={path}>
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-account">
          <div className="sidebar-user"><span className="user-avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.email}</small></span></div>
          <button className="sidebar-logout" onClick={handleLogout} type="button"><LogOut aria-hidden="true" size={16} /> Sign out</button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <button aria-label={sidebarOpen ? "Close navigation" : "Open navigation"} className="app-menu-button" onClick={() => setSidebarOpen((open) => !open)} type="button">
            {sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <h1>{currentTitle}</h1>
          <Link aria-label="Add a task" className="quick-add" to="/app/tasks?new=1"><Plus aria-hidden="true" /><span>New task</span></Link>
          <NavLink aria-label="Profile settings" className="profile-link" to="/app/settings"><CircleUserRound aria-hidden="true" /></NavLink>
        </header>
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}