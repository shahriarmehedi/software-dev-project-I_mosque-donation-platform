@echo off
echo 🏦 Setting up SSLCommerz Integration...

REM Create .env.local file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    copy .env.example .env.local
)

echo 🔧 SSLCommerz credentials configured:
echo Store ID: mosqu6873818753acb
echo Store Password: mosqu6873818753acb@ssl
echo Store Name: testmosquyque
echo Environment: Sandbox
echo Registered URL: https://mosque-donation-platform.shahriar.site

echo.
echo 🌐 Environment Variables for Vercel:
echo SSLCOMMERZ_STORE_ID=mosqu6873818753acb
echo SSLCOMMERZ_STORE_PASSWORD=mosqu6873818753acb@ssl
echo SSLCOMMERZ_IS_LIVE=false
echo NEXTAUTH_URL=https://mosque-donation-platform.shahriar.site
echo NEXT_PUBLIC_APP_URL=https://mosque-donation-platform.shahriar.site

echo.
echo 🚀 Next Steps:
echo 1. Set the above environment variables in your Vercel dashboard
echo 2. Deploy your application
echo 3. Test payment flow using SSLCOMMERZ_TESTING.md guide
echo 4. Monitor transactions at: https://sandbox.sslcommerz.com/manage/

echo.
echo ⚠️  Important Notes:
echo - Keep SSLCOMMERZ_IS_LIVE=false for sandbox testing
echo - Use test card numbers for payment testing
echo - No real money will be processed in sandbox mode
echo - Test cards: Visa: 4000000000000002, Master: 5555555555554444

echo.
echo ✨ SSLCommerz integration setup complete!
pause
