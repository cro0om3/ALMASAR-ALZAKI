"use client"

import { useEffect } from "react"
import { settingsService, type AppSettings } from "@/lib/data/settings-service"

/**
 * Loads settings (including logo) from the database on app load
 * so that any browser sees the same logo and company settings.
 */
export function SettingsHydration() {
  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) return
        const data = await res.json()
        const apiSettings = data.settings
        if (apiSettings && typeof apiSettings === "object" && Object.keys(apiSettings).length > 0) {
          const current = settingsService.get()
          const merged = { ...current, ...apiSettings } as AppSettings
          settingsService.update(merged)
          if (typeof window !== "undefined") {
            // Dispatch in next tick so Header/Sidebar have time to attach listeners
            setTimeout(() => window.dispatchEvent(new CustomEvent("settings-updated")), 0)
          }
        }
      } catch {
        // Ignore; keep localStorage/default
      }
    }
    hydrate()
  }, [])
  return null
}
