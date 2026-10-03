import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertCircle, Clock3, RefreshCw, ShieldCheck } from 'lucide-react';
import { getAuthToken } from '../../services/auth/authService';
import { Card } from '../../components/ui';

const formatTimestamp = (value) => {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function AuditTrailPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadAuditLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getAuthToken();
        const response = await fetch('/api/v1/analytics/audit-logs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load the audit trail.');
        }
        setEntries(Array.isArray(result.data) ? result.data : []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Unable to load the audit trail.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadAuditLogs();
    return () => controller.abort();
  }, []);

  return <>
    <div className="page-intro">
      <div>
        <span className="eyebrow">GOVERNANCE &amp; ACCOUNTABILITY</span>
        <h1>Audit trail</h1>
        <p>A chronological record of actions across the bhuSETU platform.</p>
      </div>
      <div className="page-intro-action">
        <span className="badge badge-blue"><ShieldCheck size={13} /> {entries.length} recorded actions</span>
      </div>
    </div>

    <Card className="content-card audit-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SYSTEM ACTIVITY</span>
          <h2><Activity size={16} /> Recent actions</h2>
          <p>Newest entries appear first.</p>
        </div>
      </div>

      {loading ? <div className="loading-state"><span className="spinner" />Loading audit entries…</div>
        : error ? <div className="error-state"><AlertCircle size={16} />{error}</div>
          : entries.length === 0 ? <div className="empty-state"><span><Activity size={18} /></span><strong>No audit entries yet</strong><p>Actions will appear here as they are recorded.</p></div>
            : <div className="audit-timeline">
              <AnimatePresence initial={false}>
                {entries.map((entry, index) => (
                  <motion.article
                    className="audit-entry"
                    key={entry.id || `${entry.timestamp}-${entry.action}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.35) }}
                  >
                    <span className="audit-entry-marker"><Activity size={14} /></span>
                    <div className="audit-entry-content">
                      <div className="audit-entry-heading">
                        <strong>{entry.action || 'Action recorded'}</strong>
                        <time dateTime={entry.timestamp || undefined}><Clock3 size={13} />{formatTimestamp(entry.timestamp)}</time>
                      </div>
                      <p>By <strong>{entry.actor || 'Unknown actor'}</strong></p>
                      <div className="audit-entry-target"><span>Target</span><strong>{entry.target || 'Not specified'}</strong></div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>}
    </Card>
  </>;
}
