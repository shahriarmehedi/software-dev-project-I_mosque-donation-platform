# Mosque Donation Management System

A modern, mobile-first web application for managing mosque donations with QR code scanning, digital payments, and admin dashboard.

## Features

### For Donors

- 📱 Mobile-first responsive design
- 🔗 QR code scanning for quick donations
- 💰 Multiple payment methods (bKash, Nagad, Card via SSLCommerz)
- 🎯 Multiple donation campaigns
- 📄 Donation receipts and confirmations

### For Administrators

- 🔐 Secure JWT authentication with HttpOnly cookies
- 📊 Dashboard with donation analytics
- 📋 Campaign management
- 📈 Real-time donation tracking
- 📥 CSV export functionality
- 👥 Donor management

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Payments**: SSLCommerz integration
- **Deployment**: Vercel ready

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- SSLCommerz merchant account (for production)

### Installation

1. **Clone and setup the project**

   ```bash
   git clone <repository-url>
   cd mosque-donation-system
   npm install
   ```

2. **Environment Configuration**

   Copy `.env.local` and update with your values:

   ```bash
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mosque-donations?retryWrites=true&w=majority"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   # SSLCommerz (get from your SSLCommerz account)
   SSLCOMMERZ_STORE_ID="your-store-id"
   SSLCOMMERZ_STORE_PASSWORD="your-store-password"
   SSLCOMMERZ_IS_LIVE="false"  # Set to "true" for production

   # App Configuration
   NEXT_PUBLIC_APP_NAME="Mosque Donation System"
   NEXT_PUBLIC_MOSQUE_NAME="Central Mosque"
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed demo data
   npm run db:seed
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

### Admin Login

- **URL**: http://localhost:3000/admin
- **Email**: admin@mosque.org
- **Password**: admin123

## Project Structure

```
mosque-donation-system/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/               # Admin authentication & data
│   │   ├── campaigns/           # Campaign management
│   │   ├── donations/           # Donation handling
│   │   └── payment/             # Payment processing
│   ├── admin/                   # Admin pages
│   ├── donate/                  # Donation flow
│   ├── donation-success/        # Success page
│   ├── donation-failed/         # Failure page
│   ├── payment-demo/            # Demo payment interface
│   └── globals.css              # Global styles
├── lib/                         # Utility functions
│   └── auth.ts                  # Authentication helpers
├── prisma/                      # Database schema & seeds
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Demo data seeder
└── public/                      # Static assets
```

## Key Features Explained

### QR Code Donations

- Visitors scan QR codes to access donation forms
- Mobile-optimized interface for quick donations
- No user registration required

### Payment Integration

- SSLCommerz integration for bKash, Nagad, and card payments
- Secure payment processing with transaction tracking
- Automatic payment status updates

### Admin Dashboard

- Real-time donation analytics
- Campaign management with target amounts
- Export functionality for accounting
- Secure authentication with JWT tokens

### Campaign System

- Multiple active campaigns simultaneously
- Individual campaign tracking and reporting
- Flexible campaign creation and management

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables**
   Set all environment variables in Vercel dashboard

3. **Database**
   Ensure MongoDB Atlas is configured for production

4. **SSLCommerz**
   - Set `SSLCOMMERZ_IS_LIVE="true"`
   - Use production store credentials

### Alternative Deployments

- Docker support can be added
- Compatible with other Node.js hosting providers
- Database can be switched to PostgreSQL or MySQL with Prisma

## Security Features

- JWT tokens with HttpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS and security headers
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email your mosque administrator or create an issue in the repository.

## Acknowledgments

- Built with Next.js and modern web technologies
- Designed for Bangladesh's mobile payment ecosystem
- Inspired by the need for transparent donation management
