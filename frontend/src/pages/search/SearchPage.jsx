import { ArrowRight, Crosshair, Filter, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, EmptyState, ErrorState, LoadingState, RiskLabel, SearchField, SectionHeading, StatusBadge } from '../../components/ui';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('query', query.trim());
        const response = await fetch(`/api/v1/parcels${params.size ? `?${params.toString()}` : ''}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Could not load parcel records. Please try again.');

        const payload = await response.json();
        const parcels = Array.isArray(payload) ? payload : payload.data ?? payload.parcels ?? [];
        setResults(Array.isArray(parcels) ? parcels : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError(fetchError.message || 'Could not load parcel records. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);
  return <><div className="page-intro"><div><span className="eyebrow">LAND RECORD LOOKUP</span><h1>Find a land parcel</h1><p>Search verified records using a ULPIN, survey reference, owner or location.</p></div><div className="intro-side-note"><Crosshair size={16} /><span>ULPIN-CENTRIC SEARCH<small>Live records · Jharkhand</small></span></div></div><Card className="search-hero-card"><div className="search-hero-mark"><Search size={22} /></div><div className="search-hero-text"><h2>Search land records</h2><p>Enter a search term and select the information you have.</p></div><div className="search-controls"><div className="search-selector"><SlidersHorizontal size={16} /><select value={field} onChange={(event) => setField(event.target.value)}><option value="all">All fields</option><option value="ulpin">ULPIN</option><option value="surveyNumber">Survey number</option><option value="owner">Owner name</option><option value="location">Location</option></select></div><SearchField value={query} onChange={setQuery} placeholder="Try ULPIN, owner or district" onSubmit={() => {}} /></div><div className="search-hints"><span>POPULAR SEARCHES</span>{['Khunti', 'Agricultural', 'JH-22-1048'].map((term) => <button key={term} onClick={() => setQuery(term)}>{term}</button>)}</div></Card><div className="results-heading"><SectionHeading eyebrow="PARCEL REGISTER" title={loading ? 'Searching parcels…' : `${results.length} matching records`} description="Select a record to view its land intelligence profile." /><button className="filter-button"><Filter size={15} /> Filters <span>0</span></button></div>{loading ? <LoadingState label="Searching parcels…" /> : error ? <ErrorState message={error} /> : results.length === 0 ? <EmptyState title="No results found" description="Try another ULPIN, owner or location." /> : <div className="search-results">{results.map((parcel) => <button className="search-result" key={parcel.ulpin} onClick={() => navigate(`/land/${parcel.ulpin}`)}><div className="result-map-thumb"><span /><MapPin size={17} /></div><div className="result-main"><div className="result-id-row"><strong>{parcel.ulpin}</strong><StatusBadge status={parcel.status} /></div><span className="result-owner">{parcel.owner}</span><span className="result-location"><MapPin size={13} />{parcel.location} <i /> Survey {parcel.surveyNumber}</span></div><div className="result-meta"><span>AREA<strong>{parcel.area} acres</strong></span><span>LAND TYPE<strong>{parcel.landType}</strong></span><span>RISK LEVEL<RiskLabel value={parcel.risk} /></span></div><span className="result-open"><ArrowRight size={17} /></span></button>)}</div>}<div className="prototype-data-note">Showing verified real-time parcel records from the government database.</div></>;
}
