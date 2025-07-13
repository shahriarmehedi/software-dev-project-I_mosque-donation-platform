const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateCampaigns() {
    console.log('Updating existing campaigns...')



    try {
        // Get all campaigns
        const campaigns = await prisma.campaign.findMany()
        console.log(`Found ${campaigns.length} campaigns`)

        // Update each campaign individually
        for (const campaign of campaigns) {
            if (campaign.targetAmount === null || campaign.raisedAmount === null) {
                console.log(`Updating campaign: ${campaign.title}`)
                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: {
                        targetAmount: campaign.targetAmount || 50000, // Default target amount
                        raisedAmount: campaign.raisedAmount || 0,
                        startDate: campaign.startDate || campaign.createdAt,
                        endDate: campaign.endDate || null,
                        imageUrl: campaign.imageUrl || null
                    }
                })
            }
        }

        console.log('All campaigns updated successfully!')

        // Show updated campaigns
        const updatedCampaigns = await prisma.campaign.findMany()
        console.log('Updated campaigns:', updatedCampaigns.map(c => ({
            title: c.title,
            targetAmount: c.targetAmount,
            raisedAmount: c.raisedAmount
        })))

    } catch (error) {
        console.error('Error updating campaigns:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateCampaigns()
