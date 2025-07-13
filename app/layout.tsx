import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './contexts/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Mosque Donation System',
    description: 'Digital donation platform for mosque management',
    manifest: '/manifest.json',
    viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppProvider>
                    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                        {children}
                    </div>
                </AppProvider>
            </body>
        </html>
    )
}
