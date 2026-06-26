import { Linking, Platform } from 'react-native'

export function openDirections(lat: number, lng: number, name: string) {
  const encoded = encodeURIComponent(name)
  const url = Platform.select({
    ios: `maps:0,0?q=${encoded}&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${encoded}`,
    default: `https://maps.google.com/?q=${lat},${lng}`,
  })
  if (url) Linking.openURL(url)
}
