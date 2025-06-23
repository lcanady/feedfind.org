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

### Initial Setup for feedfind.org

1. **Get AdSense Approval**:
   - Visit [Google AdSense](https://www.google.com/adsense)
   - Sign up with your feedfind.org domain
   - Add the site for review
   - Wait for domain verification and approval

2. **Domain Verification**:
   - The layout already includes the necessary meta tags for verification
   - The verification will use your AdSense client ID automatically
   - Make sure your domain DNS is properly configured

3. **Environment Configuration**:
   ```bash
   # .env.local or deployment environment
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-actual-client-id
   ```

### Ad Placements & Slots

The platform has pre-configured ad slots for optimal placement:

#### Main Page Ads
- **Header Banner**: Above the main content (728x90)
  ```typescript
  adSlot="your-header-slot-id"
  ```
- **Sidebar Rectangle**: Right sidebar (300x250)
  ```typescript
  adSlot="your-sidebar-slot-id"
  ```
- **Footer Banner**: Below main content (728x90)
  ```typescript
  adSlot="your-footer-slot-id"
  ```

#### Community Section Ads
- **Forum Post Ad**: Between forum posts (728x90)
- **Forum Sidebar**: Right sidebar (300x250)
- **Forum Reply**: Between replies (300x250)
- **Forum Footer**: Bottom of forum pages (728x90)

### Ad Component Features
- **Responsive**: Automatically adjusts to screen size
- **User Preferences**: Respects ad-free subscriptions
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Async loading after core content
- **Error Handling**: Graceful fallbacks for ad blockers
- **Print-Friendly**: Ads hidden during printing

### Ad-Free Experience
The platform supports an ad-free subscription model:
- Users can upgrade to remove ads
- Premium subscribers automatically get ad-free experience
- Ad preferences managed in user profile settings

### Testing Ads
1. **Development**:
   ```bash
   # Use test ad units in development
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-test-id
   ```

2. **Production**:
   - Replace all test ad slots with actual slots from AdSense dashboard
   - Monitor ad performance in AdSense analytics
   - Test across different devices and screen sizes

### Best Practices
- Keep ads non-intrusive and clearly marked
- Maintain content-to-ad ratio per Google policies
- Regular monitoring of ad performance
- Respect user preferences for ad personalization

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