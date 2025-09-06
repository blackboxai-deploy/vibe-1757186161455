// Application constants and configuration

export const APP_CONFIG = {
  name: 'EV Station Finder',
  description: 'Find electric vehicle charging stations near you',
  version: '1.0.0',
  author: 'EV Station Finder Team',
} as const;

export const GOOGLE_MAPS_CONFIG = {
  defaultCenter: {
    lat: typeof window !== 'undefined' ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '37.7749') : 37.7749,
    lng: typeof window !== 'undefined' ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '-122.4194') : -122.4194,
  },
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 8,
  mapTypeId: 'roadmap' as const,
  styles: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
  ],
} as const;

export const OPEN_CHARGE_MAP_CONFIG = {
  baseUrl: 'https://api.openchargemap.io/v3',
  defaultRadius: typeof window !== 'undefined' ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_SEARCH_RADIUS || '25') : 25,
  maxStationsPerRequest: typeof window !== 'undefined' ? parseInt(process.env.NEXT_PUBLIC_MAX_STATIONS_PER_REQUEST || '100') : 100,
  countryCode: 'US',
  includeComments: true,
  verbose: false,
} as const;

export const CONNECTION_TYPES = {
  1: { name: 'Type 1 (J1772)', icon: '🔌', power: 'AC', level: 1 },
  2: { name: 'CHAdeMO', icon: '⚡', power: 'DC', level: 3 },
  3: { name: 'Type 2 (Mennekes)', icon: '🔌', power: 'AC', level: 2 },
  4: { name: 'Type 3', icon: '🔌', power: 'AC', level: 2 },
  8: { name: 'Tesla Supercharger', icon: '⚡', power: 'DC', level: 3 },
  25: { name: 'Type 2 CCS', icon: '⚡', power: 'DC', level: 3 },
  27: { name: 'Tesla Destination', icon: '🔌', power: 'AC', level: 2 },
  32: { name: 'Type 1 CCS', icon: '⚡', power: 'DC', level: 3 },
  33: { name: 'Type 2 (Tethered)', icon: '🔌', power: 'AC', level: 2 },
  1036: { name: 'Type 2 (Socket)', icon: '🔌', power: 'AC', level: 2 },
} as const;

export const CHARGER_LEVELS = {
  1: { 
    name: 'Level 1', 
    description: 'Standard household outlet (120V)', 
    power: '1.4-1.9 kW',
    chargingTime: '8-20 hours',
    color: '#10B981' 
  },
  2: { 
    name: 'Level 2', 
    description: 'Home/workplace charging (240V)', 
    power: '3.3-22 kW',
    chargingTime: '2-8 hours',
    color: '#3B82F6' 
  },
  3: { 
    name: 'Level 3', 
    description: 'DC Fast charging', 
    power: '25-350 kW',
    chargingTime: '15-45 minutes',
    color: '#F59E0B' 
  },
} as const;

export const STATION_STATUS = {
  10: { name: 'Currently Available', color: '#10B981', priority: 1 },
  20: { name: 'In Use', color: '#F59E0B', priority: 2 },
  30: { name: 'Out of Service', color: '#EF4444', priority: 4 },
  50: { name: 'Operational', color: '#3B82F6', priority: 1 },
  75: { name: 'Partly Operational', color: '#F59E0B', priority: 3 },
  100: { name: 'Not Operational', color: '#6B7280', priority: 5 },
  150: { name: 'Planned For Future', color: '#8B5CF6', priority: 6 },
  200: { name: 'Unknown', color: '#6B7280', priority: 7 },
} as const;

export const USAGE_TYPES = {
  1: { name: 'Public', description: 'Publicly accessible', color: '#10B981' },
  2: { name: 'Membership Required', description: 'Requires membership', color: '#F59E0B' },
  3: { name: 'Private', description: 'Private access only', color: '#EF4444' },
  4: { name: 'Private - For Staff/Visitors', description: 'Limited access', color: '#8B5CF6' },
  5: { name: 'Public - Pay at Location', description: 'Payment required', color: '#3B82F6' },
  6: { name: 'Public - Membership Required', description: 'Public with membership', color: '#F59E0B' },
  7: { name: 'Public - Notice Required', description: 'Advance notice required', color: '#6B7280' },
} as const;

export const SEARCH_CONFIG = {
  debounceDelay: 300,
  minQueryLength: 2,
  maxRecentSearches: 10,
  maxFavoriteStations: 100,
  defaultSortBy: 'distance' as const,
  defaultSortOrder: 'asc' as const,
  autoRefreshInterval: 300000, // 5 minutes
} as const;

export const UI_CONFIG = {
  cardAnimationDelay: 100,
  mapAnimationDuration: 500,
  toastDuration: 4000,
  skeletonPulse: true,
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
} as const;

export const FEATURE_FLAGS = {
  enableGeolocation: true,
  enableFavorites: true,
  enableDirections: true,
  enableReviews: true,
  enableNotifications: false,
  enableOfflineMode: false,
  enableAnalytics: false,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  LOCATION_DENIED: 'Location access denied. Please enable location services.',
  LOCATION_UNAVAILABLE: 'Location services are not available on this device.',
  STATION_NOT_FOUND: 'Station not found. Please try a different search.',
  INVALID_COORDINATES: 'Invalid coordinates provided.',
  API_RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  MAPS_LOAD_FAILED: 'Failed to load maps. Please refresh the page.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOCATION_FOUND: 'Location found successfully',
  STATION_FAVORITED: 'Station added to favorites',
  STATION_UNFAVORITED: 'Station removed from favorites',
  DIRECTIONS_LOADED: 'Directions loaded successfully',
  SEARCH_COMPLETED: 'Search completed successfully',
} as const;