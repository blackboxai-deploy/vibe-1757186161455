// API client configuration and methods

import { OPEN_CHARGE_MAP_CONFIG, ERROR_MESSAGES } from './constants';
import type { ChargingStation, SearchFilters, ApiResponse } from '@/types/station';

class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = OPEN_CHARGE_MAP_CONFIG.baseUrl;
    this.apiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY : undefined;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // Add API key if available
      if (this.apiKey) {
        url.searchParams.append('key', this.apiKey);
      }

      // Add parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, v.toString()));
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(ERROR_MESSAGES.API_RATE_LIMITED);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        data,
        success: true,
        meta: {
          total: Array.isArray(data) ? data.length : 1,
          page: 1,
          limit: OPEN_CHARGE_MAP_CONFIG.maxStationsPerRequest,
        },
      };
    } catch (error) {
      console.error('API Request Error:', error);
      
      return {
        data: [] as T,
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR,
      };
    }
  }

  async searchStations(filters: SearchFilters = {}): Promise<ApiResponse<ChargingStation[]>> {
    const params: Record<string, any> = {
      output: 'json',
      countrycode: filters.countryCode || OPEN_CHARGE_MAP_CONFIG.countryCode,
      maxresults: filters.maxResults || OPEN_CHARGE_MAP_CONFIG.maxStationsPerRequest,
      compact: !OPEN_CHARGE_MAP_CONFIG.verbose,
      verbose: OPEN_CHARGE_MAP_CONFIG.verbose,
      includecomments: filters.includeComments || OPEN_CHARGE_MAP_CONFIG.includeComments,
    };

    // Add location-based search
    if (filters.location) {
      params.latitude = filters.location.latitude;
      params.longitude = filters.location.longitude;
    }

    // Add radius filter
    if (filters.radius) {
      params.distance = filters.radius;
      params.distanceunit = 'Miles';
    }

    // Add connection type filters
    if (filters.connectionTypes && filters.connectionTypes.length > 0) {
      params.connectiontypeid = filters.connectionTypes;
    }

    // Add level filters
    if (filters.levelIds && filters.levelIds.length > 0) {
      params.levelid = filters.levelIds;
    }

    // Add status filters
    if (filters.statusTypes && filters.statusTypes.length > 0) {
      params.statustypeid = filters.statusTypes;
    }

    // Add operator filters
    if (filters.operatorIds && filters.operatorIds.length > 0) {
      params.operatorid = filters.operatorIds;
    }

    // Add power filters
    if (filters.powerKW) {
      if (filters.powerKW.min) {
        params.minpowerkw = filters.powerKW.min;
      }
      if (filters.powerKW.max) {
        params.maxpowerkw = filters.powerKW.max;
      }
    }

    // Add usage type filter
    if (filters.usageTypeId) {
      params.usagetypeid = filters.usageTypeId;
    }

    // Add open data filter
    if (filters.openData !== undefined) {
      params.opendata = filters.openData;
    }

    return this.makeRequest<ChargingStation[]>('/poi', params);
  }

  async getStationById(id: number): Promise<ApiResponse<ChargingStation>> {
    const response = await this.makeRequest<ChargingStation[]>('/poi', { 
      chargepointid: id,
      includecomments: true,
      verbose: true 
    });

    if (response.success && response.data.length > 0) {
      return {
        ...response,
        data: response.data[0],
      };
    }

    return {
      data: {} as ChargingStation,
      success: false,
      error: ERROR_MESSAGES.STATION_NOT_FOUND,
    };
  }

  async getConnectionTypes(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/connectiontypes');
  }

  async getOperators(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/operators');
  }

  async getCountries(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/countries');
  }

  async getUsageTypes(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/usagetypes');
  }

  async getStatusTypes(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/statustypes');
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Helper functions for common operations
export const searchNearbyStations = async (
  latitude: number,
  longitude: number,
  radius: number = OPEN_CHARGE_MAP_CONFIG.defaultRadius
): Promise<ApiResponse<ChargingStation[]>> => {
  return apiClient.searchStations({
    location: { latitude, longitude },
    radius,
    statusTypes: [10, 20, 50], // Available, In Use, Operational
  });
};

export const searchStationsByLocation = async (
  filters: SearchFilters
): Promise<ApiResponse<ChargingStation[]>> => {
  return apiClient.searchStations(filters);
};

export const getStationDetails = async (
  id: number
): Promise<ApiResponse<ChargingStation>> => {
  return apiClient.getStationById(id);
};

// Cache management for API responses
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new ApiCache();