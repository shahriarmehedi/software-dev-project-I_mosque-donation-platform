const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAdmin() {
    try {
        console.log('🔍 Checking for admin user...')

        // Check if admin exists
        const admin = await prisma.admin.findFirst({
            where: { email: 'admin@mosque.com' }
        })

        if (admin) {
            console.log('✅ Admin user found:', {
                id: admin.id,
                email: admin.email,
                name: admin.name
            })

            // Test password
            const isValidPassword = await bcrypt.compare('admin123', admin.password)
            console.log('🔐 Password check:', isValidPassword ? 'Valid ✅' : 'Invalid ❌')
        } else {
            console.log('❌ No admin user found!')

            // Create admin user
            console.log('🛠️ Creating admin user...')
            const hashedPassword = await bcrypt.hash('admin123', 12)

            const newAdmin = await prisma.admin.create({
                data: {
                    email: 'admin@mosque.com',
                    password: hashedPassword,
                    name: 'Admin User'
                }
            })

            console.log('✅ Admin user created:', {
                id: newAdmin.id,
                email: newAdmin.email,
                name: newAdmin.name
            })
        }
    } catch (error) {
        console.error('💥 Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkAdmin()
