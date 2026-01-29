"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { seedDummyData } from "@/lib/data/seed-data"
import { CheckCircle, XCircle } from "lucide-react"

export default function SeedPage() {
  const [seeded, setSeeded] = useState(false)
  const [stats, setStats] = useState({
    customers: 0,
    quotations: 0,
    projects: 0,
    usageEntries: 0,
    vehicles: 0,
    invoices: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [c, q, p, u, v, i] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/quotations'),
          fetch('/api/projects'),
          fetch('/api/usage-entries'),
          fetch('/api/vehicles'),
          fetch('/api/invoices'),
        ])
        const customers = c.ok ? await c.json() : []
        const quotations = q.ok ? await q.json() : []
        const projects = p.ok ? await p.json() : []
        const usageEntries = u.ok ? await u.json() : []
        const vehicles = v.ok ? await v.json() : []
        const invoices = i.ok ? await i.json() : []
        setStats({
          customers: (customers || []).length,
          quotations: (quotations || []).length,
          projects: (projects || []).length,
          usageEntries: (usageEntries || []).length,
          vehicles: (vehicles || []).length,
          invoices: (invoices || []).length,
        })
      } catch (_e) {
        // keep default zeros
      }
    }
    load()
  }, [])

  const updateStats = () => {
    const load = async () => {
      try {
        const [c, q, p, u, v, i] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/quotations'),
          fetch('/api/projects'),
          fetch('/api/usage-entries'),
          fetch('/api/vehicles'),
          fetch('/api/invoices'),
        ])
        const customers = c.ok ? await c.json() : []
        const quotations = q.ok ? await q.json() : []
        const projects = p.ok ? await p.json() : []
        const usageEntries = u.ok ? await u.json() : []
        const vehicles = v.ok ? await v.json() : []
        const invoices = i.ok ? await i.json() : []
        setStats({
          customers: (customers || []).length,
          quotations: (quotations || []).length,
          projects: (projects || []).length,
          usageEntries: (usageEntries || []).length,
          vehicles: (vehicles || []).length,
          invoices: (invoices || []).length,
        })
      } catch (_e) {}
    }
    load()
  }

  const handleSeed = () => {
    try {
      seedDummyData()
      setSeeded(true)
      updateStats()
      setTimeout(() => {
        window.location.href = "/projects"
      }, 2000)
    } catch (error) {
      console.error("Error seeding data:", error)
      alert("Error seeding data. Check console for details.")
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Seed Dummy Data</h1>
          <p className="text-blue-100 text-lg font-medium">Create sample data to understand the system</p>
        </div>
      </div>

      <Card className="border-2 border-blue-400 dark:border-blue-800/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900">Current Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.customers}</p>
              <p className="text-sm text-gray-600">Customers</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.quotations}</p>
              <p className="text-sm text-gray-600">Quotations</p>
            </div>
            <div className="text-center p-4 bg-gold/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.projects}</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.usageEntries}</p>
              <p className="text-sm text-gray-600">Usage Entries</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.vehicles}</p>
              <p className="text-sm text-gray-600">Vehicles</p>
            </div>
            <div className="text-center p-4 bg-gold/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.invoices}</p>
              <p className="text-sm text-gray-600">Invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gold/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900">What Will Be Created</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900">Sample Data:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>2 Customers</strong> - Sample customers with contact information</li>
              <li><strong>2 Quotations</strong> - One by hours (51.923 AED/hour), one by days (3000 AED/day)</li>
              <li><strong>2 Projects</strong> - Road Maintenance Project, Material Transport Project</li>
              <li><strong>2 Vehicles</strong> - Two tanker trucks</li>
              <li><strong>6 Usage Entries</strong> - Project usage entries (hours and days)</li>
              <li><strong>2 Invoices</strong> - Sample invoices matching PDF format with vehicle numbers, hours, and VAT</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This will only create data if the database is empty. 
              Existing data will not be overwritten.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleSeed}
          className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white shadow-lg px-8 py-6 text-lg"
          disabled={seeded}
        >
          {seeded ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Data Seeded! Redirecting...
            </>
          ) : (
            "Create Dummy Data"
          )}
        </Button>
      </div>

      {seeded && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <p className="font-semibold">Data created successfully! Redirecting to projects...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
