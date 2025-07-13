import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PaymentMethod } from '@prisma/client'

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

    // Always use demo payment mode
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

  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}
