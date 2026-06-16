import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'motion/react';

// Fix default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  onCoordinatePicked: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  renderSearch?: (searchElement: React.ReactNode) => React.ReactNode;
}

export default function MapPicker({ onCoordinatePicked, initialLat, initialLng, initialAddress, renderSearch }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const defaultLat = initialLat || -6.2088;
    const defaultLng = initialLng || 106.8456;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (initialLat && initialLng) {
      updateMarker(initialLat, initialLng, false);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng, true);
    });

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  const updateMarker = (lat: number, lng: number, shouldGeocode: boolean) => {
    if (!leafletMap.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(leafletMap.current);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateMarker(pos.lat, pos.lng, true);
      });
    }

    if (shouldGeocode) {
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
      );
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onCoordinatePicked(lat, lng, address);
      setSearchQuery(address);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onCoordinatePicked(lat, lng, fallback);
    } finally {
      setIsGeocoding(false);
    }
  };

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=id&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const selectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const address = s.display_name;

    if (leafletMap.current) {
      leafletMap.current.setView([lat, lng], 16);
      updateMarker(lat, lng, false);
      onCoordinatePicked(lat, lng, address);
      setSearchQuery(address);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation tidak didukung browser ini.');
    
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (leafletMap.current) {
          leafletMap.current.setView([latitude, longitude], 16);
          updateMarker(latitude, longitude, true);
        }
      },
      (err) => {
        console.error(err);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
        setIsGeocoding(false);
      }
    );
  };

  const searchElement = (
    <div className="relative z-20">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari lokasi (contoh: Telkom University)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-sm shadow-sm transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
          )}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          title="Gunakan lokasi saat ini"
          className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[30] max-h-64 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-slate-600 line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  useEffect(() => {
    if (renderSearch) {
      renderSearch(searchElement);
    }
  }, [searchQuery, suggestions, isSearching, renderSearch]);

  return (
    <div className="space-y-4">
      {renderSearch ? null : searchElement}

      {/* Map Display */}
      <div
        ref={mapRef}
        style={{ height: '350px', borderRadius: '24px', overflow: 'hidden', zIndex: 0 }}
        className="border-4 border-white shadow-xl"
      />

      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full w-fit mx-auto">
        <div className={`w-2 h-2 rounded-full ${isGeocoding ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
          {isGeocoding ? 'Sinkronisasi Lokasi...' : 'Lokasi Terkunci'}
        </span>
      </div>
    </div>
  );
}