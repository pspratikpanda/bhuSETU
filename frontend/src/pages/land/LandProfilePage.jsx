import { Activity, ArrowDownToLine, ArrowRight, BadgeCheck, Building2, ChevronRight, CircleAlert, FileCheck2, FileText, MapPin, MapPinned, MoreHorizontal, ShieldAlert, ShieldCheck, Sparkles, Trees } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applications } from '../../data/mockApplications';
import { documents } from '../../data/mockDocuments';
import { Badge, Button, Card, RiskIndicator, SectionHeading, StatusBadge, Table } from '../../components/ui';

export default function LandProfilePage() {
  const { ulpin } = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadParcel() {
      setLoading(true);
      setNotFound(false);
      setParcel(null);

      try {
        const response = await fetch(`/api/v1/parcels/${encodeURIComponent(ulpin)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Parcel not found');

        const payload = await response.json();
        const record = payload.data || payload;
        if (payload.success === false || !record || !record.ulpin) throw new Error('Parcel not found');
        setParcel(record);
      } catch (error) {
        if (error.name !== 'AbortError') setNotFound(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadParcel();
    return () => controller.abort();
  }, [ulpin]);

  if (loading) {
    return <>
      <div className="profile-breadcrumb"><Link to="/search">Land search</Link><ChevronRight size={14} /><span>Land intelligence profile</span></div>
      <div className="parcel-profile-skeleton" role="status" aria-label="Loading parcel profile">
        <span /><span /><span />
      </div>
      <style>{`.parcel-profile-skeleton{display:flex;flex-direction:column;gap:14px;padding:28px;background:#fff;border:1px solid #e5e7eb;border-radius:12px}.parcel-profile-skeleton span{height:18px;border-radius:5px;background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:parcel-skeleton-shimmer 1.2s ease-in-out infinite}.parcel-profile-skeleton span:nth-child(1){width:62%}.parcel-profile-skeleton span:nth-child(2){width:88%}.parcel-profile-skeleton span:nth-child(3){width:46%}@keyframes parcel-skeleton-shimmer{to{background-position:-200% 0}}`}</style>
    </>;
  }

  if (notFound || !parcel) {
    return <>
      <div className="profile-breadcrumb"><Link to="/search">Land search</Link><ChevronRight size={14} /><span>Land intelligence profile</span></div>
      <Card className="content-card"><div className="empty-state"><span><CircleAlert size={20} /></span><strong>Parcel not found</strong><p>We could not find a parcel with that ULPIN.</p><Link className="text-link" to="/search">Return to land search <ArrowRight size={14} /></Link></div></Card>
    </>;
  }

  const related = applications.filter((application) => application.ulpin === parcel.ulpin);
  const parcelDocs = documents.filter((document) => document.ulpin === parcel.ulpin);
  const riskScores = parcel.riskScores || { overall: 0, document: 0, ownership: 0, mutation: 0, transaction: 0, encroachment: 0 };
  const encumbrances = Array.isArray(parcel.encumbrances) ? parcel.encumbrances : [];
  const transactions = [
    { id: 'TX-2025-084', date: '14 Mar 2025', type: 'Sale deed', parties: 'Previous holder → Current owner', value: '₹35,00,000', status: 'Registered' },
    { id: 'TX-2022-031', date: '08 Jun 2022', type: 'Inheritance', parties: 'Family transfer', value: 'Not applicable', status: 'Recorded' },
  ];
  const transactionColumns = [{ key: 'date', label: 'DATE' }, { key: 'type', label: 'TRANSACTION' }, { key: 'parties', label: 'PARTIES' }, { key: 'value', label: 'DECLARED VALUE' }, { key: 'status', label: 'STATUS', render: (value) => <StatusBadge status={value} /> }];
  const ownershipHistory = parcel.ownershipHistory || [];

  return <><div className="profile-breadcrumb"><Link to="/search">Land search</Link><ChevronRight size={14} /><span>Land intelligence profile</span></div><div className="profile-hero"><div className="profile-hero-left"><div className="profile-hero-icon"><MapPinned size={22} /></div><div><span className="eyebrow">LAND INTELLIGENCE PROFILE <span className="sample-record">· PARCEL RECORD</span></span><h1>{parcel.ulpin}</h1><div className="profile-location"><MapPin size={14} />{parcel.location || 'Location unavailable'}<i />Survey No. {parcel.surveyNumber || '—'}</div></div></div><div className="profile-hero-actions"><Button variant="outline" icon={ArrowDownToLine}>Export profile</Button><Button icon={MoreHorizontal}>Actions</Button></div><div className="profile-summary-stats"><div><small>REGISTERED OWNER</small><strong>{parcel.owner || '—'}</strong><span><BadgeCheck size={14} /> Record holder</span></div><div><small>PARCEL AREA</small><strong>{parcel.area ?? '—'} <em>acres</em></strong><span>Survey {parcel.surveyNumber || '—'}</span></div><div><small>LAND CLASSIFICATION</small><strong>{parcel.landType || '—'}</strong><span>{parcel.currentUse || parcel.landType || '—'} · Current use</span></div><div><small>RECORD STATUS</small><strong><StatusBadge status={parcel.status || 'Unknown'} /></strong><span>Parcel record status</span></div></div></div>
    <div className="profile-alert-strip"><span className="alert-strip-icon"><ShieldAlert size={16} /></span><div><strong>AI-assisted risk indicator</strong><span>This prototype score is a review aid only. It is not a legal determination.</span></div><RiskIndicator value={riskScores.overall} compact /><button aria-label="Risk details"><ChevronRight size={17} /></button></div>
    <div className="profile-columns"><div className="profile-main-column"><Card className="content-card"><SectionHeading eyebrow="PARCEL RECORD" title="Overview" action={<StatusBadge status={parcel.status || 'Unknown'} />} /><div className="overview-grid"><Info label="ULPIN" value={parcel.ulpin} mono /><Info label="Current owner" value={parcel.owner || '—'} /><Info label="Survey number" value={parcel.surveyNumber || '—'} /><Info label="Recorded area" value={parcel.area != null ? `${parcel.area} acres` : '—'} /><Info label="Location" value={parcel.location || '—'} /><Info label="Land type" value={parcel.landType || '—'} /><Info label="Status" value={parcel.status || '—'} /><Info label="Encumbrances" value={encumbrances.length ? `${encumbrances.length} recorded` : 'None recorded'} /></div><div className="ror-row"><span className="ror-icon"><FileCheck2 size={17} /></span><div><strong>Encumbrances</strong><small>{encumbrances.length ? encumbrances.map((item) => typeof item === 'string' ? item : item.description || item.type || JSON.stringify(item)).join(' · ') : 'No encumbrances recorded'}</small></div><StatusBadge status={encumbrances.length ? 'Review required' : 'Clear'} /></div></Card>
      <Card className="content-card"><SectionHeading eyebrow="CHAIN OF TITLE" title="Ownership history" description="Recorded ownership changes for this parcel" action={<button className="icon-button"><MoreHorizontal size={17} /></button>} />{ownershipHistory.length ? <div className="ownership-timeline">{ownershipHistory.map((item, index) => <div className={`ownership-item ${index === ownershipHistory.length - 1 ? 'ownership-current' : ''}`} key={item.year || index}><div className="ownership-rail"><span>{index === ownershipHistory.length - 1 ? <BadgeCheck size={14} /> : <span />}</span>{index < ownershipHistory.length - 1 && <i />}</div><div className="ownership-body"><div><strong>{item.owner}</strong>{index === ownershipHistory.length - 1 && <Badge tone="green">CURRENT OWNER</Badge>}</div><span>{item.event}</span></div><time>{item.year}</time></div>)}</div> : <p className="muted-copy">Ownership history is not available for this parcel.</p>}</Card>
      <Card className="content-card"><SectionHeading eyebrow="REGISTERED ACTIVITY" title="Transaction history" action={<button className="text-link">Full history <ArrowRight size={14} /></button>} /><Table columns={transactionColumns} rows={transactions} /></Card>
      <Card className="content-card"><SectionHeading eyebrow="APPLICATION RECORD" title="Mutation history" /><div className="simple-timeline"><div><i className="timeline-green" /><span><strong>Ownership mutation recorded</strong><small>08 Jun 2022 · Application MU-2022-0381 · Completed</small></span><StatusBadge status="Approved" /></div><div><i className="timeline-amber" /><span><strong>Current mutation request</strong><small>24 Sep 2026 · {related[0]?.id || 'No active request'}</small></span><StatusBadge status={related[0]?.status || 'No active application'} /></div></div></Card>
    </div><div className="profile-side-column"><Card className="content-card risk-panel"><SectionHeading eyebrow="PROTOTYPE ANALYSIS" title="Risk indicators" /><div className="risk-panel-score"><RiskIndicator value={riskScores.overall} label="Overall indicator" /><span>Out of 100<br />Review priority: {riskScores.overall >= 65 ? 'Elevated' : riskScores.overall >= 40 ? 'Moderate' : 'Routine'}</span></div><div className="risk-breakdown">{Object.entries({ 'Document consistency': riskScores.document, 'Ownership chain': riskScores.ownership, 'Mutation activity': riskScores.mutation, 'Transaction pattern': riskScores.transaction, 'Encroachment signal': riskScores.encroachment }).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}<small>/100</small></strong><i><b style={{ width: `${value}%` }} /></i></div>)}</div><div className="risk-note"><Sparkles size={15} /> AI-Assisted Risk Indicator — Prototype</div></Card>
      <Card className="content-card"><SectionHeading eyebrow="DOCUMENT REGISTER" title="Documents" action={<Link className="icon-link" to="/citizen/documents">View all</Link>} />{parcelDocs.length ? <div className="document-mini-list">{parcelDocs.map((document) => <div className="document-mini" key={document.name}><span><FileText size={16} /></span><div><strong>{document.type}</strong><small>{document.name}</small></div><StatusBadge status={document.status} /></div>)}</div> : <div className="document-mini"><span><FileText size={16} /></span><div><strong>Sale deed and RoR</strong><small>Records uploaded for verification</small></div></div>}<Link className="document-upload-link" to="/citizen/documents"><span>+ Add a document</span><ArrowRight size={14} /></Link></Card>
      <Card className="content-card"><SectionHeading eyebrow="LAND-USE OBSERVATIONS" title="Land-use analysis" /><div className="land-use-line"><span><Trees size={16} /></span><div><strong>{parcel.landType || 'Land type unavailable'}</strong><small>Parcel classification</small></div><Badge tone="green">RECORDED</Badge></div><div className="land-use-line"><span><Building2 size={16} /></span><div><strong>{parcel.currentUse || parcel.landType || 'Use unavailable'}</strong><small>Current parcel use</small></div><Badge tone="blue">CURRENT</Badge></div><div className="analysis-note"><Activity size={14} /> Land-use observations reflect the parcel record.</div></Card>
      <Card className="content-card"><SectionHeading eyebrow="RELATED SERVICES" title="Applications & history" />{related.length ? related.map((application) => <Link className="related-row" to={`/citizen/applications/${application.id}`} key={application.id}><span><FileText size={16} /></span><div><strong>{application.type} · {application.id}</strong><small>Submitted {application.submitted}</small></div><StatusBadge status={application.status} /></Link>) : <p className="muted-copy">No active applications are linked to this parcel.</p>}<div className="encroachment-status"><CircleAlert size={15} /><span>Encumbrances<small>{encumbrances.length ? `${encumbrances.length} item(s) recorded` : 'None recorded'}</small></span></div></Card></div></div><div className="profile-source-note"><ShieldCheck size={14} /> Parcel details loaded from the land records service.</div></>;
}

function Info({ label, value, mono = false }) { return <div className="overview-field"><small>{label}</small><strong className={mono ? 'mono-label' : ''}>{value}</strong></div>; }
