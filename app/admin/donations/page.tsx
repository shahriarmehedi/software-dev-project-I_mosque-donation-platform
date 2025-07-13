'use client'

import { useState, useEffect } from 'react'
import { Download, Filter, Eye, Search, Calendar, Plus, X } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

interface Donation {
    id: string
    amount: number
    donorName?: string
    donorPhone?: string
    donorEmail?: string
    paymentMethod: string
    status: string
    transactionId?: string
    createdAt: string
    campaign: {
        id: string
        title: string
    }
}

interface Campaign {
    id: string
    title: string
}

export default function DonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('all')
    const [showManualModal, setShowManualModal] = useState(false)
    const [manualLoading, setManualLoading] = useState(false)

    // Manual donation form state
    const [manualData, setManualData] = useState({
        campaignId: '',
        amount: '',
        donorName: '',
        donorPhone: '',
        donorEmail: '',
        paymentMethod: 'BANK_TRANSFER',
        notes: ''
    })

    useEffect(() => {
        fetchDonations()
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns')
            if (response.ok) {
                const data = await response.json()
                setCampaigns(data.campaigns || [])
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error)
        }
    }

    const fetchDonations = async () => {
        try {
            const response = await fetch('/api/admin/donations')
            if (response.ok) {
                const data = await response.json()
                setDonations(data.donations || [])
            } else {
                console.error('Failed to fetch donations')
            }
        } catch (error) {
            console.error('Error fetching donations:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportDonations = () => {
        const headers = ['Date', 'Amount', 'Donor', 'Phone', 'Email', 'Method', 'Campaign', 'Status', 'Transaction ID']
        const csvData = filteredDonations.map(d => [
            new Date(d.createdAt).toLocaleDateString(),
            d.amount,
            d.donorName || 'Anonymous',
            d.donorPhone || '',
            d.donorEmail || '',
            d.paymentMethod,
            d.campaign.title,
            d.status,
            d.transactionId || ''
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

    const handleManualDonation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!manualData.campaignId || !manualData.amount || parseFloat(manualData.amount) <= 0) {
            alert('Please select a campaign and enter a valid amount')
            return
        }

        setManualLoading(true)
        try {
            const response = await fetch('/api/admin/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(manualData),
            })

            if (response.ok) {
                const data = await response.json()
                alert('Manual donation added successfully!')
                setShowManualModal(false)
                resetManualForm()
                fetchDonations() // Refresh the list
            } else {
                const errorData = await response.json()
                alert(`Error: ${errorData.error || 'Failed to add donation'}`)
            }
        } catch (error) {
            console.error('Error adding manual donation:', error)
            alert('An error occurred while adding the donation')
        } finally {
            setManualLoading(false)
        }
    }

    const resetManualForm = () => {
        setManualData({
            campaignId: '',
            amount: '',
            donorName: '',
            donorPhone: '',
            donorEmail: '',
            paymentMethod: 'BANK_TRANSFER',
            notes: ''
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'FAILED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredDonations = donations.filter(donation => {
        // Status filter
        if (filter !== 'all' && donation.status.toLowerCase() !== filter) {
            return false
        }

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                donation.donorName?.toLowerCase().includes(searchLower) ||
                donation.donorPhone?.includes(searchTerm) ||
                donation.donorEmail?.toLowerCase().includes(searchLower) ||
                donation.campaign.title.toLowerCase().includes(searchLower) ||
                donation.transactionId?.toLowerCase().includes(searchLower)

            if (!matchesSearch) return false
        }

        // Date filter
        if (dateFilter !== 'all') {
            const donationDate = new Date(donation.createdAt)
            const now = new Date()

            switch (dateFilter) {
                case 'today':
                    return donationDate.toDateString() === now.toDateString()
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    return donationDate >= weekAgo
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    return donationDate >= monthAgo
                default:
                    return true
            }
        }

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
                        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
                        <p className="text-gray-600">View and manage all donations</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Manual Donation
                        </button>
                        <button
                            onClick={exportDonations}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search donations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none bg-white"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600">
                            Showing {filteredDonations.length} of {donations.length} donations
                        </div>
                    </div>
                </div>

                {/* Donations Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {donation.donorName || 'Anonymous'}
                                            </div>
                                            {donation.donorPhone && (
                                                <div className="text-sm text-gray-500">
                                                    {donation.donorPhone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {donation.campaign.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {donation.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDonations.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No donations found matching your criteria
                        </div>
                    )}
                </div>

                {/* Manual Donation Modal */}
                {showManualModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Add Manual Donation</h2>
                                <button
                                    onClick={() => {
                                        setShowManualModal(false)
                                        resetManualForm()
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleManualDonation} className="space-y-4">
                                {/* Campaign Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Campaign *
                                    </label>
                                    <select
                                        value={manualData.campaignId}
                                        onChange={(e) => setManualData(prev => ({ ...prev, campaignId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a campaign</option>
                                        {campaigns.map((campaign) => (
                                            <option key={campaign.id} value={campaign.id}>
                                                {campaign.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={manualData.amount}
                                        onChange={(e) => setManualData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                {/* Donor Information */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Donor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={manualData.donorName}
                                        onChange={(e) => setManualData(prev => ({ ...prev, donorName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Donor's name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={manualData.donorPhone}
                                        onChange={(e) => setManualData(prev => ({ ...prev, donorPhone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={manualData.donorEmail}
                                        onChange={(e) => setManualData(prev => ({ ...prev, donorEmail: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email address"
                                    />
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={manualData.paymentMethod}
                                        onChange={(e) => setManualData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CHECK">Check</option>
                                        <option value="MOBILE_BANKING">Mobile Banking</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={manualData.notes}
                                        onChange={(e) => setManualData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Additional notes about this donation"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowManualModal(false)
                                            resetManualForm()
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={manualLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {manualLoading ? 'Adding...' : 'Add Donation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
