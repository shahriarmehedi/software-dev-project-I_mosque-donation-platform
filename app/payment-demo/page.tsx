'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, CreditCard, Smartphone } from 'lucide-react'

export default function PaymentDemoPage() {
    const searchParams = useSearchParams()
    const donationId = searchParams.get('donationId')
    const amount = searchParams.get('amount')
    const method = searchParams.get('method')

    const [processing, setProcessing] = useState(false)

    const simulatePayment = async (success: boolean) => {
        setProcessing(true)

        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 2000))

        if (success) {
            // Simulate successful payment
            window.location.href = `/donation-success?id=${donationId}`
        } else {
            // Simulate failed payment
            window.location.href = `/donation-failed?id=${donationId}`
        }
    }

    const getMethodIcon = () => {
        switch (method) {
            case 'BKASH':
                return <Smartphone className="w-8 h-8 text-pink-600" />
            case 'NAGAD':
                return <Smartphone className="w-8 h-8 text-orange-600" />
            case 'card':
                return <CreditCard className="w-8 h-8 text-gray-600" />
            default:
                return <CreditCard className="w-8 h-8 text-gray-600" />
        }
    }

    if (processing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
                    <p className="text-gray-600">Please wait while we process your payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    {getMethodIcon()}
                    <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Payment Gateway Demo</h1>
                    <p className="text-gray-600">This is a demo payment interface</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-lg">৳{amount}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono text-sm">{donationId?.slice(-8)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => simulatePayment(true)}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Simulate Successful Payment
                    </button>

                    <button
                        onClick={() => simulatePayment(false)}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        Simulate Failed Payment
                    </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> This is a demo interface for testing purposes.
                        In production, this would redirect to the actual SSLCommerz payment gateway.
                    </p>
                </div>
            </div>
        </div>
    )
}
