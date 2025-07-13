#!/bin/bash

# SSLCommerz Integration Setup Script
# This script sets up the environment variables needed for SSLCommerz integration

echo "🏦 Setting up SSLCommerz Integration..."

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
fi

# Check if SSLCommerz credentials are already set
if grep -q "mosqu6873818753acb" .env.local; then
    echo "✅ SSLCommerz credentials already configured!"
else
    echo "🔧 Adding SSLCommerz credentials to .env.local..."
    
    # Update SSLCommerz credentials
    sed -i 's/SSLCOMMERZ_STORE_ID="your-store-id"/SSLCOMMERZ_STORE_ID="mosqu6873818753acb"/' .env.local
    sed -i 's/SSLCOMMERZ_STORE_PASSWORD="your-store-password"/SSLCOMMERZ_STORE_PASSWORD="mosqu6873818753acb@ssl"/' .env.local
    
    echo "✅ SSLCommerz credentials updated!"
fi

# Update URLs
echo "🌐 Updating application URLs..."
sed -i 's|NEXT_PUBLIC_APP_URL="http://localhost:3000"|NEXT_PUBLIC_APP_URL="https://mosque-donation-platform.shahriar.site"|' .env.local
sed -i 's|NEXTAUTH_URL="http://localhost:3000"|NEXTAUTH_URL="https://mosque-donation-platform.shahriar.site"|' .env.local

echo "📋 Current SSLCommerz Configuration:"
echo "Store ID: mosqu6873818753acb"
echo "Store Name: testmosquyque" 
echo "Environment: Sandbox"
echo "Registered URL: https://mosque-donation-platform.shahriar.site"
echo "Merchant Panel: https://sandbox.sslcommerz.com/manage/"

echo ""
echo "🚀 Next Steps:"
echo "1. Set these environment variables in your Vercel dashboard"
echo "2. Deploy your application"
echo "3. Test payment flow using the testing guide"
echo "4. Monitor transactions in SSLCommerz merchant panel"

echo ""
echo "⚠️  Important:"
echo "- Keep SSLCOMMERZ_IS_LIVE=false for sandbox testing"
echo "- Use test card numbers for payment testing"
echo "- No real money will be processed in sandbox mode"

echo ""
echo "✨ SSLCommerz integration setup complete!"
