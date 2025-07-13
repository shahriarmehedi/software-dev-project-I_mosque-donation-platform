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
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/donation-failed?id=${donationId}&reason=cancelled`
    )

  } catch (error) {
    console.error('Error processing cancelled payment:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/donation-failed?reason=processing_error`
    )
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

  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/donation-failed?id=${donationId}&reason=cancelled`
  )
}
