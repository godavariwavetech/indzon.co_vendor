import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import api from './api';
import {endpoints} from '../config/config';

const toRad = deg => (deg * Math.PI) / 180;

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (alreadyGranted) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // requestAuthorization only shows the native prompt when status is
  // "undetermined"; if already granted/denied it just returns that status.
  const status = await Geolocation.requestAuthorization('whenInUse');
  return status === 'granted';
};

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 60000,
    });
  });

// Resolves the device's GPS position to the nearest location_id from
// location_tbl. Never throws; returns null if permission is denied, GPS
// times out, or the lookup fails, so callers can treat it as optional.
export const resolveLocationId = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Location permission denied; skipping location_id resolution');
      return null;
    }

    const position = await getCurrentPosition();
    const {latitude, longitude} = position.coords;
    console.log('Device GPS position:', {latitude, longitude});

    const response = await api.get(endpoints.GETLOCATION);
    const locations = response?.data?.data;
    if (!Array.isArray(locations) || locations.length === 0) {
      console.log('No locations returned from GETLOCATION; skipping location_id');
      return null;
    }

    let nearest = null;
    let nearestDistance = Infinity;
    locations.forEach(loc => {
      const locLat = Number(loc.location_latitude);
      const locLon = Number(loc.location_longitude);
      if (Number.isNaN(locLat) || Number.isNaN(locLon)) return;
      const dist = distanceKm(latitude, longitude, locLat, locLon);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearest = loc;
      }
    });

    if (!nearest) {
      console.log('Could not match GPS position to a location_id');
      return null;
    }

    console.log(
      `Resolved nearest location_id: ${nearest.id} (${nearest.location_name}), ~${nearestDistance.toFixed(1)}km away`,
    );
    return nearest.id;
  } catch (error) {
    console.log('Failed to resolve location_id:', error.message);
    return null;
  }
};

export default resolveLocationId;
