import Map, {Marker, NavigationControl} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {Incident} from '../../../../shared/contracts';
type Props={incidents:Incident[];selectedId?:string;onSelect:(incident:Incident)=>void;showPredictions:boolean};
export function IncidentMap({incidents,onSelect,showPredictions}:Props){
 const style=import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';
 return <div className="map-grid" aria-label="Interactive incident map"><Map initialViewState={{longitude:80.9462,latitude:26.8467,zoom:12}} mapStyle={style}><NavigationControl position="top-right"/>{incidents.map(i=><Marker key={i.id} longitude={i.location.lng} latitude={i.location.lat}><button className={'marker '+i.aiAnalysis.riskLevel.toLowerCase()} onClick={()=>onSelect(i)} aria-label={`Open incident ${i.id}`}>!</button></Marker>)}</Map>{showPredictions&&<div className="map-empty"><b>Development prediction layer</b><span>Future hotspot service interface enabled.</span></div>}</div>
}
