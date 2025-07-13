'use client'

import { useState, useEffect } from 'react'
import { QrCode, Heart, Users, Target, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import { useApp } from './contexts/AppContext'
import ThemeLanguageToggle from './components/ThemeLanguageToggle'

interface Campaign {
    id: string
    title: string
    description: string
    targetAmount?: number
    raisedAmount?: number
    isActive: boolean
}

interface SiteSettings {
    mosqueName: string
    description: string
    address: string
    contactPhone: string
    contactEmail: string
    website: string
    logoUrl?: string
    bannerUrl?: string
    primaryColor: string
    secondaryColor: string
    facebookUrl?: string
    twitterUrl?: string
    instagramUrl?: string
    youtubeUrl?: string
    minimumDonationAmount: number
    defaultAmounts: number[]
    allowAnonymousDonations: boolean
}

export default function HomePage() {
    const { t } = useApp()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [campaignsRes, settingsRes] = await Promise.all([
                fetch('/api/campaigns'),
                fetch('/api/settings')
            ])

            if (campaignsRes.ok) {
                const campaignsData = await campaignsRes.json()
                setCampaigns(campaignsData.campaigns)
            }

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setSettings(settingsData.settings)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center flex-1">
                            {settings?.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt="Logo"
                                    className="h-12 w-12 mr-3 rounded-full object-cover"
                                />
                            )}
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {settings?.mosqueName || 'Central Mosque'}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">{t('header.title')}</p>
                            </div>
                        </div>
                        <div className="ml-4">
                            <ThemeLanguageToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner Section */}
            {settings?.bannerUrl && (
                <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${settings.bannerUrl})` }}>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <h2 className="text-2xl font-bold mb-2">{settings.mosqueName}</h2>
                            <p className="text-lg">{settings.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 text-white rounded-full mb-6"
                        style={{ backgroundColor: settings?.primaryColor || '#1f2937' }}
                    >
                        <Heart className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('header.supportcommunity')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        {settings?.description || 'Your donations help maintain our mosque, support community programs, and assist those in need. Every contribution makes a meaningful difference.'}
                    </p>
                </div>

                {/* Contact Info */}
                {settings && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">{settings.address}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <Phone className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">{settings.contactPhone}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <Mail className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">{settings.contactEmail}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <Globe className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                            <a href={settings.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Visit Website
                            </a>
                        </div>
                    </div>
                )}

                {/* QR Code Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <QrCode className="w-20 h-20 text-gray-700 dark:text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('scan.donate')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('scan.description')}
                    </p>
                    {settings?.minimumDonationAmount && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {t('amount.minimum')}: ৳{settings.minimumDonationAmount}
                        </p>
                    )}
                    <Link
                        href="/donate"
                        className="inline-block text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-colors"
                        style={{ backgroundColor: settings?.primaryColor || '#1f2937' }}
                    >
                        {t('donate.now')}
                    </Link>
                </div>

                {/* Active Campaigns */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Active Campaigns
                    </h3>

                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : campaigns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {campaigns.filter(c => c.isActive).map((campaign) => {
                                const progress = campaign.targetAmount && campaign.raisedAmount
                                    ? Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)
                                    : 0

                                return (
                                    <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{campaign.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{campaign.description}</p>

                                        {campaign.targetAmount && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2 font-bold">
                                                    <span>{t('campaign.raised')}: ৳{(campaign.raisedAmount || 0).toLocaleString()}</span>
                                                    <span>{t('campaign.target')}: ৳{campaign.targetAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                                    <div
                                                        className="h-3 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${progress}%`,
                                                            backgroundColor: settings?.secondaryColor || '#059669'
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {progress.toFixed(1)}% {t('campaign.completed')}
                                                </div>
                                            </div>
                                        )}

                                        <Link
                                            href={`/donate?campaign=${campaign.id}`}
                                            className="inline-block px-4 py-2 rounded text-sm font-medium transition-colors"
                                            style={{
                                                backgroundColor: settings?.secondaryColor || '#059669',
                                                color: 'white'
                                            }}
                                        >
                                            Donate to This Campaign
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No active campaigns at the moment</p>
                        </div>
                    )}
                </div>

                {/* Social Media Links */}
                {settings && (settings.facebookUrl || settings.twitterUrl || settings.instagramUrl || settings.youtubeUrl) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Follow Us</h3>
                        <div className="flex justify-center space-x-4">
                            {settings.facebookUrl && (
                                <a
                                    href={settings.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full hover:opacity-80 transition-colors"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    <Facebook className="w-5 h-5 text-white" />
                                </a>
                            )}
                            {settings.twitterUrl && (
                                <a
                                    href={settings.twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full hover:opacity-80 transition-colors"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    <Twitter className="w-5 h-5 text-white" />
                                </a>
                            )}
                            {settings.instagramUrl && (
                                <a
                                    href={settings.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full hover:opacity-80 transition-colors"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    <Instagram className="w-5 h-5 text-white" />
                                </a>
                            )}
                            {settings.youtubeUrl && (
                                <a
                                    href={settings.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full hover:opacity-80 transition-colors"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    <Youtube className="w-5 h-5 text-white" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} {settings?.mosqueName || 'Central Mosque'}.
                        {t('footer.rights')}
                    </p>
                    <Link
                        href="/admin"
                        className="text-gray-400 dark:text-gray-500 text-xs hover:text-gray-600 dark:hover:text-gray-300 mt-2 inline-block"
                    >
                        {t('admin.access')}
                    </Link>
                </div>
            </main>
        </div>
    )
}
