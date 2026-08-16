import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Incident } from '../../../shared/contracts';

type Props = {
  incidents: Incident[];
  selectedId?: string;
  onSelect: (incident: Incident) => void;
  showPredictions: boolean;
};

const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

export function IncidentMap({ incidents, onSelect, showPredictions }: Props) {
  const style = import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';

  return (
    <div className="map-grid" aria-label="Interactive incident map">
      <Map
        initialViewState={{ longitude: 80.9462, latitude: 26.8467, zoom: 12 }}
        mapStyle={style}
      >
        <NavigationControl position="top-right" />
        {incidents.map(incident => (
          <Marker key={incident.id} longitude={incident.location.lng} latitude={incident.location.lat}>
            <button
              className="marker-button"
              style={{ backgroundColor: severityColors[incident.aiAnalysis.riskLevel] }}
              onClick={() => onSelect(incident)}
              aria-label={`Open incident ${incident.id}`}
            >
              {incident.aiAnalysis.classification === 'Pothole' && <span>⚠</span>}
              {incident.aiAnalysis.classification === 'Waterlogging' && <span>💧</span>}
              {incident.aiAnalysis.classification === 'Garbage Pile' && <span>🗑️</span>}
            </button>
          </Marker>
        ))}
        {showPredictions && (
          <div className="map-empty">
            <b>Development prediction layer</b>
            <span>Future hotspot service interface enabled.</span>
          </div>
        )}
      </Map>
    </div>
  );
}