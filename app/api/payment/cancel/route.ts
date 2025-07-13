import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tran_id = formData.get('tran_id') as string
    const value_a = formData.get('value_a') as string // donation ID

    const donationId = value_a

    if (donationId) {
      // Update donation status to cancelled
      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'CANCELLED'
        }
      })
    }

    // Redirect to failure page with cancellation message
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/donation-failed', baseUrl)
    if (donationId) redirectUrl.searchParams.set('id', donationId)
    redirectUrl.searchParams.set('reason', 'cancelled')
    
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Error processing cancelled payment:', error)
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
    try {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'CANCELLED' }
      })
    } catch (error) {
      console.error('Error updating donation status:', error)
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const redirectUrl = new URL('/donation-failed', baseUrl)
  if (donationId) redirectUrl.searchParams.set('id', donationId)
  redirectUrl.searchParams.set('reason', 'cancelled')
  
  return NextResponse.redirect(redirectUrl.toString())
}
