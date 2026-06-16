import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPreviewProps {
  lat: number;
  lng: number;
  label?: string;
}

export default function MapPreview({ lat, lng, label }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    if (label) marker.bindPopup(label).openPopup();

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={mapRef}
      style={{ height: '220px', borderRadius: '16px', overflow: 'hidden', zIndex: 0 }}
      className="border border-slate-200 shadow-sm w-full"
    />
  );
}