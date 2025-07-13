'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useApp } from '../contexts/AppContext'
import ThemeLanguageToggle from '../components/ThemeLanguageToggle'

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
    minimumDonationAmount: number
    defaultAmounts: number[]
    allowAnonymousDonations: boolean
    primaryColor: string
    secondaryColor: string
}

export default function DonatePage() {
    const searchParams = useSearchParams()
    const campaignId = searchParams.get('campaign')
    const { t } = useApp()

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [selectedCampaign, setSelectedCampaign] = useState<string>('')
    const [amount, setAmount] = useState<string>('')
    const [customAmount, setCustomAmount] = useState<string>('')
    const [useCustomAmount, setUseCustomAmount] = useState(false)
    const [donorName, setDonorName] = useState<string>('')
    const [donorPhone, setDonorPhone] = useState<string>('')
    const [donorEmail, setDonorEmail] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'INTERNET_BANKING' | 'MOBILE_BANKING' | 'DIGITAL_WALLET'>('CREDIT_CARD')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (campaignId && campaigns.length > 0) {
            setSelectedCampaign(campaignId)
        }
    }, [campaignId, campaigns])

    const fetchData = async () => {
        try {
            const [campaignsRes, settingsRes] = await Promise.all([
                fetch('/api/campaigns'),
                fetch('/api/settings')
            ])

            if (campaignsRes.ok) {
                const campaignsData = await campaignsRes.json()
                setCampaigns(campaignsData.campaigns.filter((c: Campaign) => c.isActive))
            }

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setSettings(settingsData.settings)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const handleAmountSelect = (selectedAmount: number) => {
        setAmount(selectedAmount.toString())
        setUseCustomAmount(false)
        setCustomAmount('')
    }

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value)
        setAmount(value)
        setUseCustomAmount(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const finalAmount = parseFloat(amount)
        const minAmount = settings?.minimumDonationAmount || 10

        if (!selectedCampaign || !amount || finalAmount <= 0) {
            alert(t('alert.selectcampaign'))
            return
        }

        if (finalAmount < minAmount) {
            alert(`${t('alert.minimumamount')} ৳${minAmount}`)
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/donations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaignId: selectedCampaign,
                    amount: finalAmount,
                    donorName: donorName || undefined,
                    donorPhone: donorPhone || undefined,
                    donorEmail: donorEmail || undefined,
                    paymentMethod,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                // Redirect to payment gateway
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl
                } else {
                    alert(t('alert.paymentfailed'))
                }
            } else {
                alert(t('alert.failed'))
            }
        } catch (error) {
            console.error('Error creating donation:', error)
            alert(t('alert.error'))
        } finally {
            setLoading(false)
        }
    }

    const finalAmount = useCustomAmount ? customAmount : amount

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('header.makedonation')}</h1>
                        </div>
                        <ThemeLanguageToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Campaign Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('campaign.select')}</h2>
                        <div className="space-y-4">
                            <select
                                value={selectedCampaign}
                                onChange={(e) => setSelectedCampaign(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-gray-900 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">{t('campaign.choose')}</option>
                                {campaigns.map((campaign) => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.title}
                                        {campaign.targetAmount && ` - ${t('campaign.target')}: ৳${campaign.targetAmount.toLocaleString()}`}
                                    </option>
                                ))}
                            </select>

                            {/* Show selected campaign details */}
                            {selectedCampaign && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    {(() => {
                                        const campaign = campaigns.find(c => c.id === selectedCampaign)
                                        if (!campaign) return null

                                        return (
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{campaign.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{campaign.description}</p>
                                                {campaign.targetAmount && (
                                                    <div className="flex items-center justify-between text-sm font-bold">
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {t('campaign.target')}: ৳{campaign.targetAmount.toLocaleString()}
                                                        </span>
                                                        {campaign.raisedAmount !== undefined && (
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {t('campaign.raised')}: ৳{campaign.raisedAmount.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {campaign.targetAmount && campaign.raisedAmount !== undefined && (
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%`,
                                                                    backgroundColor: settings?.secondaryColor || '#059669'
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {((campaign.raisedAmount / campaign.targetAmount) * 100).toFixed(1)}% {t('campaign.completed')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('amount.title')}</h2>

                        {/* Preset Amounts */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {(settings?.defaultAmounts || [100, 500, 1000, 2000, 5000]).map((presetAmount) => (
                                <button
                                    key={presetAmount}
                                    type="button"
                                    onClick={() => handleAmountSelect(presetAmount)}
                                    className={`p-3 rounded-lg border text-center font-medium transition-colors ${amount === presetAmount.toString() && !useCustomAmount
                                        ? 'border-gray-900 dark:border-gray-300 bg-gray-900 dark:bg-gray-300 text-white dark:text-gray-900'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                    style={{
                                        borderColor: amount === presetAmount.toString() && !useCustomAmount
                                            ? settings?.primaryColor || '#1f2937'
                                            : undefined,
                                        backgroundColor: amount === presetAmount.toString() && !useCustomAmount
                                            ? settings?.primaryColor || '#1f2937'
                                            : undefined
                                    }}
                                >
                                    ৳{presetAmount.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('amount.custom')}
                            </label>
                            <input
                                type="number"
                                min={settings?.minimumDonationAmount || 10}
                                step="1"
                                value={customAmount}
                                onChange={(e) => handleCustomAmountChange(e.target.value)}
                                placeholder={`${t('amount.enter')} ৳${settings?.minimumDonationAmount || 10})`}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-gray-900 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Donor Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {t('donor.title')} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('donor.optional')}</span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('donor.name')}</label>
                                <input
                                    type="text"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    placeholder={t('donor.nameplaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-gray-900 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('donor.email')}</label>
                                <input
                                    type="email"
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    placeholder={t('donor.emailplaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-gray-900 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('donor.phone')}</label>
                                <input
                                    type="tel"
                                    value={donorPhone}
                                    onChange={(e) => setDonorPhone(e.target.value)}
                                    placeholder={t('donor.phoneplaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-gray-900 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('payment.title')}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('payment.secure')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CREDIT_CARD')}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === 'CREDIT_CARD'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-medium">{t('payment.creditcard')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('payment.visa')}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('DEBIT_CARD')}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === 'DEBIT_CARD'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-medium">{t('payment.debitcard')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('payment.local')}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('INTERNET_BANKING')}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === 'INTERNET_BANKING'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-medium">{t('payment.netbanking')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('payment.banks')}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('MOBILE_BANKING')}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === 'MOBILE_BANKING'
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-medium">{t('payment.mobilebanking')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('payment.mobile')}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('DIGITAL_WALLET')}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === 'DIGITAL_WALLET'
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-medium">{t('payment.digitalwallet')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('payment.various')}</div>
                            </button>
                        </div>
                    </div>

                    {/* Summary and Submit */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('summary.title')}</h2>
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">{t('summary.amount')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">৳{finalAmount || '0'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">{t('summary.method')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{paymentMethod}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedCampaign || !finalAmount || parseFloat(finalAmount || '0') <= 0}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading || !selectedCampaign || !finalAmount || parseFloat(finalAmount || '0') <= 0
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                                }`}
                        >
                            {loading ? t('summary.processing') : `${t('summary.donate')} ৳${finalAmount || '0'}`}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
