import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSSLCommerzService } from '@/lib/sslcommerz'

const prisma = new PrismaClient()

// IPN (Instant Payment Notification) handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const val_id = formData.get('val_id') as string
    const tran_id = formData.get('tran_id') as string
    const amount = formData.get('amount') as string
    const card_type = formData.get('card_type') as string
    const store_amount = formData.get('store_amount') as string
    const bank_tran_id = formData.get('bank_tran_id') as string
    const status = formData.get('status') as string
    const tran_date = formData.get('tran_date') as string
    const value_a = formData.get('value_a') as string // donation ID
    const value_b = formData.get('value_b') as string // campaign ID

    const donationId = value_a

    console.log('IPN received for donation:', donationId, 'Status:', status)

    if (!donationId || !val_id || !tran_id) {
      console.error('Invalid IPN data received')
      return new NextResponse('Invalid data', { status: 400 })
    }

    try {
      // Validate payment with SSLCommerz
      const sslcommerz = getSSLCommerzService()
      const validationResult = await sslcommerz.validatePayment(val_id, tran_id, amount)

      if (validationResult.status === 'VALID') {
        // Update donation status based on IPN status
        let donationStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'FAILED'
        
        if (status === 'VALID' || status === 'VALIDATED') {
          donationStatus = 'COMPLETED'
        } else if (status === 'CANCELLED') {
          donationStatus = 'CANCELLED'
        } else {
          donationStatus = 'FAILED'
        }

        await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: donationStatus,
            transactionId: tran_id,
            bankTranId: bank_tran_id,
            updatedAt: new Date()
          }
        })

        console.log(`Donation ${donationId} updated to status: ${donationStatus}`)
        
        // Return success response to SSLCommerz
        return new NextResponse('IPN processed successfully', { status: 200 })
      } else {
        console.error('Payment validation failed for donation:', donationId)
        
        // Mark as failed
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: 'FAILED' }
        })

        return new NextResponse('Payment validation failed', { status: 400 })
      }
    } catch (validationError) {
      console.error('IPN validation error:', validationError)
      
      // Mark as failed
      if (donationId) {
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: 'FAILED' }
        })
      }

      return new NextResponse('Validation error', { status: 500 })
    }
  } catch (error) {
    console.error('IPN processing error:', error)
    return new NextResponse('Processing error', { status: 500 })
  }
}
