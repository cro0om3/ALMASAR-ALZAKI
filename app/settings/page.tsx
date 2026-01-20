"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { settingsService, type AppSettings } from "@/lib/data/settings-service"
import { permissionService } from "@/lib/data/permission-service"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { PageHeader } from "@/components/shared/PageHeader"
import { DataBackup } from "@/components/shared/DataBackup"
import { SystemHealth } from "@/components/shared/SystemHealth"
import { Tabs } from "@/components/shared/Tabs"
import { Switch } from "@/components/shared/Switch"
import { Alert } from "@/components/shared/Alert"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/lib/hooks/use-toast"
import { useTheme } from "@/lib/hooks/use-theme"
import { Save, Upload, Image as ImageIcon, Shield, Lock, Building2, Receipt, Bell, Monitor, Database, Trash2, RefreshCw, Info, Globe, Calendar, Printer, Sparkles } from "lucide-react"
import Image from "next/image"
import { Permission, UserRole } from "@/types"
import { aiService } from "@/lib/services/ai-service"

const settingsSchema = z.object({
  // Number Prefixes
  quotationPrefix: z.string().min(1, "Quotation prefix is required"),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  receiptPrefix: z.string().min(1, "Receipt prefix is required"),
  
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  tradeLicense: z.string().min(1, "Trade license is required"),
  taxRegNumber: z.string().min(1, "Tax registration number is required"),
  phone: z.string().min(1, "Phone is required"),
  poBox: z.string(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  
  // Invoice/Quotation Settings
  defaultVATRate: z.number().min(0).max(100),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  
  // Terms
  invoiceTerms: z.string().optional(),
  quotationTerms: z.string().optional(),
  footerText: z.string().optional(),
  
  // System Settings
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  language: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  itemsPerPage: z.number().optional(),
  
  // AI Settings
  aiEnabled: z.boolean().optional(),
  openAIApiKey: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const { currentRole, updateRole, hasPermission } = usePermissions()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const [activeTab, setActiveTab] = useState("company")
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Permission[]>>({
    admin: [],
    manager: [],
    user: [],
    viewer: [],
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    const currentSettings = settingsService.get()
    setSettings(currentSettings)

    // Load permission config
    const config = permissionService.getConfig()
    setSelectedRole(config.currentRole)
    
    // Load permissions for all roles
    const permissions: Record<UserRole, Permission[]> = {
      admin: permissionService.getRolePermissions('admin'),
      manager: permissionService.getRolePermissions('manager'),
      user: permissionService.getRolePermissions('user'),
      viewer: permissionService.getRolePermissions('viewer'),
    }
    setRolePermissions(permissions)
    
    // Set form values
    setValue("quotationPrefix", currentSettings.quotationPrefix)
    setValue("invoicePrefix", currentSettings.invoicePrefix)
    setValue("receiptPrefix", currentSettings.receiptPrefix)
    setValue("companyName", currentSettings.companyName)
    setValue("tradeLicense", currentSettings.tradeLicense)
    setValue("taxRegNumber", currentSettings.taxRegNumber)
    setValue("phone", currentSettings.phone)
    setValue("poBox", currentSettings.poBox)
    setValue("email", currentSettings.email)
    setValue("address", currentSettings.address)
    setValue("defaultVATRate", currentSettings.defaultVATRate)
    setValue("currency", currentSettings.currency)
    setValue("currencySymbol", currentSettings.currencySymbol)
    setValue("invoiceTerms", currentSettings.invoiceTerms || "")
    setValue("quotationTerms", currentSettings.quotationTerms || "")
    setValue("footerText", currentSettings.footerText || "")
    setValue("dateFormat", currentSettings.dateFormat || "DD/MM/YYYY")
    setValue("timeFormat", (currentSettings.timeFormat || "24h") as "12h" | "24h")
    setValue("language", currentSettings.language || "en")
    setValue("notificationsEnabled", currentSettings.notificationsEnabled !== undefined ? currentSettings.notificationsEnabled : true)
    setValue("emailNotifications", currentSettings.emailNotifications !== undefined ? currentSettings.emailNotifications : false)
    setValue("autoSave", currentSettings.autoSave !== undefined ? currentSettings.autoSave : true)
    setValue("itemsPerPage", currentSettings.itemsPerPage || 25)
    setValue("aiEnabled", currentSettings.aiEnabled !== undefined ? currentSettings.aiEnabled : false)
    setValue("openAIApiKey", currentSettings.openAIApiKey || "")
    
    if (currentSettings.logoUrl) {
      setLogoPreview(currentSettings.logoUrl)
    }
  }, [setValue])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        // Update settings immediately for preview
        settingsService.update({ logoUrl: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (data: SettingsFormData) => {
    setIsSaving(true)
    try {
      settingsService.update({
        quotationPrefix: data.quotationPrefix,
        invoicePrefix: data.invoicePrefix,
        receiptPrefix: data.receiptPrefix,
        companyName: data.companyName,
        tradeLicense: data.tradeLicense,
        taxRegNumber: data.taxRegNumber,
        phone: data.phone,
        poBox: data.poBox,
        email: data.email,
        address: data.address,
        defaultVATRate: data.defaultVATRate,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        invoiceTerms: data.invoiceTerms,
        quotationTerms: data.quotationTerms,
        footerText: data.footerText,
        logoUrl: logoPreview || undefined,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
        language: data.language,
        notificationsEnabled: data.notificationsEnabled,
        emailNotifications: data.emailNotifications,
        autoSave: data.autoSave,
        itemsPerPage: data.itemsPerPage,
        aiEnabled: data.aiEnabled,
        openAIApiKey: data.openAIApiKey,
      })
      
      // Update AI service
      if (typeof window !== 'undefined') {
        try {
          if (data.openAIApiKey) {
            aiService.setApiKey(data.openAIApiKey)
          }
          if (data.aiEnabled !== undefined) {
            aiService.setEnabled(data.aiEnabled)
          }
        } catch (error) {
          console.error('Error updating AI service:', error)
        }
      }
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
        variant: "success",
      })
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default values? This action cannot be undone.")) {
      settingsService.reset()
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
        variant: "success",
      })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading settings..." />
      </div>
    )
  }

  const settingsTabs = [
    {
      id: "company",
      label: "Company",
      icon: <Building2 className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Logo Section */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Company Logo
            </h3>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="Company Logo"
                      width={256}
                      height={256}
                      className="w-64 h-64 object-contain border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-white dark:bg-blue-900"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/50">
                    <ImageIcon className="h-20 w-20 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="logo" className="text-blue-900 dark:text-blue-100 font-medium mb-2 block">
                    Upload Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="border-2 border-blue-200/60 dark:border-blue-800/60"
                    />
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setLogoPreview(null)
                          settingsService.update({ logoUrl: undefined })
                        }}
                        className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Recommended size: 200x200px. Supports PNG, JPG, SVG formats.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Information */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Company Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-blue-900 dark:text-blue-100 font-medium">Company Name *</Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-blue-900"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeLicense" className="text-blue-900 dark:text-blue-100 font-medium">Trade License *</Label>
                <Input
                  id="tradeLicense"
                  {...register("tradeLicense")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.tradeLicense && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.tradeLicense.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRegNumber" className="text-blue-900 dark:text-blue-100 font-medium">Tax Registration Number *</Label>
                <Input
                  id="taxRegNumber"
                  {...register("taxRegNumber")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.taxRegNumber && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.taxRegNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-900 dark:text-blue-100 font-medium">Phone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900 dark:text-blue-100 font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="poBox" className="text-blue-900 dark:text-blue-100 font-medium">P.O. Box</Label>
                <Input
                  id="poBox"
                  {...register("poBox")}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-blue-900 dark:text-blue-100 font-medium">Address *</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  rows={3}
                  className="border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "document",
      label: "Documents",
      icon: <Receipt className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Number Prefixes */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Number Prefixes
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quotationPrefix" className="text-blue-900 dark:text-blue-100 font-medium">Quotation Prefix *</Label>
                <Input
                  id="quotationPrefix"
                  {...register("quotationPrefix")}
                  placeholder="QT"
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.quotationPrefix && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.quotationPrefix.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: QT-2024-01-123456</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoicePrefix" className="text-blue-900 dark:text-blue-100 font-medium">Invoice Prefix *</Label>
                <Input
                  id="invoicePrefix"
                  {...register("invoicePrefix")}
                  placeholder="INV"
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.invoicePrefix && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.invoicePrefix.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: INV-2024-01-123456</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptPrefix" className="text-blue-900 dark:text-blue-100 font-medium">Receipt Prefix *</Label>
                <Input
                  id="receiptPrefix"
                  {...register("receiptPrefix")}
                  placeholder="RCP"
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.receiptPrefix && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.receiptPrefix.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: RCP-2024-01-123456</p>
              </div>
            </div>
          </Card>

          {/* Invoice & Quotation Settings */}
          <Card className="border-2 border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Invoice & Quotation Settings
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="defaultVATRate" className="text-blue-900 dark:text-blue-100 font-medium">Default VAT Rate (%) *</Label>
                <Input
                  id="defaultVATRate"
                  type="number"
                  step="0.01"
                  {...register("defaultVATRate", { valueAsNumber: true })}
                  className="h-12 border-2 border-gold focus:border-gold-dark focus:ring-2 focus:ring-gold"
                />
                {errors.defaultVATRate && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.defaultVATRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-blue-900 dark:text-blue-100 font-medium">Currency Code *</Label>
                <Input
                  id="currency"
                  {...register("currency")}
                  placeholder="AED"
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.currency && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencySymbol" className="text-blue-900 dark:text-blue-100 font-medium">Currency Symbol *</Label>
                <Input
                  id="currencySymbol"
                  {...register("currencySymbol")}
                  placeholder="AED"
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60"
                />
                {errors.currencySymbol && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.currencySymbol.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoiceTerms" className="text-blue-900 dark:text-blue-100 font-medium">Default Invoice Terms</Label>
                <Textarea
                  id="invoiceTerms"
                  {...register("invoiceTerms")}
                  rows={3}
                  className="border-2 border-blue-200/60 dark:border-blue-800/60"
                  placeholder="Payment due within 30 days"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="quotationTerms" className="text-blue-900 dark:text-blue-100 font-medium">Default Quotation Terms</Label>
                <Textarea
                  id="quotationTerms"
                  {...register("quotationTerms")}
                  rows={3}
                  className="border-2 border-blue-200/60 dark:border-blue-800/60"
                  placeholder="Valid for 30 days"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footerText" className="text-blue-900 dark:text-blue-100 font-medium">Footer Text (Optional)</Label>
                <Textarea
                  id="footerText"
                  {...register("footerText")}
                  rows={2}
                  className="border-2 border-blue-200/60 dark:border-blue-800/60"
                  placeholder="Additional footer text for invoices and quotations"
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "system",
      label: "System",
      icon: <Monitor className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Appearance
            </h3>
            <div className="space-y-4">
              <Switch
                label="Dark Mode"
                description="Toggle between light and dark theme"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat" className="text-blue-900 dark:text-blue-100 font-medium">Date Format</Label>
                <Select
                  value={watch("dateFormat") || "DD/MM/YYYY"}
                  onValueChange={(value) => setValue("dateFormat", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat" className="text-blue-900 dark:text-blue-100 font-medium">Time Format</Label>
                <Select
                  value={watch("timeFormat") || "24h"}
                  onValueChange={(value) => setValue("timeFormat", value as "12h" | "24h")}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hour (HH:MM)</SelectItem>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-blue-900 dark:text-blue-100 font-medium">Language</Label>
                <Select
                  value={watch("language") || "en"}
                  onValueChange={(value) => setValue("language", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold dark:text-yellow-400" />
              <span className="w-1 h-6 bg-gold rounded"></span>
              Notifications
            </h3>
            <div className="space-y-4">
              <Switch
                label="Enable Notifications"
                description="Receive in-app notifications for important events"
                checked={watch("notificationsEnabled") ?? true}
                onCheckedChange={(checked) => setValue("notificationsEnabled", checked)}
              />

              <Switch
                label="Email Notifications"
                description="Receive email notifications (requires email configuration)"
                checked={watch("emailNotifications") ?? false}
                onCheckedChange={(checked) => setValue("emailNotifications", checked)}
              />
            </div>
          </Card>

          {/* AI Assistant Settings */}
          <Card className="border-2 border-purple-200/60 dark:border-purple-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/20 dark:to-blue-900/30 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="w-1 h-6 bg-purple-500 rounded"></span>
              AI Assistant Settings
            </h3>
            <div className="space-y-4">
              <Switch
                label="Enable AI Assistant"
                description="Enable AI-powered features like text generation, translations, and smart suggestions"
                checked={watch("aiEnabled") ?? false}
                onCheckedChange={(checked) => setValue("aiEnabled", checked)}
              />

              {watch("aiEnabled") && (
                <div className="space-y-2">
                  <Label htmlFor="openAIApiKey" className="text-blue-900 dark:text-blue-100 font-medium">OpenAI API Key</Label>
                  <Input
                    id="openAIApiKey"
                    type="password"
                    {...register("openAIApiKey")}
                    placeholder="sk-..."
                    className="h-12 border-2 border-purple-200/60 dark:border-purple-800/60 bg-white dark:bg-blue-900"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your API key is stored locally and never shared. Get your key from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* System Preferences */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-gold dark:text-yellow-400" />
              <span className="w-1 h-6 bg-gold rounded"></span>
              System Preferences
            </h3>
            <div className="space-y-4">
              <Switch
                label="Auto Save"
                description="Automatically save changes as you work"
                checked={watch("autoSave") ?? true}
                onCheckedChange={(checked) => setValue("autoSave", checked)}
              />

              <div className="space-y-2">
                <Label htmlFor="itemsPerPage" className="text-blue-900 dark:text-blue-100 font-medium">Items Per Page</Label>
                <Input
                  id="itemsPerPage"
                  type="number"
                  {...register("itemsPerPage", { valueAsNumber: true })}
                  min={10}
                  max={100}
                  step={5}
                  className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-blue-900"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Number of items to display per page in lists (10-100)</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: <Shield className="h-4 w-4" />,
      badge: 4,
      content: (
        <div className="space-y-6">
          {/* Permissions Management */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gold dark:text-yellow-400" />
              <span className="w-1 h-6 bg-gold rounded"></span>
              Permissions Management
            </h3>

            {/* Current Role Selection */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="currentRole" className="text-blue-900 dark:text-blue-100 font-medium">Current User Role</Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => {
                  setSelectedRole(value)
                  updateRole(value)
                }}>
                  <SelectTrigger className="h-12 border-2 border-blue-200/60 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access</SelectItem>
                    <SelectItem value="manager">Manager - Most Features</SelectItem>
                    <SelectItem value="user">User - Limited Access</SelectItem>
                    <SelectItem value="viewer">Viewer - Read Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  This determines what actions the current user can perform in the system.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {permissionService.getCurrentPermissions().length === 0 ? (
                    <Badge variant="default">No permissions (Read-only)</Badge>
                  ) : (
                    permissionService.getCurrentPermissions().map((perm) => (
                      <Badge key={perm} variant="default">{perm.replace('_', ' ')}</Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Role Permissions Configuration */}
            <div className="space-y-6">
              <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100">Configure Role Permissions</h4>
              
              {(['admin', 'manager', 'user', 'viewer'] as UserRole[]).map((role) => {
                const permissions = rolePermissions[role] || []
                const allPermissions = permissionService.getAllPermissions()
                const isReadOnly = role === 'admin' && !hasPermission('edit_settings')

                return (
                  <Card key={role} className="border border-blue-200 dark:border-blue-800 p-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 capitalize">{role}</CardTitle>
                          <CardDescription className="text-xs mt-1 dark:text-gray-400">
                            {permissionService.getConfig().roles[role]?.description || ''}
                          </CardDescription>
                        </div>
                        {role === selectedRole && (
                          <Badge variant="success" className="text-xs">Current Role</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {allPermissions.map((perm) => {
                          const isChecked = permissions.includes(perm)
                          const permissionLabel = perm.replace('edit_', '').replace('delete_', '').replace('_', ' ')

                          return (
                            <div key={perm} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${role}-${perm}`}
                                checked={isChecked}
                                disabled={isReadOnly}
                                onCheckedChange={(checked) => {
                                  const newPermissions = checked
                                    ? [...permissions, perm]
                                    : permissions.filter((p) => p !== perm)
                                  
                                  setRolePermissions((prev) => ({
                                    ...prev,
                                    [role]: newPermissions,
                                  }))
                                  
                                  permissionService.updateRolePermissions(role, newPermissions)
                                }}
                              />
                              <label
                                htmlFor={`${role}-${perm}`}
                                className={`text-sm font-medium cursor-pointer ${isReadOnly ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                              >
                                {permissionLabel}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "backup",
      label: "Backup & Data",
      icon: <Database className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <DataBackup />
          
          {/* System Health */}
          <SystemHealth />
          
          {/* System Information */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-gold dark:text-yellow-400" />
              <span className="w-1 h-6 bg-gold rounded"></span>
              System Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">{settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Version</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">Local Storage</span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-red-200/60 dark:border-red-800/60 shadow-card p-6">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded"></span>
              Danger Zone
            </h3>
            <Alert
              variant="warning"
              title="Warning"
              description="These actions cannot be undone. Please be careful."
              className="mb-4"
            />
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetSettings}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All Settings
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reset all settings to their default values. This will not delete your data.
              </p>
            </div>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage application settings and company information"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs
          tabs={settingsTabs}
          activeTab={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId)
          }}
        />

        {/* Save Button */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200 dark:border-gray-800">
          <Alert
            variant="info"
            title="Tip"
            description="Changes are saved automatically when you click Save Settings"
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={isSaving}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
