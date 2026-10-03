import { Bell, ChevronDown, Command, Menu, Search, Settings2, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { citizenLinks, commonLinks, officerLinks } from '../../constants/navigation';
import { signOut } from '../../services/auth/authService';
import { Brand, Badge } from '../ui';
import { useSocket } from '../../hooks/useSocket';
import { useNotifications } from '../../hooks/useNotifications';

export function AppShell({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [queueToast, setQueueToast] = useState('');

  const navigate = useNavigate();
  const officer = user?.role !== 'Citizen';
  const navItems = officer ? officerLinks : citizenLinks;
  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  // Officer queue updates are only shown to non-citizen accounts.
  useSocket('officer:queue_updated', (payload) => {
    if (user?.role === 'Citizen') return;
    setQueueToast(`📋 New application in queue from ${payload?.applicant || 'an applicant'}`);
  });

  useEffect(() => {
    if (!queueToast) return undefined;
    const timeout = window.setTimeout(() => setQueueToast(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [queueToast]);

  // Reset unread count when user opens the notification panel
  const handleBellClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      markAllRead();
    }
  };

  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="workspace-switch"><span className="workspace-icon">{officer ? <ShieldCheck size={17} /> : <Command size={17} />}</span><span><strong>{officer ? 'Officer workspace' : 'Citizen services'}</strong><small>{officer ? 'KHUNTI REVENUE CIRCLE' : 'INDIA · CITIZEN PORTAL'}</small></span><ChevronDown size={15} /></div>
      <nav className="side-nav"><span className="nav-label">WORKSPACE</span>{navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><item.icon size={17} /><span>{item.label}</span>{item.count && <small>{item.count}</small>}</NavLink>)}
        <span className="nav-label nav-label-gap">LAND INTELLIGENCE</span>{commonLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><item.icon size={17} /><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><Settings2 size={16} /></div><strong>System Status</strong><p>All core services operational. Connection secure.</p><Badge tone="green">LIVE INSTANCE</Badge></div><div className="sidebar-profile"><span className="avatar">{user?.initials || 'AS'}</span><span><strong>{user?.name || 'Ananya Soren'}</strong><small>{user?.role || 'Citizen'}</small></span><button onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile options"><ChevronDown size={15} /></button>{profileOpen && <div className="profile-popover"><button onClick={() => navigate('/citizen/profile')}>My profile</button><button onClick={handleSignOut}>Sign out</button></div>}</div></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="topbar-crumb"><span>India</span><span className="crumb-slash">/</span><strong>{officer ? 'Land Records Directorate' : 'Citizen Portal'}</strong></div><div className="topbar-actions"><button className="top-search" onClick={() => navigate('/search')}><Search size={15} /><span>Search ULPIN or records</span><kbd>⌘ K</kbd></button><div className="notification-anchor">
      <button
        className={`icon-button ${notificationOpen ? 'icon-button-active' : ''}`}
        onClick={handleBellClick}
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {/* Live unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && <motion.span
            key="unread-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>}
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {notificationOpen && <motion.div className="notification-popover" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
          <div className="popover-heading"><div><strong>Notifications</strong><small>{unreadCount} unread updates</small></div><button onClick={() => navigate('/notifications')}>View all</button></div>
          <div className="notification-list">
            {notifications.length ? notifications.slice(0, 8).map((item, index) => <div className="popover-note" key={item.id || `${item.title}-${index}`}><span className={`note-mark note-${item.type}`} /><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.timestamp || item.time || 'Just now'}</small></div></div>) : <p className="notification-empty">You’re all caught up.</p>}
          </div>
        </motion.div>}
      </AnimatePresence>
    </div><span className="topbar-divider" /><span className="top-date">MON, 29 SEP 2026</span></div></header><div className="page-content">{children}</div><footer className="app-footer"><span>BHARAT · INDIA</span><span>Made with ❤️ by Team Ethanol · SIH-26014</span><a href="/docs">Accessibility &amp; help</a></footer></main>
    {queueToast && <div className="queue-toast" role="status">{queueToast}</div>}
  </div>;
}
