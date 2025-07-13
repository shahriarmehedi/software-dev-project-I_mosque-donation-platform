'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'
type Language = 'en' | 'bn'

interface AppContextType {
    theme: Theme
    language: Language
    toggleTheme: () => void
    toggleLanguage: () => void
    t: (key: string) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Translations
const translations = {
    en: {
        // Header
        'header.makedonation': 'Make a Donation',
        'header.title': 'Digital Donation Platform',
        'header.supportcommunity': 'Support Our Community',

        // Campaign Selection
        'campaign.select': 'Select Campaign',
        'campaign.choose': 'Choose a campaign to support...',
        'campaign.target': 'Target',
        'campaign.raised': 'Raised',
        'campaign.completed': 'completed',

        // Amount Selection
        'amount.title': 'Donation Amount',
        'amount.custom': 'Custom Amount',
        'amount.minimum': 'Minimum donation',
        'amount.enter': 'Enter amount (min',

        // Donor Information
        'donor.title': 'Donor Information',
        'donor.optional': '(Optional)',
        'donor.name': 'Name',
        'donor.nameplaceholder': 'Your name',
        'donor.email': 'Email Address',
        'donor.emailplaceholder': 'your.email@example.com',
        'donor.phone': 'Phone Number',
        'donor.phoneplaceholder': '01XXXXXXXXX',

        // Payment Method
        'payment.title': 'Payment Method',
        'payment.secure': 'All payments are securely processed through SSLCommerz',
        'payment.creditcard': 'Credit Card',
        'payment.debitcard': 'Debit Card',
        'payment.netbanking': 'Net Banking',
        'payment.mobilebanking': 'Mobile Banking',
        'payment.digitalwallet': 'Digital Wallet',
        'payment.visa': 'Visa, Mastercard',
        'payment.local': 'Local & International',
        'payment.banks': 'All Major Banks',
        'payment.mobile': 'bKash, Nagad, Rocket',
        'payment.various': 'Various Options',

        // Summary
        'summary.title': 'Donation Summary',
        'summary.amount': 'Amount',
        'summary.method': 'Payment Method',
        'summary.processing': 'Processing...',
        'summary.donate': 'Donate',

        // Alerts
        'alert.selectcampaign': 'Please select a campaign and enter a valid amount',
        'alert.minimumamount': 'Minimum donation amount is',
        'alert.paymentfailed': 'Payment initiation failed',
        'alert.failed': 'Failed to create donation',
        'alert.error': 'An error occurred while processing your donation',

        // General
        'scan.donate': 'Scan to Donate',
        'scan.description': 'Use your phone camera to scan the QR code and make a quick donation',
        'donate.now': 'Donate Now',
        'footer.rights': 'All donations are processed securely.',
        'admin.access': 'Admin Access',
    },
    bn: {
        // Header
        'header.makedonation': 'দান করুন',
        'header.title': 'ডিজিটাল দান প্ল্যাটফর্ম',
        'header.supportcommunity': 'আমাদের সম্প্রদায়কে সহায়তা করুন',

        // Campaign Selection
        'campaign.select': 'ক্যাম্পেইন নির্বাচন করুন',
        'campaign.choose': 'সহায়তার জন্য একটি ক্যাম্পেইন বেছে নিন...',
        'campaign.target': 'লক্ষ্য',
        'campaign.raised': 'সংগৃহীত',
        'campaign.completed': 'সম্পন্ন',

        // Amount Selection
        'amount.title': 'দানের পরিমাণ',
        'amount.custom': 'কাস্টম পরিমাণ (৳)',
        'amount.minimum': 'সর্বনিম্ন দান',
        'amount.enter': 'পরিমাণ লিখুন (সর্বনিম্ন',

        // Donor Information
        'donor.title': 'দাতার তথ্য',
        'donor.optional': '(ঐচ্ছিক)',
        'donor.name': 'নাম',
        'donor.nameplaceholder': 'আপনার নাম',
        'donor.email': 'ইমেইল ঠিকানা',
        'donor.emailplaceholder': 'আপনার.ইমেইল@উদাহরণ.কম',
        'donor.phone': 'ফোন নম্বর',
        'donor.phoneplaceholder': '০১XXXXXXXXX',

        // Payment Method
        'payment.title': 'পেমেন্ট পদ্ধতি',
        'payment.secure': 'সমস্ত পেমেন্ট SSLCommerz এর মাধ্যমে নিরাপদে প্রক্রিয়া করা হয়',
        'payment.creditcard': 'ক্রেডিট কার্ড',
        'payment.debitcard': 'ডেবিট কার্ড',
        'payment.netbanking': 'নেট ব্যাংকিং',
        'payment.mobilebanking': 'মোবাইল ব্যাংকিং',
        'payment.digitalwallet': 'ডিজিটাল ওয়ালেট',
        'payment.visa': 'ভিসা, মাস্টারকার্ড',
        'payment.local': 'স্থানীয় ও আন্তর্জাতিক',
        'payment.banks': 'সব প্রধান ব্যাংক',
        'payment.mobile': 'বিকাশ, নগদ, রকেট',
        'payment.various': 'বিভিন্ন অপশন',

        // Summary
        'summary.title': 'দানের সারসংক্ষেপ',
        'summary.amount': 'পরিমাণ',
        'summary.method': 'পেমেন্ট পদ্ধতি',
        'summary.processing': 'প্রক্রিয়াকরণ...',
        'summary.donate': 'দান করুন',

        // Alerts
        'alert.selectcampaign': 'দয়া করে একটি ক্যাম্পেইন নির্বাচন করুন এবং বৈধ পরিমাণ লিখুন',
        'alert.minimumamount': 'সর্বনিম্ন দানের পরিমাণ',
        'alert.paymentfailed': 'পেমেন্ট শুরু করতে ব্যর্থ',
        'alert.failed': 'দান তৈরি করতে ব্যর্থ',
        'alert.error': 'আপনার দান প্রক্রিয়া করার সময় একটি ত্রুটি ঘটেছে',

        // General
        'scan.donate': 'স্ক্যান করে দান করুন',
        'scan.description': 'QR কোড স্ক্যান করতে আপনার ফোনের ক্যামেরা ব্যবহার করুন এবং দ্রুত দান করুন',
        'donate.now': 'এখনই দান করুন',
        'footer.rights': 'সমস্ত দান নিরাপদে প্রক্রিয়া করা হয়।',
        'admin.access': 'অ্যাডমিন অ্যাক্সেস',
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Load saved preferences from localStorage only after mounting
        const savedTheme = localStorage.getItem('theme') as Theme
        const savedLanguage = localStorage.getItem('language') as Language

        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.toggle('dark', savedTheme === 'dark')
        }
        if (savedLanguage) {
            setLanguage(savedLanguage)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        if (mounted) {
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
    }

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'bn' : 'en'
        setLanguage(newLanguage)
        if (mounted) {
            localStorage.setItem('language', newLanguage)
        }
    }

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations['en']] || key
    }

    return (
        <AppContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
