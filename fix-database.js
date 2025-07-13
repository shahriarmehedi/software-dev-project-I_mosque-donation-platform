const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixCampaignData() {
    console.log('Fixing campaign data...')

    try {
        // Update schema to allow null temporarily
        console.log('Step 1: Delete all campaigns to start fresh')

        // Delete all donations first (they reference campaigns)
        await prisma.donation.deleteMany({})
        console.log('Deleted all donations')

        // Delete all campaigns
        await prisma.campaign.deleteMany({})
        console.log('Deleted all campaigns')

        // Create fresh campaign data
        console.log('Step 2: Creating fresh campaign data')

        const campaigns = [
            {
                title: 'General Mosque Fund',
                description: 'Support the daily operations and maintenance of our mosque',
                targetAmount: 100000,
                raisedAmount: 15000,
                isActive: true
            },
            {
                title: 'Ramadan Iftar Program',
                description: 'Provide iftar meals for the community during Ramadan',
                targetAmount: 50000,
                raisedAmount: 8000,
                isActive: true
            },
            {
                title: 'Islamic Education Fund',
                description: 'Support Islamic education programs for children and adults',
                targetAmount: 25000,
                raisedAmount: 3500,
                isActive: true
            },
            {
                title: 'Support for Needy Families',
                description: 'Help families in need within our community',
                targetAmount: 75000,
                raisedAmount: 12000,
                isActive: true
            }
        ]

        for (const campaign of campaigns) {
            const created = await prisma.campaign.create({
                data: campaign
            })
            console.log(`Created campaign: ${created.title}`)
        }

        console.log('All campaigns created successfully!')

        // Verify the data
        const allCampaigns = await prisma.campaign.findMany()
        console.log(`Total campaigns: ${allCampaigns.length}`)
        allCampaigns.forEach(c => {
            console.log(`- ${c.title}: Target ৳${c.targetAmount}, Raised ৳${c.raisedAmount}`)
        })

    } catch (error) {
        console.error('Error fixing campaign data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixCampaignData()
