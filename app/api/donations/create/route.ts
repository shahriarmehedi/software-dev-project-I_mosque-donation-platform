import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PaymentMethod } from '@prisma/client'
import { getSSLCommerzService } from '@/lib/sslcommerz'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, amount, donorName, donorPhone, donorEmail, paymentMethod } = body

    // Log the request for debugging
    console.log('Donation request:', { campaignId, amount, paymentMethod })
    console.log('Environment check:', {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID ? 'SET' : 'NOT SET',
      SSLCOMMERZ_IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE
    })

    // Validate required fields
    if (!campaignId || !amount || amount <= 0 || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify campaign exists and is active
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        isActive: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or inactive' },
        { status: 404 }
      )
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        donorName: donorName || undefined,
        donorPhone: donorPhone || undefined,
        donorEmail: donorEmail || undefined,
        paymentMethod: paymentMethod as PaymentMethod,
        campaignId,
        status: 'PENDING'
      }
    })

    // Get base URL with validation
    const baseUrl = process.env.NEXTAUTH_URL || 'https://mosque-donation-platform.shahriar.site'
    
    // Validate URL format
    try {
      new URL(baseUrl)
    } catch (urlError) {
      console.error('Invalid base URL:', baseUrl, urlError)
      return NextResponse.json(
        { success: false, error: 'Invalid base URL configuration' },
        { status: 500 }
      )
    }

    // Initialize SSLCommerz payment
    try {
      // Check if SSLCommerz is properly configured
      const isSSLConfigured = process.env.SSLCOMMERZ_STORE_ID && 
                             process.env.SSLCOMMERZ_STORE_PASSWORD && 
                             process.env.SSLCOMMERZ_STORE_ID !== 'your-store-id'

      if (!isSSLConfigured) {
        // Demo mode - redirect to demo payment page
        const demoTransactionId = `DEMO_${donation.id}_${Date.now()}`
        
        await prisma.donation.update({
          where: { id: donation.id },
          data: { transactionId: demoTransactionId }
        })

        return NextResponse.json({
          success: true,
          donation,
          paymentUrl: `${baseUrl}/payment-demo?donationId=${donation.id}&amount=${amount}&method=${paymentMethod}`,
          isDemo: true
        })
      }

      // Production SSLCommerz integration
      const sslcommerz = getSSLCommerzService()
      const transactionId = sslcommerz.generateTransactionId(donation.id)

      // Update donation with transaction ID
      await prisma.donation.update({
        where: { id: donation.id },
        data: { transactionId }
      })

      const paymentData = {
        amount: parseFloat(amount),
        currency: 'BDT',
        tranId: transactionId,
        productName: `Donation to ${campaign.title}`,
        productCategory: 'Donation',
        customerName: donorName || 'Anonymous Donor',
        customerEmail: donorEmail || 'donor@mosque.org',
        customerPhone: donorPhone || '01700000000',
        customerAddress: 'Dhaka, Bangladesh',
        customerCity: 'Dhaka',
        customerCountry: 'Bangladesh',
        successUrl: `${baseUrl}/api/payment/success`,
        failUrl: `${baseUrl}/api/payment/fail`,
        cancelUrl: `${baseUrl}/api/payment/cancel`,
        ipnUrl: `${baseUrl}/api/payment/ipn`,
        donationId: donation.id,
        campaignId: campaign.id
      }

      const sslResponse = await sslcommerz.initiatePayment(paymentData)

      if (sslResponse.status === 'SUCCESS') {
        // Update donation with SSL session ID
        await prisma.donation.update({
          where: { id: donation.id },
          data: { sslSessionId: sslResponse.sessionkey }
        })

        return NextResponse.json({
          success: true,
          donation,
          paymentUrl: sslResponse.GatewayPageURL,
          sessionKey: sslResponse.sessionkey
        })
      } else {
        // Payment initiation failed
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'FAILED' }
        })

        return NextResponse.json(
          { success: false, error: sslResponse.failedreason || 'Payment initiation failed' },
          { status: 400 }
        )
      }
    } catch (sslError) {
      console.error('SSLCommerz error:', sslError)
      
      // If SSLCommerz fails, fallback to demo mode
      const demoTransactionId = `DEMO_${donation.id}_${Date.now()}`
      
      await prisma.donation.update({
        where: { id: donation.id },
        data: { transactionId: demoTransactionId }
      })

      return NextResponse.json({
        success: true,
        donation,
        paymentUrl: `${baseUrl}/payment-demo?donationId=${donation.id}&amount=${amount}&method=${paymentMethod}`,
        isDemo: true,
        message: 'Using demo payment gateway due to configuration issues'
      })
    }
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}
