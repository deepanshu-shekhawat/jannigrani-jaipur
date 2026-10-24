import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { JAIPUR_CENTER } from './JaipurCivicMap';

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  locationLabel: string;
  onLocationChange: (lat: number, lng: number, label: string) => void;
}

const JAIPUR_LOCALITIES = [
  { name: 'Malviya Nagar (Sector 2 / Gaurav Tower)', lat: 26.8538, lng: 75.8162 },
  { name: 'Mansarovar (VT Road / Sector 7)', lat: 26.8624, lng: 75.7675 },
  { name: 'Vaishali Nagar (Amrapali Circle)', lat: 26.9025, lng: 75.7410 },
  { name: 'Raja Park (LBS College / Gali 4)', lat: 26.8968, lng: 75.8290 },
  { name: 'C-Scheme (Statue Circle / Subhash Marg)', lat: 26.9085, lng: 75.8035 },
  { name: 'Tonk Road (Gopalpura Flyover)', lat: 26.8765, lng: 75.7984 },
  { name: 'Jagatpura (Mahal Road / SKIT)', lat: 26.8228, lng: 75.8645 },
  { name: 'Jhotwara (Niwaru Road / Overbridge)', lat: 26.9452, lng: 75.7360 },
  { name: 'Sanganer (Bazar / Stadium Road)', lat: 26.8148, lng: 75.7718 },
  { name: 'Vidyadhar Nagar (Sector 3 Central Spine)', lat: 26.9655, lng: 75.7812 },
  { name: 'Johari Bazar (Walled City Heritage)', lat: 26.9242, lng: 75.8265 },
];

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLng,
  locationLabel,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat || JAIPUR_CENTER[0]);
  const [currentLng, setCurrentLng] = useState(currentLngCoord(initialLng));
  const [currentLabel, setCurrentLabel] = useState(locationLabel || 'Selected pin on Jaipur Map');
  const [searchQuery, setSearchQuery] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  function currentLngCoord(lng: number) {
    return lng || JAIPUR_CENTER[1];
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom Draggable Pin
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #153F35; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.4); cursor: grab;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleUpdateCoords(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        handleUpdateCoords(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUpdateCoords = (lat: number, lng: number, customLabel?: string) => {
    setCurrentLat(lat);
    setCurrentLng(lng);

    // Try finding closest known locality label
    let label = customLabel;
    if (!label) {
      let closestLoc = JAIPUR_LOCALITIES[0];
      let minDiff = 999;
      JAIPUR_LOCALITIES.forEach((loc) => {
        const diff = Math.abs(loc.lat - lat) + Math.abs(loc.lng - lng);
        if (diff < minDiff) {
          minDiff = diff;
          closestLoc = loc;
        }
      });
      label = minDiff < 0.015 ? `Near ${closestLoc.name}` : `Near Jaipur coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    setCurrentLabel(label);
    onLocationChange(lat, lng, label);
  };

  const handleSelectLocality = (loc: typeof JAIPUR_LOCALITIES[0]) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 15);
      markerRef.current.setLatLng([loc.lat, loc.lng]);
      handleUpdateCoords(loc.lat, loc.lng, loc.name);
      setSearchQuery('');
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          handleUpdateCoords(latitude, longitude, 'Current GPS Location (Citizen Verified)');
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(`Location access denied or unavailable (${err.message}). Please click on the map to place pin.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredLocalities = searchQuery.trim()
    ? JAIPUR_LOCALITIES.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="space-y-3">
      {/* Search and Locate Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6D7771]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Jaipur locality (e.g. Malviya Nagar, Mansarovar, Raja Park)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#E1E5DF] bg-white focus:outline-none focus:ring-1 focus:ring-[#153F35]"
          />
          {filteredLocalities.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E1E5DF] rounded-md shadow-elevated z-50 max-h-48 overflow-y-auto">
              {filteredLocalities.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleSelectLocality(loc)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#E6EEE7] text-[#202724] border-b border-stone-50 flex items-center justify-between"
                >
                  <span>{loc.name}</span>
                  <span className="text-[10px] text-[#6D7771]">Jump to pin</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md border border-[#E1E5DF] bg-white hover:bg-stone-50 text-xs font-semibold text-[#153F35] transition"
        >
          <Navigation className="w-3.5 h-3.5 text-[#153F35]" />
          <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Embedded Map Canvas */}
      <div className="h-64 sm:h-80 w-full rounded-lg overflow-hidden border border-[#E1E5DF] relative isolate z-0 shadow-subtle">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {/* Confirmed Location Footer Badge */}
      <div className="p-3 rounded-lg bg-[#E6EEE7] border border-[#ccdcd0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#153F35] shrink-0" />
          <div>
            <span className="font-bold text-[#153F35]">Location Confirmed:</span>{' '}
            <span className="text-[#202724] font-medium">{currentLabel}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#6D7771]">
          {currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E
        </div>
      </div>
    </div>
  );
};
