import { NextRequest, NextResponse } from 'next/server'
import { generateQRCodeBuffer } from '@/lib/qr-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const campaignId = searchParams.get('campaign')

    if (!url && !campaignId) {
      return NextResponse.json(
        { success: false, error: 'URL or campaign ID is required' },
        { status: 400 }
      )
    }

    // Generate the full donation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const donationUrl = url || `${baseUrl}/donate${campaignId ? `?campaign=${campaignId}` : ''}`

    // Generate QR code
    const qrCodeBuffer = await generateQRCodeBuffer(donationUrl)

    // Return QR code as image
    return new NextResponse(qrCodeBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
