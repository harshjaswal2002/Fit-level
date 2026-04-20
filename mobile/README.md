# CutQuest Mobile App - React Native Frontend

A complete React Native mobile application for the CutQuest gamified fitness tracking platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator
- Or Expo Go app on your mobile device

### Installation & Setup

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your preferred platform:**
   - **Web:** Press `w` in the terminal
   - **iOS Simulator:** Press `i` (requires Xcode)
   - **Android Emulator:** Press `a` (requires Android Studio)
   - **Expo Go:** Scan the QR code with Expo Go app

## 📱 App Structure

### 📁 Folder Organization

```
src/
├── components/          # Reusable UI components
│   ├── XPBar.js        # XP progress bar
│   ├── TaskCard.js     # Task completion card
│   ├── RewardCard.js    # Reward redemption card
│   ├── StatCard.js      # Statistics display card
│   └── PhaseCard.js    # Phase progress card
├── screens/             # Screen components
│   ├── Auth/           # Authentication screens
│   │   ├── LoginScreen.js
│   │   └── SignupScreen.js
│   ├── Dashboard/       # Main dashboard
│   │   └── DashboardScreen.js
│   ├── Tasks/          # Task management
│   │   └── TasksScreen.js
│   ├── Log/            # Daily data logging
│   │   └── LogScreen.js
│   ├── Progress/       # Progress tracking
│   │   └── ProgressScreen.js
│   └── Rewards/        # Reward system
│       └── RewardsScreen.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication logic
│   ├── useDashboard.js # Dashboard data
│   ├── useTasks.js     # Task management
│   └── useRewards.js   # Reward system
├── lib/                # Utilities and configurations
│   └── supabase.js    # Supabase client setup
└── navigation/          # Navigation configuration
    ├── AppNavigator.js # Main app navigator
    ├── AuthNavigator.js # Authentication flow
    └── TabNavigator.js # Main app tabs
```

## 🎯 Core Features

### 🔐 Authentication
- Email/password login and signup
- Session persistence with AsyncStorage
- Automatic profile creation on signup
- Secure token management

### 📊 Dashboard
- Real-time XP and level display
- Current phase information
- Daily statistics summary
- Quick action buttons
- Recent activity feed

### ✅ Task Management
- Daily task list with completion tracking
- XP rewards for completed tasks
- Task categories (workout, diet, steps, habits)
- Visual completion indicators
- Progress summary

### 📝 Daily Logging
- Calorie, protein, and steps tracking
- Workout completion toggle
- Notes functionality
- Auto-task completion based on data
- Form validation and error handling

### 📈 Progress Tracking
- Weight logging and history
- Phase progress visualization
- Goal tracking
- Progress statistics
- Historical data display

### 🎁 Reward System
- XP-based reward redemption
- Reward history tracking
- Available rewards display
- XP balance management
- Redemption confirmation

## 🎨 Design System

### Color Palette
- **Background:** `#0f0f0f` (Dark theme)
- **Cards:** `#1a1a1a` (Dark gray)
- **Accent:** `#00ff88` (Green)
- **Text Primary:** `#ffffff` (White)
- **Text Secondary:** `#888888` (Gray)

### Typography
- **Titles:** 24px, bold
- **Body:** 16px, regular
- **Captions:** 12px, regular

### Components
- **Border Radius:** 12px for cards
- **Spacing:** Consistent padding/margins
- **Icons:** Emoji for universal compatibility

## 🔧 Technical Implementation

### State Management
- React hooks for local state
- Custom hooks for API integration
- Real-time data fetching
- Optimistic UI updates

### API Integration
- Direct Supabase REST API calls
- RPC function calls for complex operations
- Error handling and loading states
- Data validation

### Navigation
- React Navigation v6
- Stack navigator for auth flow
- Bottom tabs for main navigation
- Deep linking support

### Performance
- Efficient data fetching
- Component memoization where needed
- Minimal re-renders
- Optimized list rendering

## 🧪 Testing Checklist

### ✅ Authentication
- [x] User signup creates profile
- [x] Login persists session
- [x] Logout clears session
- [x] Error handling for invalid credentials

### ✅ Dashboard
- [x] Real data loading from Supabase
- [x] XP bar displays correctly
- [x] Stats show accurate information
- [x] Navigation to other screens

### ✅ Tasks
- [x] Tasks load from database
- [x] Task completion works
- [x] XP awarded correctly
- [x] No duplicate completions

### ✅ Daily Logging
- [x] Form validation works
- [x] Data saves to database
- [x] Auto-completion triggers
- [x] Error handling

### ✅ Progress
- [x] Weight logging works
- [x] Progress displays correctly
- [x] Historical data loads
- [x] Goal tracking accurate

### ✅ Rewards
- [x] Rewards load from database
- [x] Redemption works with XP check
- [x] History displays correctly
- [x] XP updates after redemption

## 🚀 Deployment

### Build for Production

1. **iOS Build:**
   ```bash
   eas build --platform ios
   ```

2. **Android Build:**
   ```bash
   eas build --platform android
   ```

3. **Web Build:**
   ```bash
   expo build:web
   ```

### Environment Variables
Ensure production environment variables are set:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **Node modules conflicts:**
   ```bash
   rm -rf node_modules && npm install
   ```

3. **Cache issues:**
   ```bash
   npx expo start -c
   ```

### Debug Tools
- **React DevTools:** Press `j` in terminal
- **Remote Debugger:** Shake device to open menu
- **Network Inspector:** Expo Dev Tools

## 📱 Platform Support

- **iOS:** 12.0+
- **Android:** API Level 21+
- **Web:** Modern browsers
- **Expo Go:** Latest version

## 🔄 Updates & Maintenance

### Regular Tasks
- Update dependencies monthly
- Test on new OS versions
- Monitor API usage
- Update security patches

### Performance Monitoring
- Track bundle size
- Monitor API response times
- Check crash reports
- User feedback collection

## 📄 License

This project is licensed under the MIT License.

---

**CutQuest Mobile** - Transform your fitness journey into an engaging game! 🎮💪
