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
      // Validate payment with SSLCommerz
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

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const donationId = searchParams.get('id')
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')

  if (donationId) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/donation-success', baseUrl)
    redirectUrl.searchParams.set('id', donationId)
    if (amount) redirectUrl.searchParams.set('amount', amount)
    if (method) redirectUrl.searchParams.set('method', method)
    
    return NextResponse.redirect(redirectUrl.toString())
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return NextResponse.redirect(baseUrl)
}
