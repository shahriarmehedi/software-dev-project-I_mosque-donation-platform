import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mosque.org' },
    update: {},
    create: {
      email: 'admin@mosque.org',
      password: hashedPassword,
      name: 'Admin User'
    }
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample campaigns
  const campaigns = []
  
  // Check if campaigns already exist, if not create them
  const existingCampaigns = await prisma.campaign.findMany()
  
  if (existingCampaigns.length === 0) {
    const campaignData = [
      {
        title: 'General Mosque Fund',
        description: 'Support daily operations, maintenance, and utilities of the mosque.',
        targetAmount: 100000,
        isActive: true
      },
      {
        title: 'Ramadan Iftar Program',
        description: 'Provide free iftar meals for the community during Ramadan.',
        targetAmount: 50000,
        isActive: true
      },
      {
        title: 'Islamic Education Fund',
        description: 'Support Quran classes and Islamic education programs for children.',
        targetAmount: 25000,
        isActive: true
      },
      {
        title: 'Support for Needy Families',
        description: 'Help poor and needy families in our community with essential needs.',
        targetAmount: 75000,
        isActive: true
      }
    ]

    for (const campaign of campaignData) {
      const createdCampaign = await prisma.campaign.create({
        data: campaign
      })
      campaigns.push(createdCampaign)
    }
  } else {
    campaigns.push(...existingCampaigns)
  }

  console.log('✅ Created campaigns:', campaigns.length)

  // Create site settings
  const existingSettings = await prisma.siteSettings.findFirst()
  
  if (!existingSettings) {
    const siteSettings = await prisma.siteSettings.create({
      data: {
        mosqueName: 'Central Mosque',
        description: 'A community mosque serving the local Islamic community with prayer services, education, and community outreach programs.',
        address: 'Dhaka, Bangladesh',
        contactPhone: '01775049464',
        contactEmail: 'info@centralmosque.org',
        website: 'https://centralmosque.org',
        
        // Payment settings
        sslcommerzEnabled: true,
        sslcommerzStoreId: process.env.SSLCOMMERZ_STORE_ID || '',
        sslcommerzStorePass: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
        sslcommerzIsLive: false,
        
        bankTransferEnabled: true,
        bankAccountName: 'Central Mosque Fund',
        bankAccountNumber: '1234567890',
        bankName: 'Example Bank Ltd',
        bankRoutingNumber: '123456789',
        
        // Social media
        facebookUrl: 'https://facebook.com/centralmosque',
        twitterUrl: 'https://twitter.com/centralmosque',
        instagramUrl: 'https://instagram.com/centralmosque',
        youtubeUrl: 'https://youtube.com/centralmosque',
        
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
    console.log('✅ Created site settings:', siteSettings.mosqueName)
  } else {
    console.log('✅ Site settings already exist:', existingSettings.mosqueName)
  }

  // Create some sample donations for demo
  const existingDonations = await prisma.donation.findMany()
  
  if (existingDonations.length === 0 && campaigns.length > 0) {
    const sampleDonations = [
      {
        amount: 1000,
        donorName: 'Ahmed Hassan',
        donorPhone: '01712345678',
        donorEmail: 'ahmed@example.com',
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED',
        campaignId: campaigns[0].id,
        transactionId: 'TXN_DEMO_001'
      },
      {
        amount: 2500,
        donorName: 'Fatima Rahman',
        donorPhone: '01812345679',
        donorEmail: 'fatima@example.com',
        paymentMethod: 'MOBILE_BANKING',
        status: 'COMPLETED',
        campaignId: campaigns.length > 1 ? campaigns[1].id : campaigns[0].id,
        transactionId: 'TXN_DEMO_002'
      },
      {
        amount: 500,
        donorEmail: 'anonymous@example.com',
        paymentMethod: 'INTERNET_BANKING',
        status: 'COMPLETED',
        campaignId: campaigns.length > 2 ? campaigns[2].id : campaigns[0].id,
        transactionId: 'TXN_DEMO_003'
      },
      {
        amount: 1500,
        donorName: 'Mohammad Ali',
        donorPhone: '01612345680',
        donorEmail: 'ali@example.com',
        paymentMethod: 'DIGITAL_WALLET',
        status: 'COMPLETED',
        campaignId: campaigns.length > 3 ? campaigns[3].id : campaigns[0].id,
        transactionId: 'TXN_DEMO_004'
      }
    ]

    for (const donation of sampleDonations) {
      await prisma.donation.create({
        data: {
          ...donation,
          status: donation.status as any,
          paymentMethod: donation.paymentMethod as any
        }
      })
    }

    console.log('✅ Created sample donations:', sampleDonations.length)
  } else {
    console.log('✅ Sample donations already exist or no campaigns available')
  }

  console.log('🎉 Database seeded successfully!')
  
  // Update campaign raised amounts based on completed donations
  console.log('🔄 Updating campaign raised amounts...')
  const completedDonations = await prisma.donation.findMany({
    where: { status: 'COMPLETED' },
    include: { campaign: true }
  })

  // Group donations by campaign and calculate totals
  const campaignTotals = completedDonations.reduce((acc, donation) => {
    if (!acc[donation.campaignId]) {
      acc[donation.campaignId] = 0
    }
    acc[donation.campaignId] += donation.amount
    return acc
  }, {} as Record<string, number>)

  // Update each campaign with the correct raised amount
  for (const [campaignId, totalAmount] of Object.entries(campaignTotals)) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { raisedAmount: totalAmount }
    })
  }

  console.log('✅ Updated raised amounts for', Object.keys(campaignTotals).length, 'campaigns')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
