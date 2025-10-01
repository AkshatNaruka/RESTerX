# RESTerX - SaaS Features

This document describes the SaaS features implemented in RESTerX, making it a comprehensive API testing platform similar to Postman and Insomnia.

## 🎯 Overview

RESTerX has been transformed into a full-featured SaaS application with:
- Modern landing page with navigation
- Authentication system (Google OAuth + Credentials)
- Subscription-based pricing tiers
- User dashboard and billing management
- Payment integration support (Stripe, PayPal, Razorpay)

## 📑 New Pages

### Landing Page Enhancements
- ✅ Uncommented navigation links
- ✅ Added Sign In button
- ✅ GitHub link
- ✅ Documentation, Pricing, Support, Privacy links

### Documentation (`/docs`)
- Getting Started guide
- HTTP Methods reference
- Authentication guide
- Code Generation documentation
- Collections and Templates info

### Pricing (`/pricing`)
- **Free Plan**: 100 API requests/day, 3 collections, basic features
- **Pro Plan**: $19/month - Unlimited requests, team collaboration, priority support
- **Enterprise Plan**: Custom pricing - Advanced features, SSO, dedicated support
- FAQ section
- 14-day free trial on all paid plans

### Support (`/support`)
- Contact form
- Links to documentation, community, and GitHub issues
- Email support: support@resterx.com
- 24/7 availability with <24hr response time

### Privacy Policy (`/privacy`)
- Comprehensive privacy policy
- Data collection and usage information
- Security measures (AES-256, TLS 1.3)
- User rights and data retention
- Cookie policy

## 🔐 Authentication System

### Features
- **Google OAuth**: Sign in with Google (configurable)
- **Email/Password**: Traditional credentials-based authentication
- **Demo Account**: For testing
  - Email: demo@resterx.com
  - Password: demo123

### Pages
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/error` - Authentication error handling

### Setup
Create a `.env.local` file based on `.env.example`:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secret key:
```bash
openssl rand -base64 32
```

## 👤 User Dashboard (`/dashboard`)

Protected route that shows:
- Welcome message with user info
- Usage statistics (API requests, collections, days active)
- Current subscription plan
- Quick upgrade to Pro CTA
- Quick actions (Profile, Billing, Preferences)
- Recent activity feed

## 💳 Billing & Subscription (`/billing`)

Features:
- Current subscription plan display
- Upgrade options with feature comparison
- Payment method management
- Billing history with downloadable invoices
- Support for multiple payment processors:
  - Stripe (Primary)
  - PayPal
  - Razorpay
  - Credit/Debit Cards

### Payment Integration (Ready for Implementation)

Environment variables for payment processors:

```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd resterx_Enhanced
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## 📦 Project Structure

```
resterx_Enhanced/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── auth/                    # Authentication pages
│   │   ├── signin/
│   │   ├── signup/
│   │   └── error/
│   ├── dashboard/               # User dashboard
│   ├── billing/                 # Billing management
│   ├── docs/                    # Documentation
│   ├── pricing/                 # Pricing page
│   ├── support/                 # Support page
│   ├── privacy/                 # Privacy policy
│   ├── app/                     # API playground
│   ├── Landing.tsx              # Landing page
│   └── layout.tsx               # Root layout with providers
├── components/
│   ├── providers/               # Auth provider wrapper
│   └── ui/                      # UI components
└── .env.example                 # Environment template
```

## 🔒 Security Features

- **JWT-based sessions**: Secure token management
- **Password hashing**: Using bcrypt (backend)
- **HTTPS enforcement**: In production
- **CORS protection**: Configured for security
- **XSS prevention**: React built-in protection
- **CSRF tokens**: NextAuth.js handles this

## 🎯 Roadmap

### Completed ✅
- Landing page with navigation
- Authentication system (Google OAuth + Credentials)
- Pricing page with 3 tiers
- Documentation page
- Support page with contact form
- Privacy policy
- User dashboard
- Billing management page
- Environment setup for payments

### Next Steps 🚧
- [ ] Implement actual payment processing (Stripe Checkout)
- [ ] Database integration for user data
- [ ] API usage tracking and rate limiting
- [ ] Team collaboration features
- [ ] Workspace management
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📄 License

[Add your license here]

## 🆘 Support

- **Email**: support@resterx.com
- **Documentation**: [/docs](/docs)
- **GitHub Issues**: [Report bugs and request features](https://github.com/AkshatNaruka/RESTerX/issues)

---

Built with ❤️ by the RESTerX team
