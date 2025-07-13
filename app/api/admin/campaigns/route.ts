import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// Function to recalculate and fix campaign raised amounts
async function ensureAccurateRaisedAmounts() {
    const campaigns = await prisma.campaign.findMany({
        include: {
            donations: {
                where: { status: 'COMPLETED' },
                select: { amount: true }
            }
        }
    })

    for (const campaign of campaigns) {
        const actualRaised = campaign.donations.reduce((sum, donation) => sum + donation.amount, 0)
        
        if (campaign.raisedAmount !== actualRaised) {
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { raisedAmount: actualRaised }
            })
        }
    }
}

// GET /api/admin/campaigns - List all campaigns
export async function GET(request: NextRequest) {
    try {
        const adminUser = requireAdmin(request)

        // Ensure raised amounts are accurate before returning data
        await ensureAccurateRaisedAmounts()

        const campaigns = await prisma.campaign.findMany({
            include: {
                _count: {
                    select: {
                        donations: {
                            where: { status: 'COMPLETED' }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ campaigns })

    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        )
    }
}

// POST /api/admin/campaigns - Create new campaign
export async function POST(request: NextRequest) {
    try {
        const adminUser = requireAdmin(request)

        const body = await request.json()
        const {
            title,
            description,
            targetAmount,
            isActive = true
        } = body

        // Validation
        if (!title || !description || !targetAmount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (targetAmount <= 0) {
            return NextResponse.json(
                { error: 'Target amount must be greater than 0' },
                { status: 400 }
            )
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                targetAmount: Number(targetAmount),
                raisedAmount: 0,
                isActive
            },
            include: {
                _count: {
                    select: {
                        donations: true
                    }
                }
            }
        })

        return NextResponse.json({ campaign }, { status: 201 })

    } catch (error) {
        console.error('Error creating campaign:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        )
    }
}
