import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type?: string;
  severity?: number;
  status?: string;
  address?: string;
  title?: string;
  description?: string;
  department?: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedMarkerId?: string | null;
  interactive?: boolean;
  showHeatmapEffect?: boolean;
  height?: string;
}

function getMarkerColor(severity?: number): string {
  if (!severity && severity !== 0) return '#3b82f6';
  if (severity >= 80) return '#ef4444'; // Critical
  if (severity >= 60) return '#f97316'; // High
  if (severity >= 40) return '#eab308'; // Medium
  return '#06b6d4'; // Low
}

export function LeafletMap({
  markers = [],
  center = [28.6139, 77.2090], // Default center (e.g. New Delhi / City Center)
  zoom = 12,
  onMarkerClick,
  onMapClick,
  selectedMarkerId,
  interactive = true,
  height = '100%',
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
      });

      // Sleek Dark Matter tiles with fallback
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap © CARTO' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach(marker => {
      if (!marker.latitude || !marker.longitude) return;

      const color = getMarkerColor(marker.severity);
      const isSelected = selectedMarkerId === marker.id;

      // Custom Glowing Pulsing Pin
      const iconHtml = `
        <div style="
          position: relative;
          width: ${isSelected ? '24px' : '18px'};
          height: ${isSelected ? '24px' : '18px'};
          background-color: ${color};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 14px ${color}, 0 2px 8px rgba(0,0,0,0.6);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${isSelected ? `<div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [isSelected ? 24 : 18, isSelected ? 24 : 18],
        iconAnchor: [isSelected ? 12 : 9, isSelected ? 12 : 9],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px 6px; min-width: 160px; color: #f8fafc;">
          <div style="font-weight: 700; font-size: 13px; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
            ${marker.type || 'Civic Incident'}
          </div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 4px;">
            📍 ${marker.address || `${marker.latitude.toFixed(4)}, ${marker.longitude.toFixed(4)}`}
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px;">
            <span style="background: ${color}25; color: ${color}; border: 1px solid ${color}60; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              SEVERITY ${marker.severity ?? 'N/A'}
            </span>
            <span style="background: rgba(255,255,255,0.1); color: #cbd5e1; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
              ${marker.status || 'REPORTED'}
            </span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupContent, {
        className: 'custom-dark-popup',
      });

      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker);
        });
      }

      markersLayerRef.current?.addLayer(leafletMarker);
    });

    // Auto fit bounds if markers exist and no manual center override
    if (markers.length > 0 && mapInstanceRef.current) {
      const validMarkers = markers.filter(m => m.latitude && m.longitude);
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map(m => [m.latitude, m.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [markers, selectedMarkerId, onMarkerClick]);

  // Center change effect
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height, minHeight: '350px', borderRadius: '12px' }}
      className="interactive-leaflet-map"
    />
  );
}
