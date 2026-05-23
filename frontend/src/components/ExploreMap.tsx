import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FoodItem {
  id: number;
  name: string;
  portions: number;
  weight_kg: number;
  pickup_address: string;
  lat: string | number | null;
  lng: string | number | null;
  donor_name?: string;
  category?: string;
}

interface ExploreMapProps {
  foods: FoodItem[];
  selectedCity: string;
  onSelectFood: (food: FoodItem) => void;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Jakarta': [-6.2088, 106.8456],
  'Denpasar': [-8.6704, 115.2126],
  'Surabaya': [-7.2575, 112.7521],
  'Bandung': [-6.9175, 107.6191],
  'Yogyakarta': [-7.7956, 110.3695],
  'Medan': [3.5952, 98.6722],
  'Makassar': [-5.1477, 119.4327],
};

export default function ExploreMap({ foods, selectedCity, onSelectFood }: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Default center (Denpasar or Indonesia center)
    const initialCenter: [number, number] = [-8.6704, 115.2126];
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(initialCenter, 11);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update map center based on selected city
  useEffect(() => {
    if (!leafletMap.current) return;

    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      leafletMap.current.setView(CITY_COORDINATES[selectedCity], 12);
    } else if (foods.length > 0) {
      // Find first valid coordinate to center on
      const firstValid = foods.find(f => f.lat !== null && f.lng !== null);
      if (firstValid) {
        const lat = typeof firstValid.lat === 'string' ? parseFloat(firstValid.lat) : firstValid.lat;
        const lng = typeof firstValid.lng === 'string' ? parseFloat(firstValid.lng) : firstValid.lng;
        if (!isNaN(lat!) && !isNaN(lng!)) {
          leafletMap.current.setView([lat!, lng!], 11);
        }
      }
    }
  }, [selectedCity, foods]);

  // Update Markers
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    foods.forEach(food => {
      if (food.lat === null || food.lng === null) return;
      const lat = typeof food.lat === 'string' ? parseFloat(food.lat) : food.lat;
      const lng = typeof food.lng === 'string' ? parseFloat(food.lng) : food.lng;

      if (isNaN(lat!) || isNaN(lng!)) return;

      const marker = L.marker([lat!, lng!]).addTo(map);
      
      // Popup Content with a styling-friendly wrapper
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 font-sans text-xs';
      popupDiv.innerHTML = `
        <strong class="text-slate-900 block font-bold text-sm">${food.name}</strong>
        <span class="text-emerald-600 font-extrabold block mt-0.5">${food.portions} Porsi (${food.category || 'Makanan'})</span>
        <span class="text-slate-400 block mt-1 truncate max-w-[200px]">${food.pickup_address}</span>
        <button class="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-colors cursor-pointer">
          Lihat Detail
        </button>
      `;

      // Handle button click in popup
      const btn = popupDiv.querySelector('button');
      if (btn) {
        btn.addEventListener('click', () => {
          onSelectFood(food);
        });
      }

      marker.bindPopup(popupDiv);
      markersRef.current.push(marker);
    });
  }, [foods, onSelectFood]);

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-md border border-slate-100 mb-8" style={{ height: '350px' }}>
      <div ref={mapRef} className="w-full h-full z-0" />
    </div>
  );
}
