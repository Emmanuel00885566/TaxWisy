## `TaxBuddy Mobile App - README.md`

```markdown
# TaxBuddy Mobile App 📱🇳🇬

A smart, modern React Native mobile application for managing Nigerian taxes — built for both individuals (PIT) and businesses (CIT).

---

## 📖 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment & Configuration](#environment--configuration)
- [Screens & Navigation](#screens--navigation)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Design System](#design-system)
- [Building the APK](#building-the-apk)
- [Contributors](#contributors)

---

## 🌟 Overview

**TaxBuddy** is a fintech mobile application that helps Nigerian individuals and businesses:
- Record income and expenses
- Automatically compute Personal Income Tax (PIT) or Company Income Tax (CIT)
- Download tax summary reports in PDF or CSV
- Get reminded of FIRS tax deadlines
- Manage their complete tax profile

Built with **React Native (Expo)** and connected to the **TaxBuddy Backend API** hosted on Render.

---

## ✅ Features

### Authentication
- Individual & Business account registration
- OTP email verification via Brevo
- JWT-based login with refresh token (30-day session)
- Forgot password with email reset link
- Change password from profile
- Secure logout

### Dashboard
- Personalized greeting with account type (PIT/CIT)
- Real-time taxable income overview
- Total income vs total expenses balance card
- Quick action buttons (Add Income, Add Expense, Compute Tax, Reports)
- Recent transactions list
- Latest tax summary card
- Nigerian tax rate info banner

### Transactions
- Add income and expense records
- Edit existing transactions
- Delete transactions
- Search by description, category or amount
- Filter by All / Income / Expense
- Custom date picker (Day, Month, Year)
- Tax deductible toggle
- Pull to refresh

### Tax Management
- Compute PIT (Personal Income Tax) — progressive brackets 7%–24%
- Compute CIT (Company Income Tax) — 20% below ₦100M, 30% above
- View all tax records with period and status
- Mark tax records as paid
- Tax overview card (total paid, unpaid records, total records)

### Reports
- Download PDF or CSV tax summary report
- Select date range with quick presets (Q1, Q2, Q3, Q4, Full Year)
- Summary or Detailed report type
- Share report via native share sheet

### Profile
- View account details and verification status
- Financial overview (income, expenses, taxable income)
- Annual income range display
- Tax deadline reminders
- Change password
- Support & legal info
- Logout

### Onboarding
- Animated splash screen
- 3-screen onboarding with swipe and animated dots
- Skip option
- One-time display (remembered via AsyncStorage)

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native (Expo SDK 56) |
| Language | JavaScript (ES6+) |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| State Management | React Context API |
| Storage | AsyncStorage |
| HTTP Client | Fetch API |
| Fonts | Manrope (via @expo-google-fonts) |
| File System | expo-file-system/legacy |
| Sharing | expo-sharing |
| Notifications | expo-notifications |
| Animations | React Native Animated API |
| Gradient | expo-linear-gradient |

---

## 📁 Project Structure

```
TaxTracker/
├── App.js                          # Root component, font loading
├── app.json                        # Expo configuration
├── assets/
│   ├── logo.jpg                    # App logo
│   ├── onboarding1.png
│   ├── onboarding2.png
│   └── onboarding3.png
└── src/
    ├── components/                 # Reusable UI components
    │   ├── Badge.js               # Status labels (paid, unpaid, income, expense)
    │   ├── Button.js              # Primary, secondary, outline variants
    │   ├── Card.js                # Container card component
    │   ├── EmptyState.js          # Empty list placeholder
    │   ├── Header.js              # Screen header with back button
    │   ├── Input.js               # Form input with label and error
    │   ├── Loader.js              # Full screen loading indicator
    │   ├── TaxSummaryCard.js      # Tax record display card
    │   └── TransactionCard.js     # Transaction list item
    ├── context/
    │   ├── AuthContext.js         # User auth state & token management
    │   └── TransactionContext.js  # Income/expense/summary state
    ├── navigation/
    │   ├── AppNavigator.js        # Root navigator (auth vs main)
    │   ├── AuthNavigator.js       # Auth flow stack
    │   └── TabNavigator.js        # Main app bottom tabs
    ├── screens/
    │   ├── auth/
    │   │   ├── SplashScreen.js
    │   │   ├── OnboardingScreen.js
    │   │   ├── WelcomeScreen.js
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── OTPVerificationScreen.js
    │   │   ├── ForgotPasswordScreen.js
    │   │   └── ResetPasswordScreen.js
    │   ├── dashboard/
    │   │   └── DashboardScreen.js
    │   ├── transactions/
    │   │   ├── TransactionScreen.js
    │   │   ├── AddTransactionModal.js
    │   │   └── EditTransactionModal.js
    │   ├── tax/
    │   │   ├── TaxScreen.js
    │   │   └── ComputeTaxModal.js
    │   ├── reports/
    │   │   └── ReportScreen.js
    │   └── profile/
    │       ├── ProfileScreen.js
    │       └── ChangePasswordScreen.js
    ├── services/                   # API call functions
    │   ├── authService.js
    │   ├── incomeExpenseService.js
    │   ├── taxService.js
    │   ├── transactionService.js
    │   ├── reportService.js
    │   └── reminderService.js
    └── utils/
        ├── api.js                 # Base API client with token refresh
        ├── notifications.js       # Push notification helpers
        ├── taxHelpers.js          # Tax computation utilities
        └── theme.js               # Colors, fonts, sizes, shadows
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- Expo CLI
- Expo Go app (for testing) or Android Studio (for APK)

### Clone & Install

```bash
git clone <your-repo-url>
cd TaxTracker
npm install
```

### Start Development Server

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## ⚙️ Environment & Configuration

The app connects to the hosted backend. No `.env` file is needed on the frontend — the base URL is configured in `src/utils/api.js`:

```javascript
const BASE_URL = 'https://tax-tracker-backend.onrender.com/api';
```

To point to a local backend during development:
```javascript
const BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

---

## 📱 Screens & Navigation

### Auth Flow
```
Splash → Onboarding (first time) → Welcome
Welcome → Register → OTP Verification → Login
Welcome → Login → Dashboard
Login → Forgot Password → Reset Password
```

### Main App (Tab Navigation)
```
Dashboard    → Overview, quick actions, recent transactions
Transactions → Full list, search, add, edit, delete
Tax          → Compute tax, view records, mark paid
Reports      → Download PDF/CSV reports
Profile      → Account info, settings, logout
```

### Modal Screens
```
Add Transaction Modal   → From Transactions screen FAB
Edit Transaction Modal  → From Transactions screen item press
Compute Tax Modal       → From Tax screen button
Change Password         → From Profile screen menu
```

---

## 🔌 API Integration

All API calls go through `src/utils/api.js` which:
- Automatically attaches the JWT token to every request
- Detects 401/403 responses and attempts token refresh
- Falls back to logout if refresh token is also expired

### Services

| Service | Endpoints Used |
|---|---|
| `authService` | sign_up, sign_in, verify_otp, forgot_password, reset_password, profiles |
| `incomeExpenseService` | create, getAll, update, delete |
| `transactionService` | getAll, add, update, delete |
| `taxService` | compute, getRecords, getSummary, markPaid |
| `reportService` | download (PDF/CSV) |
| `reminderService` | getAll, updatePreferences |

### Token Management
- **Access Token** — expires in 3 days, stored in AsyncStorage
- **Refresh Token** — expires in 30 days, stored in AsyncStorage
- Auto-refresh happens transparently when access token expires

---

## 🎨 Design System

All design tokens are in `src/utils/theme.js`:

### Colors
| Token | Value | Usage |
|---|---|---|
| `primary` | `#00d4aa` | Buttons, active states, highlights |
| `background` | `#0a0a1a` | Screen backgrounds |
| `card` | `#12122a` | Card backgrounds |
| `border` | `#2a2a4a` | Borders and dividers |
| `income` | `#00d4aa` | Income amounts |
| `expense` | `#ff4d4d` | Expense amounts |
| `warning` | `#ffa500` | Unpaid status |
| `textPrimary` | `#ffffff` | Main text |
| `textSecondary` | `#888888` | Subtle text |

### Typography
**Manrope** font family with 7 weights:
- `ExtraLight (200)` — decorative
- `Light (300)` — subtle text
- `Regular (400)` — body text
- `Medium (500)` — labels
- `SemiBold (600)` — emphasis
- `Bold (700)` — headings
- `ExtraBold (800)` — display text

---

## 📦 Building the APK

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Configure EAS
```bash
eas build:configure
```

### Build Android APK
```bash
eas build -p android --profile preview
```

### Build for Production
```bash
eas build -p android --profile production
```

---

## 👥 Contributors

| Name | Role |
|---|---|
| Adeboye Emmanuel | Team Lead / Backend Developer |
| Adediji Faith | Backend Developer |
| Boboye Esther | Backend Developer |
| Adodo Daniel | Backend Developer |
| Echanny Idagu | Backend Developer |
| Mungathia Nancy Karimi | Backend Developer |
| Claudia Bose Olawale | Backend Developer |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Related

- **Backend Repository**: [Tax Tracker Backend](https://github.com/Emmanuel00885566/Tax-tracker-backend)
- **Live Backend**: https://tax-tracker-backend.onrender.com
- **API Documentation**: See backend README

---

*Built with ❤️ for Nigerian taxpayers 🇳🇬*
```