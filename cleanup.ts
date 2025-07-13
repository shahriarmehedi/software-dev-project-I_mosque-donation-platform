import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Cleaning up existing data...')

  try {
    // Delete all existing donations to reset data
    const deletedDonations = await prisma.donation.deleteMany({})
    console.log(`✅ Deleted ${deletedDonations.count} existing donations`)

    console.log('🎉 Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()
