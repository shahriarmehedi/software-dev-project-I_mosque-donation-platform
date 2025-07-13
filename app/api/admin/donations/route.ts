import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)

    const donations = await prisma.donation.findMany({
      include: {
        campaign: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to recent 100 donations
    })

    return NextResponse.json({
      success: true,
      donations
    })
  } catch (error) {
    console.error('Error fetching admin donations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request)

    const body = await request.json()
    const {
      campaignId,
      amount,
      donorName,
      donorPhone,
      donorEmail,
      paymentMethod,
      notes
    } = body

    // Validation
    if (!campaignId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign and valid amount are required' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        campaignId,
        amount: parseFloat(amount),
        donorName: donorName || null,
        donorPhone: donorPhone || null,
        donorEmail: donorEmail || null,
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        status: 'COMPLETED', // Manual donations are marked as completed
        transactionId: `MANUAL_${Date.now()}`,
        bankTranId: notes ? `MANUAL: ${notes}` : null
      },
      include: {
        campaign: {
          select: {
            title: true
          }
        }
      }
    })

    // Update campaign raised amount
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        raisedAmount: {
          increment: parseFloat(amount)
        }
      }
    })

    return NextResponse.json({
      success: true,
      donation
    })
  } catch (error) {
    console.error('Error creating manual donation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}
