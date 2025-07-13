'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Home, Download } from 'lucide-react'
import Link from 'next/link'

interface DonationDetails {
    id: string
    amount: number
    paymentMethod: string
    transactionId?: string
    donorName?: string
    campaign: {
        title: string
    }
    createdAt: string
}

export default function DonationSuccessPage() {
    const searchParams = useSearchParams()
    const donationId = searchParams.get('id')

    const [donation, setDonation] = useState<DonationDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (donationId) {
            updateDonationStatusAndFetch()
        }
    }, [donationId])

    const updateDonationStatusAndFetch = async () => {
        try {
            // First, update the donation status to COMPLETED
            const updateResponse = await fetch(`/api/donations/${donationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }),
            })

            if (updateResponse.ok) {
                // Then fetch the updated donation details
                const fetchResponse = await fetch(`/api/donations/${donationId}`)
                if (fetchResponse.ok) {
                    const data = await fetchResponse.json()
                    setDonation(data.donation)
                }
            }
        } catch (error) {
            console.error('Error fetching donation details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600">Thank you for your generous donation</p>
                </div>

                {donation && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
                        <h2 className="font-semibold text-gray-900 mb-3">Donation Details</h2>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">৳{donation.amount.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Campaign:</span>
                            <span className="font-medium text-right">{donation.campaign.title}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{donation.paymentMethod}</span>
                        </div>

                        {donation.transactionId && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-mono text-sm">{donation.transactionId}</span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">
                                {new Date(donation.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {donation.donorName && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Donor:</span>
                                <span className="font-medium">{donation.donorName}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Print Receipt
                    </button>

                    <Link
                        href="/"
                        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Return to Home
                    </Link>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm text-center">
                        May Allah accept your donation and bless you abundantly.
                        Your contribution helps support our community.
                    </p>
                </div>

                {/* Demo Mode Notice */}
                {donation?.transactionId?.startsWith('DEMO_') && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm text-center">
                            <strong>Demo Mode:</strong> This was a test transaction.
                            No actual payment was processed.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
