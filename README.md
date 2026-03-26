# Zero Bank - Premium Mobile-First Banking

![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=flat-square&logo=firebase)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-black?style=flat-square&logo=framer)

Zero Bank is a modern, premium, mobile-first banking web application built with React, TypeScript, Tailwind CSS, and Firebase. It provides a seamless digital banking experience with real-time transactions, comprehensive account management, and a professional aesthetic.

## ✨ Key Features

*   **Secure Authentication:** User registration and login powered by Firebase Authentication. Automatically generates a unique 10-digit account number and requires a secure 4-digit transaction PIN.
*   **Interactive Dashboard:** 
    *   Real-time balance updates with privacy toggle.
    *   Quick actions for Transfers, Services, and Funding.
    *   Responsive "Recent Activity" feed with layout protection for long descriptions.
*   **Advanced Transfers:** 
    *   **Internal:** Real-time account verification and secure atomic transfers.
    *   **Interbank:** Support for external bank transfers (Coming Soon).
*   **Virtual Card Management:** 
    *   View virtual card details with security toggle.
    *   Freeze/Unfreeze card instantly.
    *   Manage online payment permissions and monthly spending limits.
*   **Financial Services:** 
    *   Airtime, Data, Electricity, and TV subscription payments.
    *   Automated balance deduction and transaction logging.
*   **Loan Management:** 
    *   Dynamic loan eligibility calculation based on account history.
    *   Instant loan application and structured repayment system.
*   **Transaction History & Reporting:** 
    *   Full history with type-based filtering (Credit/Debit).
    *   **Professional PDF Statements:** Downloadable account statements generated client-side.
*   **Notifications System:** Real-time alerts for transactions, security updates, and system messages.
*   **Account Upgrades:** Tier-based account system (Tier 1, 2, 3) with document verification workflows (BVN, NIN, ID).
*   **Premium UI/UX:** 
    *   Mobile-first responsive design using Tailwind CSS.
    *   Smooth page transitions and micro-interactions using Framer Motion.
    *   Custom professional theme with a deep red primary accent.

## 🛠️ Tech Stack

*   **Frontend:** React 19 (Vite), TypeScript, Tailwind CSS 4
*   **Animations:** Framer Motion (`motion/react`)
*   **Icons:** Lucide React
*   **Backend:** Node.js (Express) with `tsx` for full-stack SPA fallback
*   **Database:** Firebase Firestore (with hardened Security Rules)
*   **Auth:** Firebase Authentication (Google Login & Email/Password)
*   **Utilities:** `date-fns`, `jspdf`, `html-to-image`

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI components (Layout, BottomNav, Modals)
│   ├── contexts/         # React Contexts (AuthContext for global state)
│   ├── pages/            # Route components (Dashboard, Transfer, Card, Loan, etc.)
│   ├── utils/            # Utility functions (Error handlers, formatting)
│   ├── App.tsx           # Main routing and layout wrapper
│   ├── firebase.ts       # Firebase initialization
│   └── index.css         # Global styles (Tailwind 4)
├── server.ts             # Express server for SPA fallback and production hosting
├── firebase-blueprint.json # Data model documentation
├── firestore.rules       # Hardened security rules
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20 or higher)
*   npm or yarn
*   Firebase Project with Firestore and Auth enabled.

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Firebase:**
    Populate `firebase-applet-config.json` with your credentials:
    ```json
    {
      "apiKey": "YOUR_API_KEY",
      "authDomain": "YOUR_AUTH_DOMAIN",
      "projectId": "YOUR_PROJECT_ID",
      "appId": "YOUR_APP_ID",
      "firestoreDatabaseId": "YOUR_DATABASE_ID"
    }
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```

## 🔒 Security

This application implements **Default Deny** security principles:
*   **PII Protection:** Sensitive user data is strictly locked to the owner.
*   **Atomic Transactions:** Transfers use Firestore Batch Writes to ensure data integrity.
*   **Validation:** All writes are validated via server-side security rules for type, size, and business logic.

## 📄 License

This project is licensed under the MIT License.
