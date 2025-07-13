const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateDonations() {
    try {
        console.log('🔄 Updating sample donations to COMPLETED status...')

        // Get all pending donations and update them to completed
        const pendingDonations = await prisma.donation.findMany({
            where: { status: 'PENDING' },
            include: { campaign: true }
        })

        console.log(`Found ${pendingDonations.length} pending donations`)

        for (const donation of pendingDonations) {
            // Update donation status
            await prisma.donation.update({
                where: { id: donation.id },
                data: { status: 'COMPLETED' }
            })

            // Update campaign raised amount
            await prisma.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    raisedAmount: {
                        increment: donation.amount
                    }
                }
            })

            console.log(`✅ Updated donation ${donation.id} (৳${donation.amount}) for campaign: ${donation.campaign.title}`)
        }

        console.log('🎉 All sample donations updated successfully!')

        // Show final campaign totals
        const campaigns = await prisma.campaign.findMany()
        console.log('\n📊 Campaign Totals:')
        campaigns.forEach(campaign => {
            const progress = campaign.targetAmount ? (campaign.raisedAmount / campaign.targetAmount * 100).toFixed(1) : 0
            console.log(`  ${campaign.title}: ৳${campaign.raisedAmount} / ৳${campaign.targetAmount} (${progress}%)`)
        })

    } catch (error) {
        console.error('❌ Error updating donations:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateDonations()
