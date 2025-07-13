'use client'

import { useState, useEffect } from 'react'
import { XCircle, Home, RefreshCw, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function DonationFailedPage() {
    const searchParams = useSearchParams()
    const donationId = searchParams.get('id')
    const error = searchParams.get('error')
    const amount = searchParams.get('amount')
    const method = searchParams.get('method')
    const [updating, setUpdating] = useState(true)

    const isDemo = error === 'demo_mode'

    useEffect(() => {
        if (donationId) {
            updateDonationStatus()
        } else {
            setUpdating(false)
        }
    }, [donationId])

    const updateDonationStatus = async () => {
        try {
            // Update the donation status to FAILED
            await fetch(`/api/donations/${donationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'FAILED'
                }),
            })
        } catch (error) {
            console.error('Error updating donation status:', error)
        } finally {
            setUpdating(false)
        }
    }

    if (updating) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${isDemo ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-red-50 to-pink-50'} flex items-center justify-center`}>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    {isDemo ? (
                        <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    )}
                    <h1 className={`text-2xl font-bold ${isDemo ? 'text-yellow-900' : 'text-red-900'} mb-2`}>
                        {isDemo ? 'Demo Payment' : 'Payment Failed'}
                    </h1>
                    <p className="text-gray-600">
                        {isDemo
                            ? "This is a demo transaction - no actual payment was processed"
                            : "We couldn't process your donation at this time"
                        }
                    </p>
                </div>

                {/* Transaction Details */}
                {(amount || method) && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h2 className="font-semibold text-gray-900 mb-3">Transaction Details</h2>
                        <div className="space-y-2">
                            {amount && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold">৳{Number(amount).toLocaleString()}</span>
                                </div>
                            )}
                            {method && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium">{method}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${isDemo ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {isDemo ? 'Demo Mode' : 'Failed'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`${isDemo ? 'bg-yellow-50' : 'bg-red-50'} p-4 rounded-lg mb-6`}>
                    <h2 className={`font-semibold ${isDemo ? 'text-yellow-900' : 'text-red-900'} mb-2`}>
                        {isDemo ? 'Demo Mode Information' : 'What happened?'}
                    </h2>
                    {isDemo ? (
                        <p className="text-yellow-800 text-sm">
                            This donation platform is running in demo mode. To process real payments, configure your SSLCommerz credentials in the environment variables.
                        </p>
                    ) : (
                        <ul className="text-red-800 text-sm space-y-1">
                            <li>• Payment was cancelled or declined</li>
                            <li>• Network connection issue</li>
                            <li>• Insufficient balance</li>
                            <li>• Technical error occurred</li>
                        </ul>
                    )}
                </div>

                <div className="space-y-3">
                    <Link
                        href="/donate"
                        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Return to Home
                    </Link>
                </div>

                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600 text-sm text-center">
                        If you continue to experience issues, please contact the mosque administration
                        for assistance with your donation.
                    </p>
                </div>
            </div>
        </div>
    )
}
