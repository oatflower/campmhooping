import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Camp } from '@/types/camp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CampMapViewProps {
  camps: Camp[];
  hoveredCampId: string | null;
  onMarkerClick?: (campId: string) => void;
}

const CampMapView = ({ camps, hoveredCampId, onMarkerClick }: CampMapViewProps) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox_token') || ''
  );
  const [isTokenSet, setIsTokenSet] = useState<boolean>(!!localStorage.getItem('mapbox_token'));
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSetToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setIsTokenSet(true);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    setIsLoading(true);
    setMapError(null);
    mapboxgl.accessToken = mapboxToken;

    // Calculate center from camps
    const avgLat = camps.length > 0
      ? camps.reduce((sum, c) => sum + c.coordinates.lat, 0) / camps.length
      : 13.7563;
    const avgLng = camps.length > 0
      ? camps.reduce((sum, c) => sum + c.coordinates.lng, 0) / camps.length
      : 100.5018;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [avgLng, avgLat],
        zoom: 6,
      });

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(t('map.loadError'));
        setIsLoading(false);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers
      camps.forEach((camp) => {
        const el = document.createElement('div');
        el.className = 'camp-price-marker';
        el.innerHTML = formatPrice(camp.pricePerNight);
        el.style.cssText = `
          background: white;
          color: #222;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e0e0e0;
          white-space: nowrap;
        `;

        markersRef.current[camp.id] = el;

        el.addEventListener('click', () => {
          onMarkerClick?.(camp.id);
        });

        new mapboxgl.Marker({ element: el })
          .setLngLat([camp.coordinates.lng, camp.coordinates.lat])
          .addTo(map.current!);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(t('map.initError'));
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [camps, isTokenSet, mapboxToken, onMarkerClick, formatPrice, t]);

  // Update marker styles on hover
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([campId, el]) => {
      if (campId === hoveredCampId) {
        el.style.background = '#222';
        el.style.color = 'white';
        el.style.transform = 'scale(1.15)';
        el.style.zIndex = '10';
        el.style.border = '1px solid #222';
      } else {
        el.style.background = 'white';
        el.style.color = '#222';
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
        el.style.border = '1px solid #e0e0e0';
      }
    });
  }, [hoveredCampId]);

  const handleRetry = () => {
    setMapError(null);
    setIsLoading(true);
    // Force re-render by toggling token state
    setIsTokenSet(false);
    setTimeout(() => setIsTokenSet(true), 100);
  };

  const handleClearToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setIsTokenSet(false);
    setMapError(null);
  };

  if (!isTokenSet) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-muted/30 p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('map.tokenRequired')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('map.tokenDescription')}{' '}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSetToken}>{t('map.setToken')}</Button>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-muted/30 p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">{t('map.errorTitle')}</h3>
          <p className="text-sm text-muted-foreground">{mapError}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleClearToken}>
              {t('map.changeToken')}
            </Button>
            <Button onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('map.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t('map.loading')}</span>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default CampMapView;
