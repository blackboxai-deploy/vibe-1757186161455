// Google Maps API utilities and helpers

import { GOOGLE_MAPS_CONFIG, ERROR_MESSAGES } from './constants';
import type { Location, NavigationRoute, RouteStep } from '@/types/station';

// Google Maps API loader
let googleMapsPromise: Promise<typeof google> | null = null;

export const loadGoogleMaps = (): Promise<typeof google> => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error(ERROR_MESSAGES.MAPS_LOAD_FAILED));
      }
    };

    script.onerror = () => {
      reject(new Error(ERROR_MESSAGES.MAPS_LOAD_FAILED));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Initialize Google Maps
export const initializeMap = async (
  container: HTMLElement,
  center?: { lat: number; lng: number },
  zoom?: number
): Promise<google.maps.Map> => {
  await loadGoogleMaps();

  const mapCenter = center || GOOGLE_MAPS_CONFIG.defaultCenter;
  const mapZoom = zoom || GOOGLE_MAPS_CONFIG.defaultZoom;

  const map = new google.maps.Map(container, {
    center: mapCenter,
    zoom: mapZoom,
    maxZoom: GOOGLE_MAPS_CONFIG.maxZoom,
    minZoom: GOOGLE_MAPS_CONFIG.minZoom,
    styles: GOOGLE_MAPS_CONFIG.styles,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: 'cooperative',
  });

  return map;
};

// Geocoding utilities
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    const location = result[0];
    const components = location.address_components;

    return {
      latitude: location.geometry.location.lat(),
      longitude: location.geometry.location.lng(),
      address: location.formatted_address,
      city: getAddressComponent(components, 'locality') || '',
      state: getAddressComponent(components, 'administrative_area_level_1') || '',
      country: getAddressComponent(components, 'country') || '',
      postcode: getAddressComponent(components, 'postal_code') || '',
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<Location | null> => {
  try {
    await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });

    const location = result[0];
    const components = location.address_components;

    return {
      latitude: lat,
      longitude: lng,
      address: location.formatted_address,
      city: getAddressComponent(components, 'locality') || '',
      state: getAddressComponent(components, 'administrative_area_level_1') || '',
      country: getAddressComponent(components, 'country') || '',
      postcode: getAddressComponent(components, 'postal_code') || '',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Helper function to extract address components
const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string | null => {
  const component = components.find(c => c.types.includes(type));
  return component?.long_name || null;
};

// Distance calculations
export const calculateDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: string; duration: string } | null> => {
  try {
    await loadGoogleMaps();
    const service = new google.maps.DistanceMatrixService();

    const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            resolve(response);
          } else {
            reject(new Error(`Distance calculation failed: ${status}`));
          }
        }
      );
    });

    const element = result.rows[0]?.elements[0];
    if (element && element.status === 'OK') {
      return {
        distance: element.distance?.text || '',
        duration: element.duration?.text || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
};

// Directions service
export const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: { lat: number; lng: number }[]
): Promise<NavigationRoute | null> => {
  try {
    await loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();

    const waypointsFormatted = waypoints?.map(point => ({
      location: point,
      stopover: false,
    })) || [];

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          waypoints: waypointsFormatted,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          optimizeWaypoints: true,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            resolve(response);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    const leg = route.legs[0];

    const steps: RouteStep[] = leg.steps.map(step => ({
      instruction: step.instructions,
      distance: step.distance?.text || '',
      duration: step.duration?.text || '',
      startLocation: {
        latitude: step.start_location.lat(),
        longitude: step.start_location.lng(),
      },
      endLocation: {
        latitude: step.end_location.lat(),
        longitude: step.end_location.lng(),
      },
      polyline: step.polyline?.points || '',
    }));

    return {
      distance: leg.distance?.text || '',
      duration: leg.duration?.text || '',
      polyline: route.overview_polyline.points,
      steps,
      bounds: {
        north: route.bounds.getNorthEast().lat(),
        south: route.bounds.getSouthWest().lat(),
        east: route.bounds.getNorthEast().lng(),
        west: route.bounds.getSouthWest().lng(),
      },
    };
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
};

// Marker utilities
export const createStationMarker = (
  map: google.maps.Map,
  station: { id: number; latitude: number; longitude: number; title: string },
  onClick?: (station: any) => void
): google.maps.Marker => {
  const marker = new google.maps.Marker({
    position: { lat: station.latitude, lng: station.longitude },
    map,
    title: station.title,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="bold">⚡</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
    },
  });

  if (onClick) {
    marker.addListener('click', () => onClick(station));
  }

  return marker;
};

// Places autocomplete
export const setupPlacesAutocomplete = (
  input: HTMLInputElement,
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
): google.maps.places.Autocomplete => {
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['address'],
    fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      onPlaceSelected(place);
    }
  });

  return autocomplete;
};