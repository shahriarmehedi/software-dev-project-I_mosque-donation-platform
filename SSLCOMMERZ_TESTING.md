# SSLCommerz Payment Testing Guide

## Sandbox Configuration Applied

Your SSLCommerz sandbox is now configured with:

- **Store ID**: `mosqu6873818753acb`
- **Store Password**: `mosqu6873818753acb@ssl`
- **Environment**: Sandbox (Testing)
- **Registered URL**: `https://mosque-donation-platform.shahriar.site`

## Testing Payment Flow

### 1. Environment Setup

Make sure these environment variables are set in your Vercel dashboard:

```
SSLCOMMERZ_STORE_ID=mosqu6873818753acb
SSLCOMMERZ_STORE_PASSWORD=mosqu6873818753acb@ssl
SSLCOMMERZ_IS_LIVE=false
NEXTAUTH_URL=https://mosque-donation-platform.shahriar.site
```

### 2. Test Payment Process

1. **Visit Donation Page**

   - Go to: `https://mosque-donation-platform.shahriar.site/donate`
   - Select a campaign or make a general donation
   - Enter amount (minimum ৳10)

2. **Payment Method Selection**

   - Choose any payment method (Credit Card, Mobile Banking, etc.)
   - Click "Donate" button

3. **SSLCommerz Gateway**

   - You'll be redirected to SSLCommerz sandbox payment page
   - Use test card numbers provided by SSLCommerz:
     - **Test Visa**: `4000000000000002`
     - **Test MasterCard**: `5555555555554444`
     - **CVV**: Any 3 digits
     - **Expiry**: Any future date

4. **Test Mobile Banking**
   - For bKash/Nagad testing, use dummy numbers
   - Follow SSLCommerz sandbox instructions

### 3. Payment Status Verification

After payment:

1. **Success**: Redirected back to success page
2. **Admin Panel**: Check donation appears in admin dashboard
3. **Database**: Verify payment status updates correctly

### 4. Webhook Testing

SSLCommerz will send payment notifications to:

- **Success URL**: `https://mosque-donation-platform.shahriar.site/api/payment/sslcommerz/success`
- **Fail URL**: `https://mosque-donation-platform.shahriar.site/api/payment/sslcommerz/fail`
- **Cancel URL**: `https://mosque-donation-platform.shahriar.site/api/payment/sslcommerz/cancel`

### 5. Admin Monitoring

1. **Login to Admin**: `https://mosque-donation-platform.shahriar.site/admin`
2. **Check Donations**: View all donations and their statuses
3. **Payment Verification**: Confirm amounts and transaction IDs match

### 6. SSLCommerz Merchant Panel

Access your merchant panel at:

- **URL**: `https://sandbox.sslcommerz.com/manage/`
- **Credentials**: Use your registration credentials
- **Features**: View transactions, refunds, settlements

## Important Notes

1. **Sandbox Environment**: All transactions are test transactions
2. **No Real Money**: No actual money is processed in sandbox
3. **Test Data**: Use only test card numbers and dummy information
4. **Production Switch**: Change `SSLCOMMERZ_IS_LIVE=true` only with production credentials

## Troubleshooting

### Payment Fails

- Check environment variables are set correctly
- Verify store ID and password
- Ensure URLs are properly configured

### Webhook Issues

- Check API route responses in Vercel logs
- Verify success/fail URLs are accessible
- Test webhook endpoints manually

### Database Not Updating

- Check MongoDB connection
- Verify Prisma schema is deployed
- Review API logs for errors

## Next Steps

1. **Test All Payment Methods**: Card, Mobile Banking, Internet Banking
2. **Verify Admin Dashboard**: Ensure all data appears correctly
3. **Test Error Scenarios**: Failed payments, cancellations
4. **Production Migration**: Contact SSLCommerz for production credentials when ready
