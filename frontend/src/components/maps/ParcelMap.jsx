import { useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { parcelGeoJSON } from '../../data/mockParcels';
import { Button } from '../ui';
import 'leaflet/dist/leaflet.css';

const statusColors = { normal: '#3d9873', pending: '#d59a3b', 'high-risk': '#c95c57', disputed: '#8269b6' };

export default function ParcelMap({ full = false, visibleLayers = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Government'] }) {
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState({ normal: true, pending: true, 'high-risk': true, disputed: true });
  const navigate = useNavigate();
  const collection = useMemo(() => ({ ...parcelGeoJSON, features: parcelGeoJSON.features.filter((feature) => visible[feature.properties.state] && visibleLayers.includes(feature.properties.landType)) }), [visible, visibleLayers]);
  const style = (feature) => ({ color: feature.properties.ulpin === selected?.ulpin ? '#163650' : '#fff', weight: feature.properties.ulpin === selected?.ulpin ? 3 : 2, fillColor: statusColors[feature.properties.state], fillOpacity: feature.properties.ulpin === selected?.ulpin ? 0.9 : 0.72 });

  return <div className={`parcel-map ${full ? 'parcel-map-full' : ''}`}>
    <MapContainer center={[23.375, 85.34]} zoom={11} zoomControl={false} scrollWheelZoom className="leaflet-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
      <ZoomControl position="bottomright" />
      <GeoJSON key={`${Object.values(visible).join()}-${visibleLayers.join()}`} data={collection} style={style} eventHandlers={{ click: (event) => setSelected(event.layer.feature.properties) }} />
    </MapContainer>
    <div className="map-floating-label"><span className="live-dot" />PARCEL OVERVIEW <small>KHUNTI DISTRICT</small></div>
    <div className="map-layer-menu"><span className="map-layer-heading">Map layers</span>{Object.entries({ normal: 'Verified parcels', pending: 'Pending mutation', 'high-risk': 'Elevated risk', disputed: 'Disputed parcels' }).map(([key, label]) => <label key={key}><input type="checkbox" checked={visible[key]} onChange={() => setVisible((current) => ({ ...current, [key]: !current[key] }))} /><i style={{ '--layer-color': statusColors[key] }} />{label}</label>)}</div>
    {selected && <div className="map-parcel-popup"><button className="popup-close" onClick={() => setSelected(null)}>×</button><span className="eyebrow">SELECTED LAND PARCEL</span><strong>{selected.ulpin}</strong><div className="popup-owner"><span className="avatar avatar-small">{selected.owner.split(' ').map((s) => s[0]).join('')}</span><span>{selected.owner}<small>Registered owner</small></span></div><div className="popup-grid"><span>Area<strong>{selected.area} acres</strong></span><span>Land type<strong>{selected.landType}</strong></span><span>Risk level<strong className={`text-${selected.risk.toLowerCase()}`}>{selected.risk}</strong></span><span>Record status<strong>{selected.status}</strong></span></div><Button variant="outline" className="popup-action" onClick={() => navigate(`/land/${selected.ulpin}`)}>View complete land profile</Button></div>}
    <div className="map-credit">Prototype parcel boundaries · OpenStreetMap © contributors</div>
  </div>;
}
