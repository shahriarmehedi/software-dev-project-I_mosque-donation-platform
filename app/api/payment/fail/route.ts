import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tran_id = formData.get('tran_id') as string
    const value_a = formData.get('value_a') as string // donation ID
    const error = formData.get('error') as string

    const donationId = value_a

    if (donationId) {
      // Update donation status to failed
      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'FAILED'
        }
      })
    }

    // Redirect to failure page
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/donation-failed', baseUrl)
    if (donationId) redirectUrl.searchParams.set('id', donationId)
    redirectUrl.searchParams.set('reason', 'payment_failed')
    
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Error processing failed payment:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/donation-failed', baseUrl)
    redirectUrl.searchParams.set('reason', 'processing_error')
    
    return NextResponse.redirect(redirectUrl.toString())
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const donationId = searchParams.get('id')
  
  if (donationId) {
    // Update donation status to failed
    try {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'FAILED' }
      })
    } catch (error) {
      console.error('Error updating donation status:', error)
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const redirectUrl = new URL('/donation-failed', baseUrl)
  if (donationId) redirectUrl.searchParams.set('id', donationId)
  redirectUrl.searchParams.set('reason', 'payment_failed')
  
  return NextResponse.redirect(redirectUrl.toString())
}
