import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donationId = params.id

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        campaign: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      donation
    })
  } catch (error) {
    console.error('Error fetching donation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donationId = params.id
    const { status, transactionId } = await request.json()

    // Get the current donation to check if status is changing
    const currentDonation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true }
    })

    if (!currentDonation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Update the donation
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status,
        ...(transactionId && { transactionId }),
        updatedAt: new Date()
      },
      include: {
        campaign: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    // If donation status changed to COMPLETED, update campaign raised amount
    if (status === 'COMPLETED' && currentDonation.status !== 'COMPLETED') {
      await prisma.campaign.update({
        where: { id: currentDonation.campaignId },
        data: {
          raisedAmount: {
            increment: currentDonation.amount
          }
        }
      })
    }

    // If donation status changed from COMPLETED to something else, subtract from raised amount
    if (currentDonation.status === 'COMPLETED' && status !== 'COMPLETED') {
      await prisma.campaign.update({
        where: { id: currentDonation.campaignId },
        data: {
          raisedAmount: {
            decrement: currentDonation.amount
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      donation: updatedDonation
    })
  } catch (error) {
    console.error('Error updating donation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}
