"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type RealtimeCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void

export function useRealtime<T = any>(
  table: string,
  callback: RealtimeCallback<T>,
  filter?: string
) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<T>)
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback])

  return { isConnected }
}

// Hook for real-time updates on specific tables
export function useRealtimeCustomers(callback: RealtimeCallback) {
  return useRealtime('customers', callback)
}

export function useRealtimeInvoices(callback: RealtimeCallback) {
  return useRealtime('invoices', callback)
}

export function useRealtimeQuotations(callback: RealtimeCallback) {
  return useRealtime('quotations', callback)
}

export function useRealtimePurchaseOrders(callback: RealtimeCallback) {
  return useRealtime('purchase_orders', callback)
}
