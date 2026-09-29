import { Check, Circle, Clock3 } from 'lucide-react';

const steps = ['Application submitted', 'Document verification', 'Revenue officer review', 'Final decision'];
export default function ApplicationTimeline({ current = 1 }) {
  return <div className="application-timeline">{steps.map((step, index) => <div className={`timeline-step ${index < current ? 'step-complete' : index === current ? 'step-current' : ''}`} key={step}><span className="timeline-marker">{index < current ? <Check size={13} /> : index === current ? <Clock3 size={13} /> : <Circle size={11} />}</span><div><strong>{step}</strong><small>{index < current ? `Completed · ${24 - index * 2} Sep 2026` : index === current ? 'In progress' : 'Awaiting previous step'}</small></div></div>)}</div>;
}
