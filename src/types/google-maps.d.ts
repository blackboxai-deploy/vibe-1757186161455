// Google Maps type declarations

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      maxZoom?: number;
      minZoom?: number;
      styles?: MapTypeStyle[];
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: any[];
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: any;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: Function): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
    }

    interface GeocoderResult {
      geometry: {
        location: LatLng;
      };
      formatted_address: string;
      address_components: GeocoderAddressComponent[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    class DistanceMatrixService {
      getDistanceMatrix(request: any, callback: Function): void;
    }

    interface DistanceMatrixResponse {
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
    }

    class DirectionsService {
      route(request: any, callback: Function): void;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
      overview_polyline: { points: string };
      bounds: LatLngBounds;
    }

    interface DirectionsLeg {
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
      steps: DirectionsStep[];
    }

    interface DirectionsStep {
      instructions: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
      start_location: LatLng;
      end_location: LatLng;
      polyline?: { points: string };
    }

    class LatLngBounds {
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: Function): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        types?: string[];
        fields?: string[];
      }

      interface PlaceResult {
        place_id?: string;
        geometry?: {
          location?: LatLng;
        };
        name?: string;
        formatted_address?: string;
        address_components?: GeocoderAddressComponent[];
      }
    }
  }
}

export {};