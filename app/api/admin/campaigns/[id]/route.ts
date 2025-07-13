import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/campaigns/[id] - Get single campaign
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = requireAdmin(request)
        const { id } = params

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        donations: true
                    }
                }
            }
        })

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ campaign })

    } catch (error) {
        console.error('Error fetching campaign:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Failed to fetch campaign' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/campaigns/[id] - Update campaign
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = requireAdmin(request)
        const { id } = params
        const body = await request.json()

        const {
            title,
            description,
            targetAmount,
            isActive
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

        const updateData = {
            title,
            description,
            targetAmount: Number(targetAmount),
            isActive: isActive ?? true
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        donations: true
                    }
                }
            }
        })

        return NextResponse.json({ campaign })

    } catch (error) {
        console.error('Error updating campaign:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        )
    }
}

// PATCH /api/admin/campaigns/[id] - Update campaign status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = requireAdmin(request)
        const { id } = params
        const body = await request.json()
        const { isActive } = body

        const campaign = await prisma.campaign.update({
            where: { id },
            data: { isActive },
            include: {
                _count: {
                    select: {
                        donations: true
                    }
                }
            }
        })

        return NextResponse.json({ campaign })

    } catch (error) {
        console.error('Error updating campaign status:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Failed to update campaign status' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/campaigns/[id] - Delete campaign
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = requireAdmin(request)
        const { id } = params

        // Check if campaign has donations
        const donationsCount = await prisma.donation.count({
            where: { campaignId: id }
        })

        if (donationsCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete campaign with existing donations' },
                { status: 400 }
            )
        }

        await prisma.campaign.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Campaign deleted successfully' })

    } catch (error) {
        console.error('Error deleting campaign:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: 'Failed to delete campaign' },
            { status: 500 }
        )
    }
}
