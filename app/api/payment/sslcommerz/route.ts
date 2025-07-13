import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const donationId = searchParams.get('donationId')
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')

  if (!donationId || !amount) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Get donation details
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true }
    })

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      )
    }

    // SSLCommerz configuration
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const sslCommerzData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: amount,
      currency: 'BDT',
      tran_id: `TXN_${donationId}_${Date.now()}`,
      success_url: `${baseUrl}/api/payment/success`,
      fail_url: `${baseUrl}/api/payment/fail`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      product_name: `Donation to ${donation.campaign.title}`,
      product_category: 'Donation',
      product_profile: 'general',
      cus_name: donation.donorName || 'Anonymous',
      cus_email: 'donor@mosque.org',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: donation.donorPhone || '01700000000',
      ship_name: donation.donorName || 'Anonymous',
      ship_add1: 'Dhaka',
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
      value_a: donationId, // Store donation ID for reference
      value_b: method,
    }

    // Update donation with transaction ID
    await prisma.donation.update({
      where: { id: donationId },
      data: { transactionId: sslCommerzData.tran_id }
    })

    // In production, you would make a POST request to SSLCommerz API
    // For now, we'll simulate the payment process
    const sslCommerzUrl = process.env.SSLCOMMERZ_IS_LIVE === 'true'
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

    // Create form data for POST request
    const formData = new URLSearchParams()
    Object.entries(sslCommerzData).forEach(([key, value]) => {
      if (value != null) {
        formData.append(key, value.toString())
      }
    })

    // For demo purposes, redirect to a mock payment page
    // In production, you would POST to SSLCommerz and redirect to their gateway
    const redirectUrl = new URL('/payment-demo', baseUrl)
    redirectUrl.searchParams.set('donationId', donationId)
    redirectUrl.searchParams.set('amount', amount)
    redirectUrl.searchParams.set('method', method || 'CREDIT_CARD')
    
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
