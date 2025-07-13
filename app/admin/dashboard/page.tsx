'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import {
    BarChart3,
    DollarSign,
    Users,
    Calendar,
    Download,
    Plus,
    Eye,
    Filter,
    Target,
    LogOut
} from 'lucide-react'

interface DashboardStats {
    totalDonations: number
    totalAmount: number
    totalDonors: number
    monthlyAmount: number
}

interface Donation {
    id: string
    amount: number
    donorName?: string
    donorPhone?: string
    paymentMethod: string
    status: string
    createdAt: string
    campaign: {
        title: string
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats>({
        totalDonations: 0,
        totalAmount: 0,
        totalDonors: 0,
        monthlyAmount: 0
    })
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, donationsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/donations')
            ])

            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData.stats)
            }

            if (donationsRes.ok) {
                const donationsData = await donationsRes.json()
                setDonations(donationsData.donations)
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' })
            router.push('/admin')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const exportDonations = () => {
        // Simple CSV export
        const headers = ['Date', 'Amount', 'Donor', 'Phone', 'Method', 'Campaign', 'Status']
        const csvData = donations.map(d => [
            new Date(d.createdAt).toLocaleDateString(),
            d.amount,
            d.donorName || 'Anonymous',
            d.donorPhone || '',
            d.paymentMethod,
            d.campaign.title,
            d.status
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const filteredDonations = donations.filter(d => {
        if (filter === 'all') return true
        if (filter === 'completed') return d.status === 'COMPLETED'
        if (filter === 'pending') return d.status === 'PENDING'
        if (filter === 'failed') return d.status === 'FAILED'
        return true
    })

    if (loading) {
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
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Mosque donation management overview</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => router.push('/admin/campaigns')}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Campaign
                        </button>
                        <button
                            onClick={exportDonations}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ৳{stats.totalAmount.toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Donations</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Donors</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDonors}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ৳{stats.monthlyAmount.toLocaleString()}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
                            <div className="flex space-x-3">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                                <button
                                    onClick={exportDonations}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(donation.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ৳{donation.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {donation.donorName || 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {donation.campaign.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {donation.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${donation.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-800'
                                                : donation.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDonations.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No donations found
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
