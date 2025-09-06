'use client';

import { useState, useEffect, useCallback } from 'react';
import { ERROR_MESSAGES } from '@/lib/constants';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
  watch: false,
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const opts = { ...defaultOptions, ...options };

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = ERROR_MESSAGES.LOCATION_DENIED;
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = ERROR_MESSAGES.LOCATION_UNAVAILABLE;
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.LOCATION_UNAVAILABLE,
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge,
    });
  }, [onSuccess, onError, opts]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.LOCATION_UNAVAILABLE,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge,
    });

    setWatchId(id);
  }, [onSuccess, onError, opts]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [watchId]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      loading: false,
    });
  }, [watchId]);

  // Auto-start location detection
  useEffect(() => {
    if (opts.watch) {
      startWatching();
    } else {
      getCurrentPosition();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError,
    reset,
    isSupported: 'geolocation' in navigator,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
};

// Hook for distance calculations
export const useDistanceCalculation = () => {
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959; // Earth's radius in miles
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} mi`;
    } else {
      return `${distance.toFixed(0)} mi`;
    }
  }, []);

  const isWithinRadius = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number, radius: number): boolean => {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      return distance <= radius;
    },
    [calculateDistance]
  );

  return {
    calculateDistance,
    formatDistance,
    isWithinRadius,
  };
};

// Hook for browser permissions
export const useLocationPermission = () => {
  const [permissionState, setPermissionState] = useState<PermissionState | 'unsupported'>('prompt');

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        
        result.addEventListener('change', () => {
          setPermissionState(result.state);
        });
      });
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState | 'unsupported'> => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(result.state);
        return result.state;
      } catch (error) {
        console.error('Permission query failed:', error);
        return 'denied';
      }
    }
    return 'unsupported';
  }, []);

  return {
    permissionState,
    requestPermission,
    isGranted: permissionState === 'granted',
    isDenied: permissionState === 'denied',
    isPrompt: permissionState === 'prompt',
    isSupported: permissionState !== 'unsupported',
  };
};