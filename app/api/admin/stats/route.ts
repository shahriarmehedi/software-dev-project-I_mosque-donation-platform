import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)

    // Get total donations count and amount
    const totalStats = await prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true }
    })

    // Get unique donors count (based on phone numbers)
    const uniqueDonors = await prisma.donation.groupBy({
      by: ['donorPhone'],
      where: {
        status: 'COMPLETED',
        donorPhone: { not: null }
      }
    })

    // Get current month's donations
    const currentMonth = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    
    const monthlyStats = await prisma.donation.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: firstDayOfMonth }
      },
      _sum: { amount: true }
    })

    const stats = {
      totalDonations: totalStats._count.id || 0,
      totalAmount: totalStats._sum.amount || 0,
      totalDonors: uniqueDonors.length,
      monthlyAmount: monthlyStats._sum.amount || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
