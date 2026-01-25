"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-context"

export function ThemePersistence() {
    const { theme } = useTheme()
    const { user } = useAuth()

    useEffect(() => {
        if (!user || !theme) return

        const saveTheme = async () => {
            try {
                const supabase = createClient()
                await supabase
                    .from('profiles')
                    .update({ theme_preference: theme })
                    .eq('id', user.id)
            } catch (error) {
                console.error('Failed to save theme preference:', error)
            }
        }

        const timeout = setTimeout(saveTheme, 1000) // Debounce
        return () => clearTimeout(timeout)
    }, [theme, user])

    return null
}
