// Analytics utilities for tracking and analyzing business metrics

export interface AnalyticsData {
  period: string
  quotations: {
    total: number
    accepted: number
    rejected: number
    sent: number
    totalValue: number
    averageValue: number
  }
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
    totalRevenue: number
    pendingAmount: number
    averageValue: number
  }
  customers: {
    total: number
    new: number
    active: number
  }
  conversionRate: number
  paymentRate: number
}

export function calculateAnalytics(
  startDate: Date,
  endDate: Date,
  quotations: any[],
  invoices: any[],
  customers: any[]
): AnalyticsData {
  const filteredQuotations = quotations.filter(q => {
    const qDate = new Date(q.date)
    return qDate >= startDate && qDate <= endDate
  })

  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date)
    return invDate >= startDate && invDate <= endDate
  })

  const filteredCustomers = customers.filter(c => {
    const cDate = new Date(c.createdAt)
    return cDate >= startDate && cDate <= endDate
  })

  const quotationValue = filteredQuotations.reduce((sum, q) => sum + q.total, 0)
  const revenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const conversionRate = filteredQuotations.length > 0
    ? (filteredQuotations.filter(q => q.status === 'accepted').length / filteredQuotations.length) * 100
    : 0

  const paymentRate = filteredInvoices.length > 0
    ? (filteredInvoices.filter(inv => inv.status === 'paid').length / filteredInvoices.length) * 100
    : 0

  return {
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    quotations: {
      total: filteredQuotations.length,
      accepted: filteredQuotations.filter(q => q.status === 'accepted').length,
      rejected: filteredQuotations.filter(q => q.status === 'rejected').length,
      sent: filteredQuotations.filter(q => q.status === 'sent').length,
      totalValue: quotationValue,
      averageValue: filteredQuotations.length > 0 ? quotationValue / filteredQuotations.length : 0,
    },
    invoices: {
      total: filteredInvoices.length,
      paid: filteredInvoices.filter(inv => inv.status === 'paid').length,
      pending: filteredInvoices.filter(inv => inv.status === 'sent').length,
      overdue: filteredInvoices.filter(inv => inv.status === 'overdue').length,
      totalRevenue: revenue,
      pendingAmount: filteredInvoices
        .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0),
      averageValue: filteredInvoices.length > 0
        ? filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) / filteredInvoices.length
        : 0,
    },
    customers: {
      total: filteredCustomers.length,
      new: filteredCustomers.length,
      active: filteredCustomers.length,
    },
    conversionRate,
    paymentRate,
  }
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatGrowthRate(rate: number): string {
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${rate.toFixed(1)}%`
}
