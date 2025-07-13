'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, Eye, EyeOff, Building, Mail, Phone, MapPin, Globe, Palette, Bell } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

interface MosqueSettings {
    name: string
    description: string
    address: string
    phone: string
    email: string
    website: string
    logoUrl?: string
    bannerUrl?: string
    primaryColor: string
    secondaryColor: string
    enableNotifications: boolean
    paymentMethods: {
        sslcommerz: {
            enabled: boolean
            storeId: string
            storePassword: string
            isLive: boolean
        }
        bankTransfer: {
            enabled: boolean
            accountName: string
            accountNumber: string
            bankName: string
            routingNumber: string
        }
    }
    socialMedia: {
        facebook?: string
        twitter?: string
        instagram?: string
        youtube?: string
    }
    donationSettings: {
        minimumAmount: number
        defaultAmounts: number[]
        allowAnonymous: boolean
        requirePhone: boolean
        requireEmail: boolean
    }
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<MosqueSettings>({
        name: 'Baitul Mukaram Mosque',
        description: 'A community mosque serving the local Islamic community',
        address: 'Dhaka, Bangladesh',
        phone: '+880 1234 567890',
        email: 'info@mosque.com',
        website: 'https://mosque.com',
        primaryColor: '#1f2937',
        secondaryColor: '#059669',
        enableNotifications: true,
        paymentMethods: {
            sslcommerz: {
                enabled: true,
                storeId: '',
                storePassword: '',
                isLive: false
            },
            bankTransfer: {
                enabled: true,
                accountName: 'Mosque Fund',
                accountNumber: '',
                bankName: '',
                routingNumber: ''
            }
        },
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: ''
        },
        donationSettings: {
            minimumAmount: 10,
            defaultAmounts: [50, 100, 500, 1000, 5000],
            allowAnonymous: true,
            requirePhone: false,
            requireEmail: false
        }
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const [showPasswords, setShowPasswords] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings({ ...settings, ...data.settings })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                alert('Settings saved successfully!')
            } else {
                alert('Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const updateSettings = (section: string, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof MosqueSettings] as any),
                [field]: value
            }
        }))
    }

    const updateNestedSettings = (section: string, subsection: string, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof MosqueSettings] as any),
                [subsection]: {
                    ...((prev[section as keyof MosqueSettings] as any)[subsection] as any),
                    [field]: value
                }
            }
        }))
    }

    const tabs = [
        { id: 'general', name: 'General', icon: Building },
        { id: 'payments', name: 'Payments', icon: Palette },
        { id: 'donations', name: 'Donations', icon: Bell },
        { id: 'appearance', name: 'Appearance', icon: Palette }
    ]

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
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600">Manage mosque settings and preferences</p>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Mosque Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mosque Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.name}
                                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.email}
                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={settings.phone}
                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.website}
                                                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Logo URL
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.logoUrl || ''}
                                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                                placeholder="https://example.com/logo.png"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                URL for your mosque logo (recommended size: 64x64px)
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Banner URL
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.bannerUrl || ''}
                                                onChange={(e) => setSettings({ ...settings, bannerUrl: e.target.value })}
                                                placeholder="https://example.com/banner.jpg"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                URL for homepage banner image (recommended size: 1200x400px)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={settings.description}
                                            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <textarea
                                            value={settings.address}
                                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Facebook
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia.facebook || ''}
                                                onChange={(e) => updateSettings('socialMedia', 'facebook', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Twitter
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia.twitter || ''}
                                                onChange={(e) => updateSettings('socialMedia', 'twitter', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instagram
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia.instagram || ''}
                                                onChange={(e) => updateSettings('socialMedia', 'instagram', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                YouTube
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia.youtube || ''}
                                                onChange={(e) => updateSettings('socialMedia', 'youtube', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Settings */}
                        {activeTab === 'payments' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">SSLCommerz Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.paymentMethods.sslcommerz.enabled}
                                                onChange={(e) => updateNestedSettings('paymentMethods', 'sslcommerz', 'enabled', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Enable SSLCommerz payments
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Store ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.paymentMethods.sslcommerz.storeId}
                                                    onChange={(e) => updateNestedSettings('paymentMethods', 'sslcommerz', 'storeId', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Store Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords ? 'text' : 'password'}
                                                        value={settings.paymentMethods.sslcommerz.storePassword}
                                                        onChange={(e) => updateNestedSettings('paymentMethods', 'sslcommerz', 'storePassword', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords(!showPasswords)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    >
                                                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.paymentMethods.sslcommerz.isLive}
                                                onChange={(e) => updateNestedSettings('paymentMethods', 'sslcommerz', 'isLive', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Live mode (uncheck for sandbox)
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.paymentMethods.bankTransfer.enabled}
                                                onChange={(e) => updateNestedSettings('paymentMethods', 'bankTransfer', 'enabled', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Enable bank transfer donations
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.paymentMethods.bankTransfer.accountName}
                                                    onChange={(e) => updateNestedSettings('paymentMethods', 'bankTransfer', 'accountName', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.paymentMethods.bankTransfer.accountNumber}
                                                    onChange={(e) => updateNestedSettings('paymentMethods', 'bankTransfer', 'accountNumber', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bank Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.paymentMethods.bankTransfer.bankName}
                                                    onChange={(e) => updateNestedSettings('paymentMethods', 'bankTransfer', 'bankName', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Routing Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.paymentMethods.bankTransfer.routingNumber}
                                                    onChange={(e) => updateNestedSettings('paymentMethods', 'bankTransfer', 'routingNumber', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Donation Settings */}
                        {activeTab === 'donations' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Rules</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Minimum Donation Amount (৳)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.donationSettings.minimumAmount}
                                                onChange={(e) => updateSettings('donationSettings', 'minimumAmount', Number(e.target.value))}
                                                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Default Donation Amounts (৳)
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.donationSettings.defaultAmounts.join(', ')}
                                                onChange={(e) => updateSettings('donationSettings', 'defaultAmounts', e.target.value.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)))}
                                                placeholder="50, 100, 500, 1000, 5000"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Separate amounts with commas</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Donor Requirements</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.donationSettings.allowAnonymous}
                                                onChange={(e) => updateSettings('donationSettings', 'allowAnonymous', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Allow anonymous donations
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.donationSettings.requirePhone}
                                                onChange={(e) => updateSettings('donationSettings', 'requirePhone', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Require phone number
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.donationSettings.requireEmail}
                                                onChange={(e) => updateSettings('donationSettings', 'requireEmail', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Require email address
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Primary Color
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="color"
                                                    value={settings.primaryColor}
                                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.primaryColor}
                                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Secondary Color
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="color"
                                                    value={settings.secondaryColor}
                                                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.secondaryColor}
                                                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNotifications}
                                            onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Enable email notifications for new donations
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
