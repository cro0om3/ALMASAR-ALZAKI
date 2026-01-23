"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail } from 'lucide-react'

export function LoginForm() {
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !pinCode) {
      setError('الرجاء إدخال البريد الإلكتروني ورمز PIN')
      return
    }

    try {
      setIsSigningIn(true)
      await signIn(email, pinCode)
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            نظام المحاسبة
          </h1>
          <p className="text-gray-600">
            سجل الدخول للوصول إلى النظام
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              البريد الإلكتروني
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading || isSigningIn}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinCode" className="text-gray-700">
              رمز PIN
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="pinCode"
                type="password"
                placeholder="أدخل رمز PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="pl-10"
                required
                disabled={loading || isSigningIn}
                maxLength={10}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || isSigningIn}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isSigningIn || loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
