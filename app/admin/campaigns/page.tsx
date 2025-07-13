'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar, Target, DollarSign, Users } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

interface Campaign {
    id: string
    title: string
    description: string
    targetAmount: number
    raisedAmount: number
    isActive: boolean
    createdAt: string
    _count: {
        donations: number
    }
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuthAndLoadData()
    }, [])

    const checkAuthAndLoadData = async () => {
        try {
            // Check authentication first
            const authResponse = await fetch('/api/admin/me')
            if (authResponse.ok) {
                setIsAuthenticated(true)
                setAuthLoading(false)
                // Only fetch campaigns if authenticated
                await fetchCampaigns()
            } else {
                // Not authenticated, AdminLayout will handle redirect
                setAuthLoading(false)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setAuthLoading(false)
        }
    }

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/admin/campaigns')
            if (response.ok) {
                const data = await response.json()
                setCampaigns(data.campaigns)
            } else {
                console.error('Failed to fetch campaigns')
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCampaign = () => {
        setEditingCampaign(null)
        setShowCreateModal(true)
    }

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign)
        setShowCreateModal(true)
    }

    const handleDeleteCampaign = async (campaignId: string) => {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setCampaigns(campaigns.filter(c => c.id !== campaignId))
            } else {
                alert('Error deleting campaign')
            }
        } catch (error) {
            console.error('Error deleting campaign:', error)
            alert('Error deleting campaign')
        }
    }

    const handleToggleStatus = async (campaignId: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !isActive })
            })

            if (response.ok) {
                setCampaigns(campaigns.map(c =>
                    c.id === campaignId ? { ...c, isActive: !isActive } : c
                ))
            }
        } catch (error) {
            console.error('Error updating campaign status:', error)
        }
    }

    const getProgressPercentage = (raised: number, target: number) => {
        return Math.min((raised / target) * 100, 100)
    }

    if (authLoading || loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {authLoading ? 'Checking authentication...' : 'Loading campaigns...'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Auth: {isAuthenticated ? 'Yes' : 'No'} |
                            AuthLoading: {authLoading ? 'Yes' : 'No'} |
                            Loading: {loading ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (!isAuthenticated) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-gray-600">Not authenticated - AdminLayout should redirect...</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Auth: {isAuthenticated ? 'Yes' : 'No'} |
                            AuthLoading: {authLoading ? 'Yes' : 'No'}
                        </p>
                    </div>
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
                        <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
                        <p className="text-gray-600">Create and manage donation campaigns</p>
                    </div>
                    <button
                        onClick={handleCreateCampaign}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Campaign
                    </button>
                </div>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                        {campaign.title}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${campaign.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {campaign.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {campaign.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm text-gray-500">
                                            {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-gray-600">
                                            ৳{campaign.raisedAmount.toLocaleString()} raised
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Goal: ৳{campaign.targetAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {campaign._count.donations} completed donations
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditCampaign(campaign)}
                                        className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(campaign.id, campaign.isActive)}
                                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center ${campaign.isActive
                                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        {campaign.isActive ? 'Deactivate' : 'Activate'}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                        className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {campaigns.length === 0 && (
                    <div className="text-center py-12">
                        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                        <p className="text-gray-600 mb-4">Create your first campaign to start accepting donations</p>
                        <button
                            onClick={handleCreateCampaign}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Create Campaign
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CampaignModal
                    campaign={editingCampaign}
                    onClose={() => setShowCreateModal(false)}
                    onSave={() => {
                        setShowCreateModal(false)
                        if (isAuthenticated) {
                            fetchCampaigns()
                        }
                    }}
                />
            )}
        </AdminLayout>
    )
}

// Campaign Create/Edit Modal Component
function CampaignModal({
    campaign,
    onClose,
    onSave
}: {
    campaign: Campaign | null
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        title: campaign?.title || '',
        description: campaign?.description || '',
        targetAmount: campaign?.targetAmount || 0,
        isActive: campaign?.isActive ?? true
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = campaign
                ? `/api/admin/campaigns/${campaign.id}`
                : '/api/admin/campaigns'

            const method = campaign ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    targetAmount: Number(formData.targetAmount)
                })
            })

            if (response.ok) {
                onSave()
            } else {
                alert('Error saving campaign')
            }
        } catch (error) {
            console.error('Error saving campaign:', error)
            alert('Error saving campaign')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {campaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campaign Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                            placeholder="Enter campaign title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                            placeholder="Describe the campaign purpose and goals"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Amount (৳) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Campaign is active and accepting donations
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
