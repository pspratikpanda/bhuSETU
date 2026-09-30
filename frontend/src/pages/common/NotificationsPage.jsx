import { useState } from 'react';
import { ArrowRight, Bell, CircleHelp, FileCheck2, MapPinned, ShieldAlert, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notifications as mockNotifications } from '../../data/mockNotifications';
import { Badge, Card, SectionHeading } from '../../components/ui';
import { useSocket, useSocketStatus } from '../../hooks/useSocket';

function notifIcon(type) {
  if (type === 'application') return <FileCheck2 size={17} />;
  if (type === 'verified') return <MapPinned size={17} />;
  return <ShieldAlert size={17} />;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [liveCount, setLiveCount] = useState(0);
  const socketStatus = useSocketStatus();

  // Real-time: prepend incoming notifications to the feed
  useSocket('notification:new', (notif) => {
    setNotifications((prev) => [{ ...notif, unread: true }, ...prev]);
    setLiveCount((c) => c + 1);
  });

  // Real-time: show application status changes as notifications
  useSocket('application:status_changed', (payload) => {
    const syntheticNotif = {
      id: `live-${Date.now()}`,
      title: `Application ${payload.status}`,
      message: `Application ${payload.applicationId} status changed to ${payload.status} by ${payload.updatedBy}.`,
      time: 'Just now',
      type: 'application',
      unread: true,
    };
    setNotifications((prev) => [syntheticNotif, ...prev]);
    setLiveCount((c) => c + 1);
  });

  const unreadCount = notifications.filter((n) => n.unread).length;
  const recentNotifs = notifications.slice(0, 4);
  const earlierNotifs = notifications.slice(4);

  return <>
    <div className="page-intro">
      <div>
        <span className="eyebrow">UPDATES &amp; SERVICE NOTICES</span>
        <h1>Notifications</h1>
        <p>Application, document and land record updates — live via WebSocket.</p>
      </div>
      <div className="notification-page-count">
        <span className="unread-dot" />
        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        <span
          title={`WebSocket: ${socketStatus}`}
          style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.75 }}
        >
          <Wifi size={11} />
          {socketStatus}
        </span>
      </div>
    </div>

    <div className="notification-page-grid">
      <div className="notification-feed">
        <div className="notification-day"><span>RECENT</span><i /></div>

        {recentNotifs.map((item, index) => (
          <Card
            className={`notification-card ${item.unread ? 'notification-unread' : ''}`}
            key={item.id || `${item.title}-${index}`}
          >
            <span className={`notification-icon notification-icon-${item.type}`}>
              {notifIcon(item.type)}
            </span>
            <div className="notification-copy">
              <div>
                <strong>{item.title}</strong>
                {item.unread && <span className="unread-label">NEW</span>}
                <time>{item.time || 'Just now'}</time>
              </div>
              <p>{item.message}</p>
              <span className="notification-context">Citizen services · Live</span>
            </div>
          </Card>
        ))}

        <div className="notification-day"><span>EARLIER</span><i /></div>

        {earlierNotifs.map((item, index) => (
          <Card className="notification-card" key={item.id || `${item.title}-${index}`}>
            <span className={`notification-icon notification-icon-${item.type}`}>
              {notifIcon(item.type)}
            </span>
            <div className="notification-copy">
              <div>
                <strong>{item.title}</strong>
                <time>{item.time}</time>
              </div>
              <p>{item.message}</p>
              <span className="notification-context">Citizen services · Archive</span>
            </div>
          </Card>
        ))}
      </div>

      <aside className="notification-side">
        <Card className="content-card">
          <SectionHeading eyebrow="PREFERENCES" title="Notification settings" />
          <p>Choose how you would like to stay informed about your land services.</p>
          {['Application status', 'Document requests', 'Record changes', 'Review alerts'].map((item, index) => (
            <label className="preference-row" key={item}>
              <span>
                <strong>{item}</strong>
                <small>{index === 2 ? 'Updates to linked parcels' : 'Important service updates'}</small>
              </span>
              <input type="checkbox" defaultChecked={index < 2} />
            </label>
          ))}
        </Card>

        <Card className="content-card help-card">
          <CircleHelp size={18} />
          <div>
            <strong>Questions about an update?</strong>
            <p>Track your active applications for status updates.</p>
            <Link to="/citizen/applications">View applications <ArrowRight size={13} /></Link>
          </div>
        </Card>

        <div className="prototype-data-note">
          <Bell size={12} style={{ marginRight: 5 }} />
          Real-time notifications active via Socket.IO WebSocket engine.
        </div>
      </aside>
    </div>
  </>;
}
