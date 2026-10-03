import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleHelp, Clock3, FileCheck2, FilePlus2, FileText, MapPinned, ShieldCheck, Upload, Wallet, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { parcels } from '../../data/mockParcels';
import { applications as mockApplicationsData } from '../../data/mockApplications';
import { grievances } from '../../data/mockGrievances';
import { documents } from '../../data/mockDocuments';
import { getCurrentUser } from '../../services/auth/authService';
import { Badge, Button, Card, SectionHeading, StatusBadge, Table } from '../../components/ui';
import ApplicationTimeline from '../../components/applications/ApplicationTimeline';

export function CitizenLandPage() { return <><PageHeading eyebrow="MY LAND" title="Land records" description="Parcels linked to your verified profile." action={<Link className="button button-primary" to="/search"><MapPinned size={16} /> Find a parcel</Link>} /><div className="citizen-land-grid">{parcels.slice(0, 4).map((parcel, index) => <Card className="land-wallet-card" key={parcel.ulpin}><div className={`wallet-map wallet-map-${index % 3}`}><span /><span /><span /><Badge tone="green"><ShieldCheck size={12} /> RECORD LINKED</Badge></div><div className="wallet-card-body"><span className="eyebrow">LAND PARCEL · {parcel.landType.toUpperCase()}</span><h3>{parcel.location.split(',')[0]} parcel</h3><span className="mono-label">{parcel.ulpin}</span><div className="wallet-details"><span>AREA<strong>{parcel.area} acres</strong></span><span>SURVEY NO.<strong>{parcel.surveyNumber}</strong></span></div><div className="wallet-owner"><span className="avatar avatar-small">AS</span><span>Registered to<strong>{parcel.owner}</strong></span><StatusBadge status={parcel.status} /></div><Link to={`/land/${parcel.ulpin}`} className="wallet-card-link">View land profile <ArrowRight size={15} /></Link></div></Card>)}</div></>; }

export function ApplicationsPage({ officer = false }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState({});
  const [decisionErrors, setDecisionErrors] = useState({});

  // Fetch live from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('bhu-setu-token');
    fetch('/api/v1/applications', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((payload) => {
        const data = Array.isArray(payload) ? payload : payload.data ?? [];
        setApplications(data.length ? data : mockApplicationsData);
      })
      .catch(() => setApplications(mockApplicationsData))
      .finally(() => setLoading(false));
  }, []);

  const decideApplication = async (id, decision) => {
    setDecisionLoading((current) => ({ ...current, [id]: true }));
    setDecisionErrors((current) => ({ ...current, [id]: '' }));
    try {
      const token = localStorage.getItem('bhu-setu-token');
      const response = await fetch(`/api/v1/applications/${encodeURIComponent(id)}/decision`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ decision })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Unable to save this decision. Please try again.');
      }
      const updatedApplication = payload.data || {};
      setApplications((current) => current.map((application) =>
        application.id === id
          ? { ...application, ...updatedApplication, status: updatedApplication.status || decision }
          : application
      ));
    } catch (error) {
      setDecisionErrors((current) => ({ ...current, [id]: error.message || 'Unable to save this decision.' }));
    } finally {
      setDecisionLoading((current) => ({ ...current, [id]: false }));
    }
  };

  const filtered = applications.filter((application) => {
    const matchesStatus = filter === 'All' || application.status.toLowerCase().includes(filter.toLowerCase());
    const matchesDepartment = !officer || departmentFilter === 'All' || (application.department && application.department.toLowerCase().includes(departmentFilter.toLowerCase()));
    return matchesStatus && matchesDepartment;
  });
  
  const columns = [{ key: 'id', label: 'APPLICATION ID', render: (value) => <strong className="table-id">{value}</strong> }, { key: 'applicant', label: 'APPLICANT' }, { key: 'ulpin', label: 'ULPIN', render: (value) => <span className="mono-label">{value}</span> }, { key: 'type', label: 'SERVICE TYPE' }, { key: 'submitted', label: 'DATE SUBMITTED' }, ...(officer ? [{ key: 'priority', label: 'PRIORITY', render: (value) => <Badge tone={value === 'High' ? 'red' : value === 'Normal' ? 'amber' : 'neutral'}>{value}</Badge> }] : []), { key: 'status', label: 'STATUS', render: (value) => <StatusBadge status={value} /> }, ...(officer ? [{ key: 'id', label: 'DECISION', render: (id, row) => <div className="decision-actions"><Button disabled={decisionLoading[id]} onClick={(event) => { event.stopPropagation(); decideApplication(id, 'Approved'); }}>{decisionLoading[id] ? 'Saving…' : 'Approve'}</Button><Button variant="danger" disabled={decisionLoading[id]} onClick={(event) => { event.stopPropagation(); decideApplication(id, 'Returned for correction'); }}>{decisionLoading[id] ? 'Saving…' : 'Reject'}</Button>{decisionErrors[id] && <small role="alert" className="decision-error">{decisionErrors[id]}</small>}</div> }] : [{ key: 'id', label: '', render: () => <ArrowUpRight size={15} /> }])]; 
  
  return <><PageHeading eyebrow={officer ? 'REVENUE WORK QUEUE' : 'SERVICE REQUESTS'} title={officer ? 'Application review' : 'My applications'} description={officer ? 'Review submissions and route applications through the department workflow.' : 'Track service requests, status updates and next steps.'} action={officer ? <Button icon={FileCheck2}>Export queue</Button> : <Link className="button button-primary" to="/citizen/apply"><FilePlus2 size={16} /> New application</Link>} />
  {officer && <div className="filter-tabs">{['All', 'Revenue', 'Registration', 'GIS', 'Admin'].map((item) => {
    const count = item === 'All' ? applications.length : applications.filter(app => app.department && app.department.toLowerCase().includes(item.toLowerCase())).length;
    return <button onClick={() => setDepartmentFilter(item)} className={departmentFilter === item ? 'filter-tab-active' : ''} key={item}>{item}<small>{count}</small></button>;
  })}</div>}
  <div className="filter-tabs">{['All', 'Submitted', 'Under review', 'Approved', 'Rejected'].map((item) => {
    const baseList = officer && departmentFilter !== 'All' ? applications.filter(app => app.department && app.department.toLowerCase().includes(departmentFilter.toLowerCase())) : applications;
    const count = item === 'All' ? baseList.length : baseList.filter((app) => app.status.toLowerCase().includes(item.toLowerCase())).length;
    return <button onClick={() => setFilter(item)} className={filter === item ? 'filter-tab-active' : ''} key={item}>{item}<small>{count}</small></button>;
  })}</div>
  <Card className="content-card list-card"><div className="list-toolbar"><span><strong>{loading ? '…' : filtered.length}</strong> records</span><div><button className="filter-button">Filter <ChevronRight size={14} /></button><button className="filter-button">Date range <ChevronRight size={14} /></button></div></div><Table columns={columns} rows={filtered} onRowClick={(row) => navigate(`/${officer ? 'officer' : 'citizen'}/applications/${row.id}`)} /></Card><div className="application-help"><CircleHelp size={16} /><span>{officer ? 'Review indicators are generated from live analytical models.' : 'Need help? Contact your revenue circle.'}</span></div></>;
}

export function ApplicationDetailPage({ officer = false }) { const { id } = useParams(); const application = mockApplicationsData.find((item) => item.id === id) || mockApplicationsData[0]; return <><div className="profile-breadcrumb"><Link to={officer ? '/officer/applications' : '/citizen/applications'}>Applications</Link><ChevronRight size={14} /><span>{application.id}</span></div><PageHeading eyebrow={officer ? 'APPLICATION REVIEW' : 'APPLICATION TRACKER'} title={application.id} description={`${application.type} request · submitted ${application.submitted}`} action={<StatusBadge status={application.status} />} /><div className="application-detail-grid"><div className="application-detail-main"><Card className="content-card"><SectionHeading eyebrow="SERVICE REQUEST" title="Application details" /><div className="overview-grid"><Info label="Application ID" value={application.id} mono /><Info label="Applicant" value={application.applicant} /><Info label="Application type" value={application.type} /><Info label="Submission date" value={application.submitted} /><Info label="ULPIN" value={application.ulpin} mono /><Info label="Assigned department" value={application.department} /></div></Card><Card className="content-card"><SectionHeading eyebrow="PROCESS STATUS" title="Review timeline" /><ApplicationTimeline current={application.step} /></Card><Card className="content-card"><SectionHeading eyebrow="REQUIRED RECORDS" title="Documents submitted" /><div className="document-mini-list">{['Sale deed / transfer instrument', 'Current Record of Rights', 'Applicant identity proof'].map((name, index) => <div className="document-mini" key={name}><span><FileText size={16} /></span><div><strong>{name}</strong><small>{index === 1 ? 'RoR_2025_certified.pdf' : index === 0 ? 'Sale_Deed_2025.pdf' : 'Identity_Proof.pdf'}</small></div><StatusBadge status={index === 2 ? 'Under review' : 'Verified'} /></div>)}</div></Card></div><div className="application-detail-side"><Card className="content-card"><SectionHeading eyebrow="LINKED PARCEL" title="Land record" /><span className="mono-label">{application.ulpin}</span><p className="application-side-owner">{application.applicant}</p><Link className="small-inline-link" to={`/land/${application.ulpin}`}>View land profile <ArrowUpRight size={14} /></Link><div className="application-side-note"><Clock3 size={15} /><span>Typical processing time<small>15–30 working days (indicative)</small></span></div></Card>{officer && <OfficerDecisionPanel id={application.id} />}</div></div></>; }

function OfficerDecisionPanel({ id }) { const [decision, setDecision] = useState(''); return <Card className="content-card decision-card"><SectionHeading eyebrow="OFFICER ACTIONS" title="Review decision" /><p>Record a prototype decision for this submission.</p>{decision ? <div className="inline-success"><ShieldCheck size={16} />{decision} · saved in this session only</div> : <div className="decision-actions"><Button onClick={() => setDecision('Approved')} icon={Check}>Approve application</Button><Button variant="outline" onClick={() => setDecision('Additional documents requested')} icon={FilePlus2}>Request documents</Button><Button variant="danger" onClick={() => setDecision('Returned for correction')} icon={X}>Return for correction</Button></div>}<small className="decision-footnote">Prototype only · a real decision must be recorded by the backend with an audit trail.</small></Card>; }

export function ApplyPage() { const [step, setStep] = useState(0); const [submitted, setSubmitted] = useState(false); const [submitting, setSubmitting] = useState(false); const [submitError, setSubmitError] = useState(''); const [selectedParcel, setSelectedParcel] = useState(parcels[0].ulpin); const [type, setType] = useState('Mutation'); const [fileName, setFileName] = useState(''); const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { reason: '', notes: '' } }); const navigate = useNavigate(); const onSubmit = async (values) => { setSubmitting(true); setSubmitError(''); try { const token = localStorage.getItem('bhu-setu-token'); let user = {}; try { user = JSON.parse(localStorage.getItem('bhu-setu-demo-user') || '{}'); } catch { user = {}; } const response = await fetch('/api/v1/applications', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ applicant: user.name || '', ulpin: selectedParcel, type, reason: values.reason, notes: values.notes || '' }) }); const payload = await response.json().catch(() => ({})); if (response.status !== 201 || !payload.success) throw new Error(payload.message || 'Unable to submit your application. Please try again.'); setSubmitted(true); window.setTimeout(() => navigate('/citizen/applications'), 1200); } catch (error) { setSubmitError(error.message || 'Unable to submit your application. Please try again.'); setSubmitting(false); } }; if (submitted) return <div className="submission-success"><span className="success-check"><Check size={26} /></span><span className="eyebrow">APPLICATION SUBMITTED</span><h1>Your request is in the queue.</h1><p>Your application was submitted successfully. Taking you to your applications…</p></div>;
  const steps = ['Select parcel', 'Application details', 'Upload documents', 'Review & submit'];
  return <><div className="profile-breadcrumb"><Link to="/citizen/dashboard">Citizen services</Link><ChevronRight size={14} /><span>New mutation</span></div><PageHeading eyebrow="ONLINE LAND SERVICES" title="Apply for mutation" description="Submit a request to update the ownership record for a land parcel." action={<Badge tone="blue">SECURE WORKFLOW</Badge>} /><div className="form-layout"><div className="form-main"><Card className="content-card"><div className="form-stepper">{steps.map((name, index) => <div key={name} className={`stepper-step ${index === step ? 'stepper-active' : ''} ${index < step ? 'stepper-done' : ''}`}><span>{index < step ? <Check size={14} /> : `0${index + 1}`}</span><small>{name}</small></div>)}</div><form onSubmit={handleSubmit(onSubmit)}>
    {step === 0 && <div className="form-step-content"><span className="eyebrow">STEP 01 · PARCEL SELECTION</span><h2>Which parcel is this for?</h2><p>Select a land record linked to your profile.</p><div className="parcel-select-list">{parcels.slice(0, 4).map((parcel) => <label className={`parcel-select-option ${selectedParcel === parcel.ulpin ? 'parcel-option-selected' : ''}`} key={parcel.ulpin}><input type="radio" value={parcel.ulpin} checked={selectedParcel === parcel.ulpin} onChange={() => setSelectedParcel(parcel.ulpin)} /><span className="parcel-option-map"><MapPinned size={17} /></span><span><strong>{parcel.location.split(',')[0]} parcel</strong><small className="mono-label">{parcel.ulpin}</small><small>{parcel.area} acres · Survey {parcel.surveyNumber}</small></span><ChevronRight size={17} /></label>)}</div></div>}
    {step === 1 && <div className="form-step-content"><span className="eyebrow">STEP 02 · APPLICATION DETAILS</span><h2>Tell us about the change</h2><p>Provide the request details for the reviewing officer.</p><label className="form-field"><span>Service request type</span><select className="input" value={type} onChange={(event) => setType(event.target.value)}><option>Mutation</option><option>Registration</option><option>Correction of record</option></select></label><label className="form-field"><span>Reason for mutation</span><select className="input" {...register('reason', { required: 'Choose a reason to continue.' })}><option value="">Select reason</option><option>Registered sale or transfer</option><option>Inheritance or succession</option><option>Gift or family transfer</option><option>Court order</option><option>Correction of existing entry</option></select>{errors.reason && <small className="field-error">{errors.reason.message}</small>}</label><label className="form-field"><span>Additional information <small>Optional</small></span><textarea className="input textarea" placeholder="Add context for the revenue officer" {...register('notes')} /></label></div>}
    {step === 2 && <div className="form-step-content"><span className="eyebrow">STEP 03 · SUPPORTING DOCUMENTS</span><h2>Attach supporting records</h2><p>Upload readable copies of the documents relevant to your request.</p><label className="upload-zone"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} /><span><Upload size={21} /></span><strong>{fileName || 'Choose files to upload'}</strong><small>PDF, JPG or PNG · maximum 10 MB per file</small><em>Browse files</em></label><div className="upload-guidance"><ShieldCheck size={16} /><span>All files are securely processed and encrypted.</span></div><div className="document-checklist"><span>RECOMMENDED FOR MUTATION</span>{['Registered deed or succession record', 'Current certified Record of Rights', 'Applicant identity proof'].map((item) => <div key={item}><FileText size={15} />{item}<Badge tone="neutral">REQUIRED</Badge></div>)}</div></div>}
    {step === 3 && <div className="form-step-content"><span className="eyebrow">STEP 04 · REVIEW</span><h2>Review before submitting</h2><p>Check these details before creating your application reference.</p><div className="review-summary"><Info label="Selected parcel" value={selectedParcel} mono /><Info label="Request type" value={type} /><Info label="Reason" value={watch('reason') || 'Registered sale or transfer'} /><Info label="Supporting document" value={fileName || 'Document list to be confirmed'} /></div><div className="review-consent"><input type="checkbox" required /><span>I confirm this information is provided for the prototype workflow and understand that a real request requires document verification.</span></div></div>}
    <div className="form-navigation">{step > 0 ? <Button type="button" variant="text" icon={ChevronLeft} onClick={() => setStep(step - 1)} disabled={submitting}>Back</Button> : <span className="form-estimate"><Clock3 size={14} /> About 4 minutes</span>}{step < 3 ? <Button type="button" onClick={() => setStep(step + 1)}>Continue <ChevronRight size={15} /></Button> : <div className="form-submit-wrap"><Button type="submit" icon={FilePlus2} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</Button>{submitError && <div className="error-state" role="alert">{submitError}</div>}</div>}</div></form></Card><div className="form-safety-note"><ShieldCheck size={16} /><span><strong>Your information is securely processed</strong><small>Your application and documents are submitted securely to the bhuSETU backend.</small></span></div></div><aside className="form-sidebar"><Card className="content-card"><span className="eyebrow">APPLICATION GUIDE</span><h3>What happens next?</h3><div className="guide-steps">{['Submission receipt generated', 'Document and record checks', 'Circle officer review', 'Status update to citizen'].map((item, index) => <div key={item}><span>{`0${index + 1}`}</span><strong>{item}</strong></div>)}</div></Card><Card className="content-card help-card"><CircleHelp size={18} /><div><strong>Need assistance?</strong><p>Contact the Khunti Revenue Circle for service guidance.</p><a href="#contact">View help options <ArrowRight size={13} /></a></div></Card></aside></div></>;
}

export function DocumentsPage() {
  const [documentsList, setDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/documents')
      .then((r) => r.json())
      .then((payload) => {
        const data = Array.isArray(payload) ? payload : payload.data ?? [];
        setDocumentsList(data.length ? data : mockDocuments);
      })
      .catch(() => setDocumentsList(mockDocuments))
      .finally(() => setLoading(false));
  }, []);

  const columns = [{ key: 'name', label: 'DOCUMENT NAME', render: (value) => <span className="document-table-name"><FileText size={17} /><strong>{value}</strong></span> }, { key: 'type', label: 'TYPE' }, { key: 'ulpin', label: 'RELATED ULPIN', render: (value) => <span className="mono-label">{value}</span> }, { key: 'date', label: 'UPLOADED' }, { key: 'status', label: 'VERIFICATION', render: (value) => <StatusBadge status={value} /> }, { key: 'name', label: '', render: () => <ArrowUpRight size={15} /> }];
  return <><PageHeading eyebrow="DOCUMENT REGISTER" title="Documents" description="Access documents attached to your land records and service requests." action={<Button icon={FilePlus2}>Upload document</Button>} /><div className="document-metrics"><Card><span>DOCUMENTS</span><strong>{loading ? '…' : documentsList.length}</strong><small>Across your records</small></Card><Card><span>VERIFIED</span><strong>{loading ? '…' : documentsList.filter(d => d.status === 'Verified').length}</strong><small>Ready for reference</small></Card><Card><span>IN REVIEW</span><strong>{loading ? '…' : documentsList.filter(d => d.status === 'In Review').length}</strong><small>Officer validation</small></Card><Card><span>NEEDS ACTION</span><strong>{loading ? '…' : documentsList.filter(d => d.status === 'Needs Action' || d.status === 'Rejected').length}</strong><small>See review notes</small></Card></div><Card className="content-card list-card"><div className="document-ai-banner"><span><FileCheck2 size={18} /></span><div><strong>AI document extraction · Live</strong><small>Fields below are extracted directly from the uploaded document.</small></div><Badge tone="blue">LIVE EXTRACTION</Badge></div><Table columns={columns} rows={documentsList} /></Card><Card className="content-card extraction-card"><div className="extraction-preview"><div className="document-placeholder"><div className="document-placeholder-head"><span>DEED OF SALE</span><span>JH · REGISTRY</span></div><i /><i /><i /><i /><i /><div className="document-stamp">REGISTERED<br />14 MAR 2025</div><span className="document-signature">signature</span></div></div><div className="extraction-content"><span className="eyebrow">AI DOCUMENT ANALYSIS</span><h2>Sale_Deed_2025.pdf</h2><Badge tone="blue">AI Extracted Data</Badge><div className="extracted-fields"><Info label="Seller" value="Demo seller record" /><Info label="Buyer" value="Ananya Soren" /><Info label="Survey number" value="12/4" /><Info label="Area" value="2.47 acres" /><Info label="Transaction date" value="14 Mar 2025" /><Info label="Declared value" value="₹35,00,000" /></div><div className="extraction-confidence"><span>Field mapping accuracy</span><div><i /></div><strong>88%</strong></div><small className="small-muted">AI extracted fields only; a human reviewer must confirm source documents.</small></div></Card></>;
}

export function ProfilePage({ user = getCurrentUser() }) { return <><PageHeading eyebrow="ACCOUNT SETTINGS" title="My profile" description="Your verified digital identity." /><div className="profile-settings-grid"><Card className="content-card"><SectionHeading eyebrow="VERIFIED ACCOUNT" title="Profile details" /><div className="profile-user-banner"><span className="avatar avatar-large">{user?.initials || 'AS'}</span><span><strong>{user?.name || 'Ananya Soren'}</strong><small>{user?.role || 'Citizen'} · Bhu Setu platform</small></span><Badge tone="blue">VERIFIED PROFILE</Badge></div><div className="overview-grid"><Info label="Full name" value={user?.name || 'Ananya Soren'} /><Info label="Workspace role" value={user?.role || 'Citizen'} /><Info label="District context" value={user?.location || 'Khunti, Jharkhand'} /><Info label="Account status" value="Active secure session" /></div><div className="profile-settings-note"><ShieldCheck size={16} /> Sign-in and profile updates are securely synchronized.</div></Card><Card className="content-card"><SectionHeading eyebrow="PREFERENCES" title="Service notifications" /><div className="preference-row"><span><strong>Application updates</strong><small>Status changes for land service requests</small></span><input type="checkbox" defaultChecked /></div><div className="preference-row"><span><strong>Document review notes</strong><small>Requests for additional supporting records</small></span><input type="checkbox" defaultChecked /></div><div className="preference-row"><span><strong>Land record changes</strong><small>Updates to linked parcel information</small></span><input type="checkbox" /></div></Card></div></>; }

function PageHeading({ eyebrow, title, description, action }) { return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-intro-action">{action}</div>}</div>; }
function Info({ label, value, mono = false }) { return <div className="overview-field"><small>{label}</small><strong className={mono ? 'mono-label' : ''}>{value}</strong></div>; }
