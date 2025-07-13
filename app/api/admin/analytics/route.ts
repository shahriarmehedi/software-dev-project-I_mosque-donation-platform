import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        requireAdmin(request)
        
        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') || '30d'
        
        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        
        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case '90d':
                startDate.setDate(now.getDate() - 90)
                break
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1)
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Get basic stats
        const totalDonations = await prisma.donation.count({
            where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            }
        })

        const totalAmountResult = await prisma.donation.aggregate({
            where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        })

        const totalAmount = totalAmountResult._sum.amount || 0

        // Get unique donors
        const uniqueDonors = await prisma.donation.findMany({
            where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            },
            select: { donorEmail: true, donorPhone: true },
            distinct: ['donorEmail', 'donorPhone']
        })

        const totalDonors = uniqueDonors.length

        // Get active campaigns
        const activeCampaigns = await prisma.campaign.count({
            where: { isActive: true }
        })

        // Calculate monthly growth (compare with previous period)
        const previousStartDate = new Date(startDate)
        const periodLength = now.getTime() - startDate.getTime()
        previousStartDate.setTime(startDate.getTime() - periodLength)

        const previousAmountResult = await prisma.donation.aggregate({
            where: {
                createdAt: { gte: previousStartDate, lt: startDate },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        })

        const previousAmount = previousAmountResult._sum.amount || 0
        const monthlyGrowth = previousAmount > 0 ? ((totalAmount - previousAmount) / previousAmount) * 100 : 0

        const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0

        // Get top campaigns
        const topCampaigns = await prisma.campaign.findMany({
            include: {
                _count: { select: { donations: true } },
                donations: {
                    where: { status: 'COMPLETED' },
                    select: { amount: true }
                }
            },
            orderBy: { raisedAmount: 'desc' },
            take: 5
        })

        const topCampaignsFormatted = topCampaigns.map(campaign => ({
            id: campaign.id,
            title: campaign.title,
            amount: campaign.raisedAmount,
            donationCount: campaign._count.donations
        }))

        // Get monthly data (last 6 months)
        const monthlyData = []
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
            
            const monthDonations = await prisma.donation.count({
                where: {
                    createdAt: { gte: monthStart, lte: monthEnd },
                    status: 'COMPLETED'
                }
            })

            const monthAmountResult = await prisma.donation.aggregate({
                where: {
                    createdAt: { gte: monthStart, lte: monthEnd },
                    status: 'COMPLETED'
                },
                _sum: { amount: true }
            })

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                amount: monthAmountResult._sum.amount || 0,
                donations: monthDonations
            })
        }

        // Get payment methods stats
        const paymentMethodsData = await prisma.donation.groupBy({
            by: ['paymentMethod'],
            where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            },
            _count: { paymentMethod: true }
        })

        const paymentMethods = paymentMethodsData.map(method => ({
            method: method.paymentMethod,
            count: method._count.paymentMethod,
            percentage: Math.round((method._count.paymentMethod / totalDonations) * 100) || 0
        }))

        // Donor insights
        const newDonors = await prisma.donation.count({
            where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED',
                // This is a simple approximation - in reality you'd track donor registration dates
            }
        })

        const returningDonors = totalDonors - newDonors
        const averagePerDonor = totalDonors > 0 ? totalAmount / totalDonors : 0

        const analytics = {
            totalDonations,
            totalAmount,
            totalDonors,
            activeCampaigns,
            monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
            averageDonation: Math.round(averageDonation),
            topCampaigns: topCampaignsFormatted,
            monthlyData,
            paymentMethods,
            donorInsights: {
                newDonors: Math.max(0, newDonors),
                returningDonors: Math.max(0, returningDonors),
                averagePerDonor: Math.round(averagePerDonor)
            }
        }

        return NextResponse.json({ success: true, analytics })
    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        )
    }
}
