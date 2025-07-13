import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSSLCommerzService } from '@/lib/sslcommerz'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const val_id = formData.get('val_id') as string
    const tran_id = formData.get('tran_id') as string
    const amount = formData.get('amount') as string
    const card_type = formData.get('card_type') as string
    const store_amount = formData.get('store_amount') as string
    const bank_tran_id = formData.get('bank_tran_id') as string
    const value_a = formData.get('value_a') as string // donation ID
    const value_b = formData.get('value_b') as string // campaign ID

    const donationId = value_a

    if (!donationId || !val_id || !tran_id || !amount) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment data' },
        { status: 400 }
      )
    }

    try {
      // For demo/sandbox, skip validation and mark as completed
      const isDemo = process.env.SSLCOMMERZ_IS_LIVE !== 'true'
      
      if (isDemo) {
        // In demo mode, just mark the donation as completed
        const donation = await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: 'COMPLETED',
            transactionId: tran_id,
            bankTranId: bank_tran_id || `DEMO_${tran_id}`
          },
          include: {
            campaign: true
          }
        })

        // Redirect to success page
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const redirectUrl = new URL('/donation-success', baseUrl)
        redirectUrl.searchParams.set('id', donationId)
        redirectUrl.searchParams.set('amount', amount)
        if (card_type) redirectUrl.searchParams.set('method', card_type)
        
        return NextResponse.redirect(redirectUrl.toString())
      }

      // Validate payment with SSLCommerz (production only)
      const sslcommerz = getSSLCommerzService()
      const validationResult = await sslcommerz.validatePayment(val_id, tran_id, amount)

      if (validationResult.status === 'VALID') {
        // Update donation status to completed
        const donation = await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: 'COMPLETED',
            transactionId: tran_id,
            bankTranId: bank_tran_id
          },
          include: {
            campaign: true
          }
        })

        // Redirect to success page
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const redirectUrl = new URL('/donation-success', baseUrl)
        redirectUrl.searchParams.set('id', donationId)
        redirectUrl.searchParams.set('amount', amount)
        if (card_type) redirectUrl.searchParams.set('method', card_type)
        
        return NextResponse.redirect(redirectUrl.toString())
      } else {
        // Payment validation failed
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: 'FAILED' }
        })

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const redirectUrl = new URL('/donation-failed', baseUrl)
        redirectUrl.searchParams.set('id', donationId)
        redirectUrl.searchParams.set('reason', 'validation_failed')
        
        return NextResponse.redirect(redirectUrl.toString())
      }
    } catch (validationError) {
      console.error('Payment validation error:', validationError)
      
      // Mark donation as failed
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'FAILED' }
      })

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const redirectUrl = new URL('/donation-failed', baseUrl)
      redirectUrl.searchParams.set('id', donationId)
      redirectUrl.searchParams.set('reason', 'validation_error')
      
      return NextResponse.redirect(redirectUrl.toString())
    }
  } catch (error) {
    console.error('Error processing successful payment:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/donation-failed', baseUrl)
    redirectUrl.searchParams.set('reason', 'processing_error')
    
    return NextResponse.redirect(redirectUrl.toString())
  }
}

// Handle GET requests for testing and demo
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Try to get donation ID from various possible parameter names
  const donationId = searchParams.get('donationId') ||  // From our callback URL
                     searchParams.get('value_a') || 
                     searchParams.get('id')
  
  const amount = searchParams.get('amount') || 
                 searchParams.get('total_amount')
  
  const tran_id = searchParams.get('tran_id')
  const val_id = searchParams.get('val_id')
  const method = searchParams.get('card_type') || 
                 searchParams.get('method') || 
                 'DEMO_PAYMENT'

  console.log('GET success callback params:', {
    donationId,
    amount,
    tran_id,
    val_id,
    method,
    allParams: Object.fromEntries(searchParams.entries())
  })

  if (donationId) {
    try {
      // Update donation status to completed (demo mode)
      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'COMPLETED',
          transactionId: tran_id || `DEMO_${Date.now()}`,
          bankTranId: val_id || `DEMO_BANK_${Date.now()}`
        }
      })

      // Redirect to success page
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const redirectUrl = new URL('/donation-success', baseUrl)
      redirectUrl.searchParams.set('id', donationId)
      if (amount) redirectUrl.searchParams.set('amount', amount)
      if (method) redirectUrl.searchParams.set('method', method)
      
      return NextResponse.redirect(redirectUrl.toString())
    } catch (error) {
      console.error('Error processing demo success:', error)
      
      // Redirect to failed page if there's an error
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const redirectUrl = new URL('/donation-failed', baseUrl)
      redirectUrl.searchParams.set('id', donationId)
      redirectUrl.searchParams.set('reason', 'processing_error')
      
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // If no donation ID, redirect to home
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return NextResponse.redirect(baseUrl)
}
