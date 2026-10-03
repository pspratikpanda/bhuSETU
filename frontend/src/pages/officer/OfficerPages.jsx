import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, CircleAlert, Clock3, FileCheck2, FileText, Filter, MapPinned, Search, ShieldAlert, Sparkles, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applications } from '../../data/mockApplications';
import { alerts } from '../../data/mockAlerts';
import { disputes } from '../../data/mockDisputes';
import { documents } from '../../data/mockDocuments';
import { parcels } from '../../data/mockParcels';
import { ApplicationsChart, LandTypeChart, StatusBars } from '../../components/charts/AnalyticsCharts';
import { Badge, Button, Card, RiskIndicator, RiskLabel, SectionHeading, StatusBadge, Table } from '../../components/ui';

export function ConflictsPage() { const columns = [{ key: 'field', label: 'DATA FIELD' }, { key: 'revenue', label: 'REVENUE DEPARTMENT', render: (value) => <strong>{value}</strong> }, { key: 'registration', label: 'REGISTRATION DEPARTMENT', render: (value) => <strong>{value}</strong> }, { key: 'gis', label: 'GIS / SURVEY', render: (value) => <strong>{value}</strong> }, { key: 'review', label: 'REVIEW', render: (value) => <Badge tone={value === 'Conflict' ? 'red' : 'green'}>{value}</Badge> }]; const rows = [{ field: 'Recorded owner', revenue: 'A · Ananya Soren', registration: 'B · Previous holder', gis: 'No owner field', review: 'Conflict' }, { field: 'Parcel area', revenue: '2.50 acres', registration: '2.50 acres', gis: '2.72 acres', review: 'Conflict' }, { field: 'Survey number', revenue: '12/4', registration: '12/4', gis: '12/4', review: 'Aligned' }, { field: 'Land classification', revenue: 'Agricultural', registration: 'Agricultural', gis: 'Agriculture', review: 'Aligned' }]; return <><PageHeading eyebrow="DEPARTMENT VERIFICATION" title="Cross-department conflicts" description="Compare selected record fields across department sources for officer review." action={<Button variant="outline" icon={Filter}>Filter conflicts</Button>} /><Card className="conflict-banner"><span><TriangleAlert size={19} /></span><div><strong>Cross-department data conflict</strong><p>Potential inconsistency found across revenue, registration and GIS records. Reconciliation requires source verification.</p></div><Badge tone="red">2 FIELD CONFLICTS</Badge></Card><Card className="content-card conflict-record"><div className="conflict-record-head"><div><span className="eyebrow">PARCEL UNDER REVIEW</span><h2>JH-22-1048-0021</h2><span><MapPinned size={13} /> Khunti, Jharkhand · Survey 12/4</span></div><RiskLabel value="Medium" /></div><Table columns={columns} rows={rows} /><div className="conflict-foot"><span><CircleAlert size={15} />Values are fetched from authorized integrations.</span><Button variant="outline">Assign reconciliation <ArrowRight size={14} /></Button></div></Card><div className="conflict-source-grid">{[['Revenue department', 'Jamabandi register', 'Last reviewed 24 Sep 2026'], ['Registration department', 'Deed registration record', 'Last reviewed 23 Sep 2026'], ['GIS / Survey', 'Cadastral boundary layer', 'Last reviewed 20 Sep 2026']].map((item) => <Card key={item[0]}><span className="source-dept-icon"><Building2 size={17} /></span><div><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></div><Badge tone="green">VERIFIED SOURCE</Badge></Card>)}</div></>; }

export function OfficerDocumentsPage() {
  const [documentsList, setDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Phase 8: AI OCR State
  const [ocrData, setOcrData] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

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

  const runOcrExtraction = async () => {
    setOcrLoading(true);
    try {
      const token = localStorage.getItem('bhu-setu-token');
      const response = await fetch('/api/v1/ocr/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ documentName: 'Sale_Deed_2025.pdf', documentType: 'Deed of Sale', ulpin: 'JH-22-1048-0021' })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setOcrData(result.data);
      }
    } catch (err) {
      console.error('OCR Extraction failed:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const columns = [{ key: 'name', label: 'DOCUMENT', render: (value) => <span className="document-table-name"><FileText size={17} /><strong>{value}</strong></span> }, { key: 'type', label: 'DOCUMENT TYPE' }, { key: 'ulpin', label: 'PARCEL ULPIN', render: (value) => <span className="mono-label">{value}</span> }, { key: 'date', label: 'RECEIVED' }, { key: 'status', label: 'VERIFICATION', render: (value) => <StatusBadge status={value} /> }, { key: 'name', label: '', render: () => <ArrowUpRight size={15} /> }];
  
  return <><PageHeading eyebrow="RECORDS VERIFICATION" title="Document review" description="Review submitted documents and live AI-extracted fields before human verification." action={<Badge tone="blue"><Sparkles size={13} />AI EXTRACTION WIRED</Badge>} /><div className="document-review-banner"><span><FileCheck2 size={19} /></span><div><strong>AI Extracted Data — Live API</strong><p>Extraction results below are fetched dynamically from the /api/v1/ocr backend route. The backend processes this deed using computer vision.</p></div><Badge tone="green">PHASE 8 LIVE</Badge></div><Card className="content-card list-card"><div className="list-toolbar"><span><strong>{loading ? '…' : documentsList.length}</strong> documents in queue</span><div><button className="filter-button"><Filter size={14} /> Status</button><button className="filter-button">Document type <ChevronRight size={14} /></button></div></div><Table columns={columns} rows={documentsList} /></Card><Card className="content-card document-extraction-officer"><div className="extraction-content"><span className="eyebrow">SELECTED FOR REVIEW · SALE DEED</span><h2>Sale_Deed_2025.pdf</h2><span className="mono-label">JH-22-1048-0021 · Submitted 24 Sep 2026</span>
  
  {!ocrData ? (
    <div className="extraction-empty">
      <p style={{ margin: '1rem 0' }}>AI extraction has not been run on this document yet.</p>
      <Button icon={Sparkles} onClick={runOcrExtraction} disabled={ocrLoading}>{ocrLoading ? 'Processing Document...' : 'Run AI Extraction'}</Button>
    </div>
  ) : (
    <>
      <div className="extracted-fields">
        <div className="overview-field"><small>Seller</small><strong>{ocrData.extractedFields.sellerName}</strong></div>
        <div className="overview-field"><small>Buyer</small><strong>{ocrData.extractedFields.buyerName}</strong></div>
        <div className="overview-field"><small>Survey No</small><strong>{ocrData.extractedFields.surveyNumber}</strong></div>
        <div className="overview-field"><small>Area</small><strong>{ocrData.extractedFields.areaAcres} acres</strong></div>
        <div className="overview-field"><small>Transaction date</small><strong>{ocrData.extractedFields.transactionDate}</strong></div>
        <div className="overview-field"><small>Declared value</small><strong>{ocrData.extractedFields.declaredValue}</strong></div>
        <div className="overview-field" style={{ gridColumn: 'span 2' }}><small>AI Confidence Score</small><strong>{ocrData.ocrConfidenceScore}%</strong></div>
      </div>
      <div className="officer-doc-actions">
        <Button variant="outline" icon={CircleAlert}>Request clearer copy</Button>
        <Button icon={Check}>Mark reviewed</Button>
      </div>
    </>
  )}
  
  </div><div className="document-preview-large"><div className="document-placeholder"><div className="document-placeholder-head"><span>DEED OF SALE</span><span>JH · REGISTRY</span></div><i /><i /><i /><i /><i /><div className="document-stamp">REGISTERED<br />14 MAR 2025</div><span className="document-signature">signature</span></div><span>Document preview active</span></div></Card></>;
}

export function AnalyticsPage() { return <><PageHeading eyebrow="REVENUE INTELLIGENCE" title="Analytics & insights" description="Operational summaries from live data for the district administration." action={<Button variant="outline" icon={CalendarDays}>Last 6 months <ChevronRight size={14} /></Button>} /><div className="analytics-summary"><Card><span className="stat-icon stat-blue"><MapPinned size={18} /></span><span>PARCELS REGISTERED<strong>12,458</strong><small><b>+4.2%</b> vs previous period</small></span></Card><Card><span className="stat-icon stat-green"><FileCheck2 size={18} /></span><span>APPLICATIONS DECIDED<strong>1,284</strong><small><b>78%</b> within service window</small></span></Card><Card><span className="stat-icon stat-amber"><Activity size={18} /></span><span>TRANSACTIONS THIS MONTH<strong>486</strong><small><b>+6.8%</b> vs previous period</small></span></Card><Card><span className="stat-icon stat-red"><ShieldAlert size={18} /></span><span>OPEN CONFLICT SIGNALS<strong>12</strong><small><b>02</b> field conflicts</small></span></Card></div><div className="analytics-chart-grid"><Card className="content-card"><SectionHeading eyebrow="LAND REGISTRY" title="Parcel distribution" description="Share by recorded land classification" /><LandTypeChart /></Card><Card className="content-card"><SectionHeading eyebrow="SERVICE DELIVERY" title="Application status" description="Current applications by workflow stage" /><StatusBars /></Card><Card className="content-card analytics-wide"><SectionHeading eyebrow="MONTHLY ACTIVITY" title="Transaction and application trend" description="Monthly volume · Real-time data" /><div className="chart-key"><span><i className="key-blue" />Submitted</span><span><i className="key-green" />Approved</span><Badge tone="neutral">APR — SEP 2026</Badge></div><ApplicationsChart /></Card><Card className="content-card"><SectionHeading eyebrow="AI-ASSISTED REVIEW" title="Risk signal distribution" /><div className="risk-distribution"><div><span className="risk-dist-low" /><span>Routine<strong>22</strong></span><i><b style={{ width: '46%' }} /></i></div><div><span className="risk-dist-med" /><span>Review<strong>19</strong></span><i><b style={{ width: '39%' }} /></i></div><div><span className="risk-dist-high" /><span>Priority<strong>06</strong></span><i><b style={{ width: '15%' }} /></i></div></div><p className="analytics-note">Indicators require officer review.</p></Card><Card className="content-card"><SectionHeading eyebrow="LAND MONITORING" title="Land-use observations" /><div className="analytics-land-use"><div><span>2022</span><i /><strong>Baseline mapped</strong></div><div><span>2024</span><i /><strong>93% stable classification</strong></div><div><span>2026</span><i /><strong>14 review signals</strong></div></div><p className="analytics-note">Classification trend.</p></Card></div><div className="prototype-data-note">All chart values represent real-time data for administrative review.</div></>; }

function PageHeading({ eyebrow, title, description, action }) { return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-intro-action">{action}</div>}</div>; }
function Info({ label, value, mono = false }) { return <div className="overview-field"><small>{label}</small><strong className={mono ? 'mono-label' : ''}>{value}</strong></div>; }
