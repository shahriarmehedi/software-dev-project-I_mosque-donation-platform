'use client'

import { Sun, Moon, Languages } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useState, useEffect } from 'react'

export default function ThemeLanguageToggle() {
    const { theme, language, toggleTheme, toggleLanguage } = useApp()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-16 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={language === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে স্যুইচ করুন'}
            >
                <Languages className="w-4 h-4" />
                <span className="ml-1 text-sm font-medium">
                    {language === 'en' ? 'বাং' : 'EN'}
                </span>
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
                {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                ) : (
                    <Sun className="w-4 h-4" />
                )}
            </button>
        </div>
    )
}
