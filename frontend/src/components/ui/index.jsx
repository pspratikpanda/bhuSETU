import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleAlert, FileText, MapPin, MoreHorizontal, Search, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export function Brand({ compact = false }) {
  return <a className={`brand ${compact ? 'brand-compact' : ''}`} href="/citizen/dashboard" aria-label="Bhu Setu home"><span className="brand-mark"><MapPin size={19} strokeWidth={2.2} /></span><span><strong>Bhu Setu</strong><small>LAND GOVERNANCE PLATFORM</small></span></a>;
}

export function Button({ children, variant = 'primary', size = '', icon: Icon, className = '', ...props }) {
  return <button className={`button button-${variant} ${size ? `button-${size}` : ''} ${className}`} {...props}>{Icon && <Icon size={16} />}{children}</button>;
}

export function Card({ children, className = '', ...props }) { return <section className={`card ${className}`} {...props}>{children}</section>; }

export function Badge({ children, tone = 'neutral' }) { return <span className={`badge badge-${tone}`}>{children}</span>; }

export function StatusBadge({ status }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes('approved') || normalized.includes('verified') || normalized.includes('resolved') ? 'green' : normalized.includes('high') || normalized.includes('reject') || normalized.includes('disput') || normalized.includes('review') && normalized.includes('needs') ? 'red' : normalized.includes('pending') || normalized.includes('review') || normalized.includes('additional') || normalized.includes('progress') ? 'amber' : 'blue';
  return <Badge tone={tone}><span className="status-dot" />{status}</Badge>;
}

export function RiskIndicator({ value, label = 'Risk score', compact = false }) {
  const tone = value >= 65 ? 'red' : value >= 40 ? 'amber' : 'green';
  return <div className={`risk-indicator ${compact ? 'risk-compact' : ''}`}><span className={`risk-ring risk-${tone}`} style={{ '--risk': `${value * 3.6}deg` }}><span>{value}</span></span><span className="risk-copy"><small>{label}</small><strong className={`text-${tone}`}>{value >= 65 ? 'Elevated' : value >= 40 ? 'Moderate' : 'Low'}</strong></span></div>;
}

export function StatCard({ label, value, detail, icon: Icon, trend, tone = 'blue' }) {
  return <Card className="stat-card"><div className={`stat-icon stat-${tone}`}>{Icon && <Icon size={19} />}</div><span className="stat-menu"><MoreHorizontal size={18} /></span><p>{label}</p><div className="stat-value">{value}</div><div className="stat-foot">{trend && <span className={`trend ${trend.startsWith('-') ? 'trend-down' : ''}`}>{trend.startsWith('-') ? <ArrowDown size={13} /> : <ArrowUp size={13} />}{trend}</span>}<span>{detail}</span></div></Card>;
}

export function SectionHeading({ eyebrow, title, description, action, icon: Icon }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{Icon && <Icon size={21} />}{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function Table({ columns, rows, onRowClick }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.ulpin || row.name || index} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'row-clickable' : ''}>{columns.map((col) => <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <EmptyState title="No records found" description="Try changing your search or filters." />}</div>;
}

export function SearchField({ value, onChange, placeholder = 'Search records', onSubmit, className = '' }) {
  return <form className={`search-field ${className}`} onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}><Search size={17} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /><button type="submit" aria-label="Search"><ChevronRight size={17} /></button></form>;
}

export function EmptyState({ title, description }) { return <div className="empty-state"><span><FileText size={20} /></span><strong>{title}</strong><p>{description}</p></div>; }
export function LoadingState({ label = 'Loading records…' }) { return <div className="loading-state"><span className="spinner" />{label}</div>; }
export function ErrorState({ message = 'We could not load this information right now.' }) { return <div className="error-state"><CircleAlert size={18} />{message}</div>; }

export function SelectField({ label, value, onChange, options, ...props }) {
  return <label className="form-field"><span>{label}</span><div className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)} {...props}>{options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}</select><ChevronDown size={15} /></div></label>;
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-title"><h3 id="modal-title">{title}</h3><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>{children}</section></div>;
}

export function Toast({ message, onClose }) {
  const [visible] = useState(true);
  if (!visible || !message) return null;
  return <div className="toast"><Check size={17} />{message}<button onClick={onClose} aria-label="Dismiss"><X size={15} /></button></div>;
}

export function RiskLabel({ value }) { return <span className={`risk-label risk-label-${value.toLowerCase()}`}><ShieldAlert size={13} />{value}</span>; }
export const ChevronAction = ({ children }) => <span className="chevron-action">{children}<ArrowUpRight size={16} /></span>;
