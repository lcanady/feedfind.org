# Google Maps Setup Guide for FeedFind.org

## Overview
This guide will help you set up Google Maps integration for the FeedFind.org platform.

## Prerequisites
- Google Cloud Platform account
- Billing enabled on your Google Cloud project
- Google Maps JavaScript API enabled

## Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (if using autocomplete)
4. Create credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy your API key

## Step 2: Configure API Key Restrictions

For security, restrict your API key:

1. In the Credentials page, click on your API key
2. Under "Application restrictions":
   - For development: Choose "HTTP referrers" and add `http://localhost:3000/*`
   - For production: Add your domain `https://feedfind.org/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Geocoding API, Places API

## Step 3: Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Other configurations
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## Step 4: Verify Installation

The maps functionality includes:
- ✅ Google Maps API loader (`lib/googleMapsLoader.ts`)
- ✅ React hooks for maps (`hooks/useGoogleMaps.tsx`)
- ✅ LocationMap component (`components/map/LocationMap.tsx`)
- ✅ Map controls (`components/map/MapControls.tsx`)
- ✅ Map integration in search results

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/map` to test the basic map functionality
3. Navigate to `/search` and perform a search to see map integration

## Available Map Features

### Core Features
- **Interactive Map**: Pan, zoom, and explore locations
- **Custom Markers**: Status-based markers (open/closed/limited)
- **Info Windows**: Detailed location information on marker click
- **Clustering**: Groups nearby markers for better performance
- **User Location**: Shows user's current location if permitted
- **Responsive Design**: Works on mobile and desktop

### Map Controls
- **View Toggle**: Switch between map and list view
- **Recenter**: Return to user's location
- **Map Type**: Switch between roadmap, satellite, terrain
- **Zoom Controls**: Zoom in/out functionality

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Clear visual indicators

## Troubleshooting

### Common Issues

1. **"Google Maps API key not configured"**
   - Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
   - Restart your development server after adding the environment variable

2. **"Failed to load Google Maps API"**
   - Verify your API key is correct
   - Check API restrictions in Google Cloud Console
   - Ensure billing is enabled on your Google Cloud project

3. **Map not displaying**
   - Check browser console for errors
   - Verify the container has a defined height
   - Check if the API key has the right permissions

4. **Markers not showing**
   - Verify location data has valid coordinates
   - Check if coordinates are within the map bounds
   - Ensure marker icons are loading correctly

### Development Tips

1. **Testing without API key**: The system includes fallback error handling
2. **Custom Marker Icons**: Modify `getMarkerIcon()` in `LocationMap.tsx`
3. **Map Styling**: Customize map appearance in the map options
4. **Performance**: Use clustering for large datasets (enabled by default)

## API Usage Limits

Be aware of Google Maps API usage limits:
- **Free tier**: $200 credit per month
- **Maps loads**: $7 per 1,000 loads
- **Geocoding**: $5 per 1,000 requests

Monitor usage in Google Cloud Console to avoid unexpected charges.

## Next Steps

After setup:
1. Test all map functionality
2. Customize marker icons for your branding
3. Add additional map features as needed
4. Set up monitoring for API usage
5. Configure proper error handling for production

For additional help, see the [Google Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript). 