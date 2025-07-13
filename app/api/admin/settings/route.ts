import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        requireAdmin(request)
        
        // Get settings from database
        let settings = await prisma.siteSettings.findFirst()
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {} // Use schema defaults
            })
        }
        
        // Transform to frontend format
        const formattedSettings = {
            name: settings.mosqueName,
            description: settings.description,
            address: settings.address,
            phone: settings.contactPhone,
            email: settings.contactEmail,
            website: settings.website,
            logoUrl: settings.logoUrl,
            bannerUrl: settings.bannerUrl,
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            enableNotifications: settings.enableNotifications,
            paymentMethods: {
                sslcommerz: {
                    enabled: settings.sslcommerzEnabled,
                    storeId: settings.sslcommerzStoreId || '',
                    storePassword: '***', // Never send actual password
                    isLive: settings.sslcommerzIsLive
                },
                bankTransfer: {
                    enabled: settings.bankTransferEnabled,
                    accountName: settings.bankAccountName,
                    accountNumber: settings.bankAccountNumber || '',
                    bankName: settings.bankName || '',
                    routingNumber: settings.bankRoutingNumber || ''
                }
            },
            socialMedia: {
                facebook: settings.facebookUrl || '',
                twitter: settings.twitterUrl || '',
                instagram: settings.instagramUrl || '',
                youtube: settings.youtubeUrl || ''
            },
            donationSettings: {
                minimumAmount: settings.minimumDonationAmount,
                defaultAmounts: settings.defaultAmounts.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a)),
                allowAnonymous: settings.allowAnonymousDonations,
                requirePhone: settings.requirePhoneNumber,
                requireEmail: settings.requireEmailAddress
            }
        }

        return NextResponse.json({ success: true, settings: formattedSettings })
    } catch (error) {
        console.error('Settings GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        requireAdmin(request)
        
        const formData = await request.json()
        
        // Get existing settings or create new
        let existingSettings = await prisma.siteSettings.findFirst()
        
        // Transform from frontend format to database format
        const updateData = {
            mosqueName: formData.name,
            description: formData.description,
            address: formData.address,
            contactPhone: formData.phone,
            contactEmail: formData.email,
            website: formData.website,
            logoUrl: formData.logoUrl,
            bannerUrl: formData.bannerUrl,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            enableNotifications: formData.enableNotifications,
            
            // Payment settings
            sslcommerzEnabled: formData.paymentMethods.sslcommerz.enabled,
            sslcommerzStoreId: formData.paymentMethods.sslcommerz.storeId,
            // Only update password if it's not the masked version
            ...(formData.paymentMethods.sslcommerz.storePassword !== '***' && {
                sslcommerzStorePass: formData.paymentMethods.sslcommerz.storePassword
            }),
            sslcommerzIsLive: formData.paymentMethods.sslcommerz.isLive,
            
            bankTransferEnabled: formData.paymentMethods.bankTransfer.enabled,
            bankAccountName: formData.paymentMethods.bankTransfer.accountName,
            bankAccountNumber: formData.paymentMethods.bankTransfer.accountNumber,
            bankName: formData.paymentMethods.bankTransfer.bankName,
            bankRoutingNumber: formData.paymentMethods.bankTransfer.routingNumber,
            
            // Social media
            facebookUrl: formData.socialMedia.facebook,
            twitterUrl: formData.socialMedia.twitter,
            instagramUrl: formData.socialMedia.instagram,
            youtubeUrl: formData.socialMedia.youtube,
            
            // Donation settings
            minimumDonationAmount: formData.donationSettings.minimumAmount,
            defaultAmounts: formData.donationSettings.defaultAmounts.join(','),
            allowAnonymousDonations: formData.donationSettings.allowAnonymous,
            requirePhoneNumber: formData.donationSettings.requirePhone,
            requireEmailAddress: formData.donationSettings.requireEmail
        }
        
        if (existingSettings) {
            await prisma.siteSettings.update({
                where: { id: existingSettings.id },
                data: updateData
            })
        } else {
            await prisma.siteSettings.create({
                data: updateData
            })
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' })
    } catch (error) {
        console.error('Settings PUT error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
