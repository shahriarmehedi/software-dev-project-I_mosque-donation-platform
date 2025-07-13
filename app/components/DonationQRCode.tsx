'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface DonationQRCodeProps {
    url: string
    size?: number
    className?: string
}

export default function DonationQRCode({ url, size = 180, className = '' }: DonationQRCodeProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    useEffect(() => {
        const generateQR = async () => {
            try {
                // Generate QR code with specific options for better URL recognition
                const qrCodeDataUrl = await QRCode.toDataURL(url, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M',
                    type: 'image/png'
                })
                setQrCodeUrl(qrCodeDataUrl)
            } catch (error) {
                console.error('Error generating QR code:', error)
            }
        }

        generateQR()
    }, [url, size])

    if (!qrCodeUrl) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 animate-pulse ${className}`}
                style={{ width: size, height: size }}
            >
                <div className="text-gray-400">Loading...</div>
            </div>
        )
    }

    return (
        <img
            src={qrCodeUrl}
            alt={`QR Code for ${url}`}
            className={className}
            style={{ width: size, height: size }}
        />
    )
}
