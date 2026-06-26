// Custom Google Maps style — clean, muted, premium (Bilt-inspired)
// Desaturated base, roads barely visible, water soft blue, pins are the only visual focus

export const MAP_STYLE = [
  // ── Base ──────────────────────────────────────────────────────────────────
  {
    elementType: 'geometry',
    stylers: [{ color: '#F8F8F8' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9E9E9E' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },

  // ── Roads ─────────────────────────────────────────────────────────────────
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E8E8E8' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#AAAAAA' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#EFEFEF' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E0E0E0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#BBBBBB' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#BBBBBB' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CCCCCC' }],
  },

  // ── Water ─────────────────────────────────────────────────────────────────
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#D4EAF7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B0CDE0' }],
  },

  // ── Parks & Green ─────────────────────────────────────────────────────────
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#DCF0D8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#AACCA5' }],
  },

  // ── Buildings ─────────────────────────────────────────────────────────────
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#EFEFEF' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#F2F2F2' }],
  },

  // ── Hide all Google POI clutter ───────────────────────────────────────────
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.school',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.sports_complex',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    stylers: [{ visibility: 'off' }],
  },

  // ── Hide transit ──────────────────────────────────────────────────────────
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },

  // ── Administrative labels — keep neighborhood + city only ─────────────────
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#BBBBBB' }, { visibility: 'on' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#AAAAAA' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
]

// Miami initial region
export const MIAMI_REGION = {
  latitude: 25.7617,
  longitude: -80.1918,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

// Wait time color mapping
export const WAIT_COLORS = {
  none: '#C5BDB4',      // gray — no data
  short: '#5DB18A',     // green — 0-10 min
  moderate: '#F8682B',  // orange — 11-25 min
  long: '#D9462E',      // red — 26-45 min
  very_long: '#A63220', // dark red — 45+ min
}

export function getWaitColorFromMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return WAIT_COLORS.none
  if (minutes <= 10) return WAIT_COLORS.short
  if (minutes <= 25) return WAIT_COLORS.moderate
  if (minutes <= 45) return WAIT_COLORS.long
  return WAIT_COLORS.very_long
}
