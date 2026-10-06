// Extends app.json with the Google Maps key, read from the environment so it
// is never committed. Locally: GOOGLE_MAPS_APP_KEY in mobile/.env.
// EAS builds: set it once with `eas env:create` (see .env.example).
const key = process.env.GOOGLE_MAPS_APP_KEY

if (!key) {
  console.warn('⚠️  GOOGLE_MAPS_APP_KEY is not set — the Google map will not load in native builds.')
}

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...config.plugins,
    // react-native-maps only reads these two option names
    ['react-native-maps', { iosGoogleMapsApiKey: key, androidGoogleMapsApiKey: key }],
  ],
})
