'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar, BarChart3, PieChart } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

interface AnalyticsData {
    totalDonations: number
    totalAmount: number
    totalDonors: number
    activeCampaigns: number
    monthlyGrowth: number
    averageDonation: number
    topCampaigns: Array<{
        id: string
        title: string
        amount: number
        donationCount: number
    }>
    monthlyData: Array<{
        month: string
        amount: number
        donations: number
    }>
    paymentMethods: Array<{
        method: string
        count: number
        percentage: number
    }>
    donorInsights: {
        newDonors: number
        returningDonors: number
        averagePerDonor: number
    }
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        fetchAnalytics()
    }, [timeRange])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
            if (response.ok) {
                const data = await response.json()
                setAnalytics(data.analytics)
            } else {
                console.error('Failed to fetch analytics')
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !analytics) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-900"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-600">Donation insights and performance metrics</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ৳{analytics.totalAmount.toLocaleString()}
                                </p>
                                <div className="flex items-center mt-2">
                                    {analytics.monthlyGrowth >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`text-sm ${analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(analytics.monthlyGrowth)}% vs last period
                                    </span>
                                </div>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalDonations}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Avg: ৳{analytics.averageDonation.toLocaleString()}
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Donors</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalDonors}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {analytics.donorInsights.newDonors} new this period
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.activeCampaigns}</p>
                                <p className="text-sm text-gray-500 mt-2">Currently running</p>
                            </div>
                            <Target className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trends */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                        <div className="space-y-4">
                            {analytics.monthlyData.map((month, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            ৳{month.amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {month.donations} donations
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                        <div className="space-y-4">
                            {analytics.paymentMethods.map((method, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <PieChart className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">{method.method}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${method.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {method.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Campaigns */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount Raised
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donations
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg Donation
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.topCampaigns.map((campaign, index) => (
                                    <tr key={campaign.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {campaign.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ৳{campaign.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {campaign.donationCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ৳{Math.round(campaign.amount / campaign.donationCount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Donor Insights */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {analytics.donorInsights.newDonors}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">New Donors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {analytics.donorInsights.returningDonors}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Returning Donors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                ৳{analytics.donorInsights.averagePerDonor.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Average per Donor</div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
