// TypeScript interfaces for EV Station data structures

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  postcode?: string;
}

export interface Connection {
  id: number;
  connectionTypeId: number;
  connectionType: string;
  reference?: string;
  statusTypeId: number;
  statusType: string;
  levelId: number;
  levelTitle: string;
  powerKW?: number;
  currentTypeId: number;
  currentType: string;
  voltage?: number;
  amperage?: number;
  quantity: number;
}

export interface Operator {
  id: number;
  title: string;
  websiteUrl?: string;
  comments?: string;
  phonePrimaryContact?: string;
  phoneSecondaryContact?: string;
  isRestrictedEdit?: boolean;
  bookingUrl?: string;
  contactEmail?: string;
  faultReportEmail?: string;
  isPrivateIndividual?: boolean;
}

export interface Usage {
  id: number;
  title: string;
  isPayAtLocation?: boolean;
  isMembershipRequired?: boolean;
  isAccessKeyRequired?: boolean;
}

export interface StatusType {
  id: number;
  title: string;
  isOperational: boolean;
  isUserSelectable: boolean;
}

export interface ChargingStation {
  id: number;
  uuid: string;
  parentChargePointId?: number;
  dataProviderId: number;
  operatorId?: number;
  operator?: Operator;
  usageTypeId?: number;
  usageType?: Usage;
  addressInfo: Location;
  connections: Connection[];
  numberOfPoints?: number;
  generalComments?: string;
  datePlanned?: string;
  dateLastConfirmed?: string;
  statusTypeId: number;
  statusType: StatusType;
  dateLastStatusUpdate?: string;
  metadataValues?: any[];
  dataQualityLevel: number;
  dateCreated: string;
  submissionStatusTypeId: number;
  distance?: number;
  distanceUnit?: string;
  estimatedTravelTime?: number;
  isFavorite?: boolean;
  isRecentlyViewed?: boolean;
}

export interface SearchFilters {
  location?: {
    latitude: number;
    longitude: number;
  };
  radius?: number; // in miles/km
  connectionTypes?: number[]; // Connection type IDs
  levelIds?: number[]; // Charging levels (1=slow, 2=fast, 3=rapid)
  statusTypes?: number[]; // Status type IDs
  operatorIds?: number[]; // Operator IDs
  countryCode?: string;
  maxResults?: number;
  openData?: boolean;
  includeComments?: boolean;
  powerKW?: {
    min?: number;
    max?: number;
  };
  usageTypeId?: number;
}

export interface SearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  filters?: SearchFilters;
  sortBy?: 'distance' | 'power' | 'status' | 'operator';
  sortOrder?: 'asc' | 'desc';
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserPreferences {
  favoriteStations: number[];
  recentSearches: SearchParams[];
  preferredConnectionTypes: number[];
  preferredOperators: number[];
  defaultRadius: number;
  unit: 'km' | 'miles';
  theme: 'light' | 'dark' | 'system';
}

export interface NavigationRoute {
  distance: string;
  duration: string;
  polyline: string;
  steps: RouteStep[];
  bounds: MapBounds;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  polyline: string;
}

export interface StationReview {
  id: string;
  stationId: number;
  rating: number;
  comment: string;
  author: string;
  dateCreated: string;
  isVerified: boolean;
  helpful: number;
}

export interface ConnectionType {
  id: number;
  title: string;
  formalName?: string;
  isDiscontinued: boolean;
  isObsolete: boolean;
}

export interface ChargerLevel {
  id: number;
  title: string;
  comments?: string;
  isFastChargeCapable: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}