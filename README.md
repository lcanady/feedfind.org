# FeedFind.org

A real-time food assistance directory platform built with Test-Driven Development (TDD) principles. The platform connects food-insecure individuals with available food resources, emphasizing dignity, accessibility, and real-time availability tracking.

## Features

- **Complete Authentication System**: Email/password + Google OAuth with protected routes
- **Real-time Status Updates**: Live availability tracking for food assistance locations
- **Location-Based Search**: Find nearby food assistance using ZIP code, GPS, or address
- **Accessibility-First Design**: WCAG 2.1 AA compliant with full keyboard navigation
- **Mobile-Responsive**: Optimized for all devices including older smartphones
- **Provider Portal**: Dashboard for food assistance providers to update status
- **Non-Obtrusive Advertising**: Google AdSense integration following Craigslist-style design

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript (strict mode)
- **Styling**: Tailwind CSS with accessibility-first design system
- **Backend**: Firebase (Firestore, Auth, Functions, Hosting)
- **Testing**: Jest, React Testing Library, Playwright, axe-core
- **Performance**: Optimized for 3G connections and low-end devices

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/feedfind.org.git
   cd feedfind.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase Authentication**
   
   📚 **[Complete Firebase & Google OAuth Setup Guide](FIREBASE_SETUP.md)**
   
   Create a `.env.local` file with your Firebase configuration:
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234

   # Google AdSense Configuration (optional)
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Google AdSense Integration

The platform includes non-obtrusive Google AdSense integration following Craigslist-style design principles:

### Ad Placements
- **Header Ad**: Small horizontal banner below the main header
- **Sidebar Ad**: Rectangle ad in the left sidebar after category links
- **Footer Ad**: Horizontal banner above the footer links

### Configuration
1. Get your Google AdSense client ID from [Google AdSense](https://www.google.com/adsense/)
2. Add your client ID to the environment variables:
   ```bash
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-client-id
   ```
3. Update the ad slot IDs in `/components/ui/AdSense.tsx` with your actual ad slots

### Ad Slot Setup
Replace the placeholder ad slots in `components/ui/AdSense.tsx`:
```typescript
// Replace these with your actual ad slot IDs
HeaderAd: adSlot="1234567890"
SidebarAd: adSlot="1234567891"  
FooterAd: adSlot="1234567892"
```

### Features
- **Responsive**: Ads automatically adjust to different screen sizes
- **Accessible**: Ads are hidden during print and marked as advertisements
- **Performance**: Ads load asynchronously after page content
- **Non-Obtrusive**: Styled to match the overall site design

## Authentication System

FeedFind.org includes a complete authentication system with both email/password and Google OAuth sign-in.

### Features
- **Email/Password Authentication**: Traditional account creation and login
- **Google OAuth Integration**: One-click sign-in with Google accounts
- **Protected Routes**: Automatic redirects for authenticated/unauthenticated users
- **Password Reset**: Email-based password reset functionality
- **User State Management**: Persistent authentication across page refreshes
- **Role-Based Access**: Support for user, provider, and admin roles

### Available Pages
- `/login` - Sign in with email/password or Google
- `/register` - Create new account with email/password or Google
- `/forgot-password` - Reset password via email
- `/test-auth` - Protected page showing user authentication details

### Testing Authentication
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "register" to create an account or "login" to sign in
4. Test both email/password and Google OAuth flows
5. Visit `/test-auth` to see user details when authenticated

## Development

### Test-Driven Development

This project follows strict TDD principles:
1. Write failing tests first (Red)
2. Write minimal code to make tests pass (Green)
3. Refactor while keeping tests green

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

## Accessibility

- **WCAG 2.1 AA Compliance**: All features meet accessibility standards
- **Keyboard Navigation**: Full keyboard support throughout the platform
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Performance**: Optimized for assistive technologies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Implement your changes
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue or contact the development team. 