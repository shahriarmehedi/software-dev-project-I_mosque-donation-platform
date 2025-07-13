import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        // Get settings from database
        let settings = await prisma.siteSettings.findFirst()
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {} // Use schema defaults
            })
        }
        
        // Return only public settings needed for the homepage
        const publicSettings = {
            mosqueName: settings.mosqueName,
            description: settings.description,
            address: settings.address,
            contactPhone: settings.contactPhone,
            contactEmail: settings.contactEmail,
            website: settings.website,
            logoUrl: settings.logoUrl,
            bannerUrl: settings.bannerUrl,
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            facebookUrl: settings.facebookUrl,
            twitterUrl: settings.twitterUrl,
            instagramUrl: settings.instagramUrl,
            youtubeUrl: settings.youtubeUrl,
            minimumDonationAmount: settings.minimumDonationAmount,
            defaultAmounts: settings.defaultAmounts.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a)),
            allowAnonymousDonations: settings.allowAnonymousDonations
        }

        return NextResponse.json({ 
            success: true, 
            settings: publicSettings 
        })
    } catch (error) {
        console.error('Settings fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}
