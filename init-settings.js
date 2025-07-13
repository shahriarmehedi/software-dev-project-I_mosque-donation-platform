const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initializeSettings() {
    try {
        console.log('🔧 Initializing site settings...')

        // Check if settings already exist
        const existingSettings = await prisma.siteSettings.findFirst()

        if (existingSettings) {
            console.log('✅ Settings already exist:', {
                id: existingSettings.id,
                mosqueName: existingSettings.mosqueName
            })
            return
        }

        // Create default settings
        const defaultSettings = await prisma.siteSettings.create({
            data: {
                mosqueName: 'Baitul Mukaram Mosque',
                description: 'A community mosque serving the local Islamic community with donations and community services',
                address: 'Dhaka, Bangladesh',
                contactPhone: '+880 1234 567890',
                contactEmail: 'info@mosque.com',
                website: 'https://mosque.com',

                // Payment settings
                sslcommerzEnabled: true,
                sslcommerzStoreId: process.env.SSLCOMMERZ_STORE_ID || '',
                sslcommerzStorePass: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
                sslcommerzIsLive: false,

                bankTransferEnabled: true,
                bankAccountName: 'Mosque Fund',
                bankAccountNumber: '1234567890',
                bankName: 'Example Bank',
                bankRoutingNumber: '123456789',

                // Donation settings
                minimumDonationAmount: 10,
                defaultAmounts: '50,100,500,1000,5000',
                allowAnonymousDonations: true,
                requirePhoneNumber: false,
                requireEmailAddress: false,

                // Appearance
                primaryColor: '#1f2937',
                secondaryColor: '#059669',
                enableNotifications: true
            }
        })

        console.log('✅ Default settings created:', {
            id: defaultSettings.id,
            mosqueName: defaultSettings.mosqueName,
            contactEmail: defaultSettings.contactEmail
        })

    } catch (error) {
        console.error('💥 Error initializing settings:', error)
    } finally {
        await prisma.$disconnect()
    }
}

initializeSettings()
