import { Activity, ArrowRight, ArrowUpRight, BellRing, Building2, ChartNoAxesCombined, Clock3, FileCheck2, FileSearch, Map, MapPinned, ShieldAlert, TriangleAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { applications, activity } from '../../data/mockApplications';
import { alerts } from '../../data/mockAlerts';
import { parcels } from '../../data/mockParcels';
import { ApplicationsChart, LandTypeChart } from '../../components/charts/AnalyticsCharts';
import ParcelMap from '../../components/maps/ParcelMap';
import { Badge, Button, Card, RiskLabel, SectionHeading, StatCard, StatusBadge, Table } from '../../components/ui';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const columns = [
    { key: 'id', label: 'APPLICATION ID', render: (value) => <strong className="table-id">{value}</strong> },
    { key: 'applicant', label: 'APPLICANT' },
    { key: 'ulpin', label: 'ULPIN', render: (value) => <span className="mono-label">{value}</span> },
    { key: 'type', label: 'TYPE' },
    { key: 'submitted', label: 'RECEIVED' },
    { key: 'status', label: 'STATUS', render: (value) => <StatusBadge status={value} /> },
  ];
  return <>
    <div className="command-welcome"><div><div className="command-overline"><span className="live-dot" />REVENUE ADMINISTRATION <span>· KHUNTI CIRCLE</span></div><h1>Command centre</h1><p>Operational overview of land records, applications and review activity.</p></div><div className="command-actions"><Button variant="outline" icon={Map} onClick={() => navigate('/map')}>Open GIS map</Button><Button icon={FileCheck2} onClick={() => navigate('/officer/applications')}>Review applications</Button></div></div>
    <div className="metrics-grid"><StatCard label="Total parcels" value="12,458" detail="Across Khunti district" icon={MapPinned} tone="blue" trend="4.2%" /><StatCard label="Pending applications" value="328" detail="24 received this week" icon={Clock3} tone="amber" trend="8.6%" /><StatCard label="AI risk alerts" value="47" detail="6 require priority review" icon={ShieldAlert} tone="red" trend="3 new" /><StatCard label="Active disputes" value="13" detail="4 cases escalated" icon={TriangleAlert} tone="violet" trend="2" /></div>
    <div className="dashboard-grid dashboard-grid-top"><Card className="content-card map-dashboard-card"><SectionHeading eyebrow="GEOSPATIAL OVERVIEW" title="Parcel intelligence map" description="A live-style view of prototype cadastral data" action={<Link className="text-link" to="/map">Explore map <ArrowRight size={14} /></Link>} /><ParcelMap /></Card><Card className="content-card alert-summary-card"><SectionHeading eyebrow="REQUIRES ATTENTION" title="Priority signals" action={<Link className="icon-link" to="/officer/alerts">All alerts</Link>} /><div className="alert-summary-list">{alerts.slice(0, 3).map((alert) => <Link className="alert-summary" key={alert.id} to="/officer/alerts"><span className={`alert-mark mark-${alert.severity.toLowerCase()}`}><ShieldAlert size={16} /></span><span className="alert-summary-copy"><strong>{alert.title}</strong><small>{alert.ulpin}</small><small className="alert-meta"><span className={`text-${alert.severity.toLowerCase()}`}>{alert.severity} priority</span> · {alert.date}</small></span><ArrowUpRight size={15} /></Link>)}</div><div className="ai-disclaimer"><ShieldAlert size={15} /><span>AI-assisted indicators support review and do not determine fraud or legal status.</span></div></Card></div>
    <Card className="content-card applications-table-card"><SectionHeading eyebrow="WORK QUEUE" title="Recent applications" description="Latest submissions across the circle" action={<Link className="text-link" to="/officer/applications">Open work queue <ArrowRight size={14} /></Link>} /><Table columns={columns} rows={applications.slice(0, 5)} onRowClick={(row) => navigate(`/officer/applications/${row.id}`)} /></Card>
    <div className="dashboard-grid dashboard-grid-bottom"><Card className="content-card"><SectionHeading eyebrow="SERVICE DELIVERY" title="Application activity" action={<Link className="icon-link" to="/officer/analytics">Analytics</Link>} /><div className="chart-key"><span><i className="key-blue" />Submitted</span><span><i className="key-green" />Approved</span><Badge tone="neutral">LAST 6 MONTHS</Badge></div><ApplicationsChart /></Card><Card className="content-card"><SectionHeading eyebrow="LAND REGISTRY" title="Parcel distribution" action={<Link className="icon-link" to="/officer/analytics">Details</Link>} /><LandTypeChart /></Card><Card className="content-card"><SectionHeading eyebrow="DEPARTMENT FEED" title="Recent activity" /><div className="department-feed">{activity.map((item) => <div className="feed-item" key={item.title}><span className={`activity-dot dot-${item.tone}`} /><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></div>)}</div><Link className="feed-link" to="/officer/applications">View department activity <ArrowRight size={14} /></Link></Card></div>
    <div className="officer-metric-foot"><span><Building2 size={14} /> DATA SCOPE: KHUNTI DISTRICT</span><span><Activity size={14} /> LAST SYNCHRONIZATION · PROTOTYPE 09:42 AM</span><span><BellRing size={14} /> 6 ITEMS NEED REVIEW</span></div>
  </>;
}
