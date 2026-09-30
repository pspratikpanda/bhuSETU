import { Bell, ChevronDown, Command, Menu, Search, Settings2, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { citizenLinks, commonLinks, officerLinks } from '../../constants/navigation';
import { signOut } from '../../services/auth/authService';
import { notifications as mockNotifications } from '../../data/mockNotifications';
import { Brand, Badge } from '../ui';
import { useSocket } from '../../hooks/useSocket';

export function AppShell({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Live notification state — starts with mock data, updated in real-time via socket
  const [liveNotifications, setLiveNotifications] = useState(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(
    mockNotifications.filter((n) => n.unread).length
  );

  const navigate = useNavigate();
  const officer = user?.role !== 'Citizen';
  const navItems = officer ? officerLinks : citizenLinks;
  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  // ── Real-time: receive new notifications via Socket.IO ───────────────────
  useSocket('notification:new', (notif) => {
    setLiveNotifications((prev) => [{ ...notif, unread: true }, ...prev]);
    setUnreadCount((c) => c + 1);
  });

  // ── Real-time: application status changes create a notification entry ─────
  useSocket('application:status_changed', (payload) => {
    const syntheticNotif = {
      id: `live-${Date.now()}`,
      title: `Application ${payload.status}`,
      message: `Application ${payload.applicationId} was ${payload.status} by ${payload.updatedBy}.`,
      time: 'Just now',
      type: 'application',
      unread: true,
    };
    setLiveNotifications((prev) => [syntheticNotif, ...prev]);
    setUnreadCount((c) => c + 1);
  });

  // Reset unread count when user opens the notification panel
  const handleBellClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      setUnreadCount(0);
      setLiveNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  };

  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="workspace-switch"><span className="workspace-icon">{officer ? <ShieldCheck size={17} /> : <Command size={17} />}</span><span><strong>{officer ? 'Officer workspace' : 'Citizen services'}</strong><small>{officer ? 'KHUNTI REVENUE CIRCLE' : 'JHARKHAND · CITIZEN PORTAL'}</small></span><ChevronDown size={15} /></div>
      <nav className="side-nav"><span className="nav-label">WORKSPACE</span>{navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><item.icon size={17} /><span>{item.label}</span>{item.count && <small>{item.count}</small>}</NavLink>)}
        <span className="nav-label nav-label-gap">LAND INTELLIGENCE</span>{commonLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><item.icon size={17} /><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><Settings2 size={16} /></div><strong>Prototype environment</strong><p>Demo records only. No live government data is connected.</p><Badge tone="blue">DEMO INSTANCE</Badge></div><div className="sidebar-profile"><span className="avatar">{user?.initials || 'AS'}</span><span><strong>{user?.name || 'Ananya Soren'}</strong><small>{user?.role || 'Citizen'}</small></span><button onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile options"><ChevronDown size={15} /></button>{profileOpen && <div className="profile-popover"><button onClick={() => navigate('/citizen/profile')}>My profile</button><button onClick={handleSignOut}>Sign out</button></div>}</div></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="topbar-crumb"><span>Jharkhand</span><span className="crumb-slash">/</span><strong>{officer ? 'Land Records Directorate' : 'Citizen Portal'}</strong></div><div className="topbar-actions"><button className="top-search" onClick={() => navigate('/search')}><Search size={15} /><span>Search ULPIN or records</span><kbd>⌘ K</kbd></button><div className="notification-anchor">
      <button
        className={`icon-button ${notificationOpen ? 'icon-button-active' : ''}`}
        onClick={handleBellClick}
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {/* Live unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 2, right: 2,
            background: 'var(--color-danger, #ef4444)',
            color: '#fff',
            borderRadius: '50%',
            width: 16, height: 16,
            fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700,
            lineHeight: 1,
            pointerEvents: 'none',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {notificationOpen && <div className="notification-popover"><div className="popover-heading"><div><strong>Notifications</strong><small>{liveNotifications.filter((n) => n.unread).length} unread updates</small></div><button onClick={() => navigate('/notifications')}>View all</button></div>{liveNotifications.slice(0, 3).map((item) => <div className="popover-note" key={item.id || item.title}><span className={`note-mark note-${item.type}`} /><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.time || 'Just now'}</small></div></div>)}</div>}
    </div><span className="topbar-divider" /><span className="top-date">MON, 29 SEP 2026</span></div></header><div className="page-content">{children}</div><footer className="app-footer"><span>BHARAT · JHARKHAND</span><span>Prototype interface · SIH-26014</span><a href="/docs">Accessibility &amp; help</a></footer></main>
  </div>;
}
