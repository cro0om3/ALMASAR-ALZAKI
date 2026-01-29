/**
 * اختبار السلسلة المتكاملة: Quotation → Purchase Order → Invoice → Receipt
 * يشغّل 5 تجارب ويتحقق من الربط بين الوثائق.
 *
 * تشغيل السيرفر أولاً: npm run dev
 * ثم: node scripts/test-quotation-po-invoice-receipt-flow.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function getCustomers() {
  const list = await fetchJson(`${BASE_URL}/api/customers`)
  return Array.isArray(list) ? list : []
}

async function createQuotation(customerId, runIndex) {
  const now = new Date().toISOString().split('T')[0]
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const subtotal = 1000 * (runIndex + 1)
  const taxRate = 5
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  const quotationNumber = `QUO-TEST-${Date.now()}-${runIndex}`

  const body = {
    quotationNumber,
    customerId,
    date: now,
    validUntil,
    items: [
      { description: `Test Item Q${runIndex + 1}`, quantity: 1, unitPrice: subtotal, tax: taxRate, total },
    ],
    subtotal,
    taxRate,
    taxAmount,
    total,
    status: 'accepted',
    terms: '',
    notes: `Test run ${runIndex + 1}`,
  }

  const q = await fetchJson(`${BASE_URL}/api/quotations`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return q
}

async function createPurchaseOrder(quotation, runIndex) {
  const now = new Date().toISOString().split('T')[0]
  const expectedDelivery = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const items = (quotation.items || []).map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    tax: quotation.taxRate ?? 5,
    total: it.total,
  }))

  const body = {
    orderNumber: `PO-TEST-${Date.now()}-${runIndex}`,
    customerId: quotation.customerId,
    quotationId: quotation.id,
    date: now,
    expectedDelivery,
    items,
    subtotal: quotation.subtotal,
    taxRate: quotation.taxRate,
    taxAmount: quotation.taxAmount,
    total: quotation.total,
    status: 'received',
    terms: quotation.terms,
    notes: quotation.notes,
  }

  const po = await fetchJson(`${BASE_URL}/api/purchase-orders`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return po
}

async function createInvoice(purchaseOrder, quotation, runIndex) {
  const now = new Date().toISOString().split('T')[0]
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const items = (purchaseOrder.items || []).map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    tax: purchaseOrder.taxRate ?? 5,
    total: it.total,
  }))

  const body = {
    invoiceNumber: `INV-TEST-${Date.now()}-${runIndex}`,
    customerId: purchaseOrder.customerId,
    quotationId: quotation.id,
    date: now,
    dueDate,
    items,
    subtotal: purchaseOrder.subtotal,
    taxRate: purchaseOrder.taxRate,
    taxAmount: purchaseOrder.taxAmount,
    total: purchaseOrder.total,
    paidAmount: 0,
    status: 'sent',
    terms: purchaseOrder.terms,
    notes: purchaseOrder.notes,
  }

  const inv = await fetchJson(`${BASE_URL}/api/invoices`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return inv
}

async function createReceipt(invoice, runIndex) {
  const now = new Date().toISOString().split('T')[0]
  const body = {
    receiptNumber: `RCP-TEST-${Date.now()}-${runIndex}`,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    date: now,
    paymentDate: now,
    amount: invoice.total,
    paymentMethod: 'bank_transfer',
    referenceNumber: `REF-${runIndex + 1}`,
    notes: `Payment for invoice ${invoice.invoiceNumber}`,
    status: 'issued',
  }

  const rcp = await fetchJson(`${BASE_URL}/api/receipts`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return rcp
}

async function run() {
  console.log('========================================')
  console.log('اختبار السلسلة: Quotation → PO → Invoice → Receipt (5 تجارب)')
  console.log('BASE_URL:', BASE_URL)
  console.log('========================================\n')

  let customers = await getCustomers()
  if (customers.length === 0) {
    console.log('لا يوجد عملاء. جاري إنشاء عميل تجريبي...')
    const createRes = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer Flow',
        email: `test-flow-${Date.now()}@test.com`,
        phone: '+971501234567',
        address: 'Test Address',
      }),
    })
    if (!createRes.ok) {
      throw new Error('فشل إنشاء عميل: ' + (await createRes.text()))
    }
    const newCustomer = await createRes.json()
    customers = [newCustomer]
    console.log('تم إنشاء عميل:', newCustomer.name)
  }

  const customerId = customers[0].id
  console.log('استخدام العميل:', customers[0].name, '(' + customerId + ')\n')

  const results = []

  for (let i = 0; i < 5; i++) {
    console.log(`——— تجربة ${i + 1} / 5 ———`)
    try {
      const q = await createQuotation(customerId, i)
      console.log('  ✓ Quotation:', q.quotationNumber, '| id:', q.id)

      const po = await createPurchaseOrder(q, i)
      console.log('  ✓ Purchase Order:', po.orderNumber, '| مرتبط بـ Quotation:', po.quotationId === q.id ? 'نعم' : 'لا')

      const inv = await createInvoice(po, q, i)
      console.log('  ✓ Invoice:', inv.invoiceNumber, '| مرتبط بـ Quotation:', inv.quotationId === q.id ? 'نعم' : 'نعم')

      const rcp = await createReceipt(inv, i)
      console.log('  ✓ Receipt:', rcp.receiptNumber, '| مرتبط بـ Invoice:', rcp.invoiceId === inv.id ? 'نعم' : 'لا')

      results.push({
        run: i + 1,
        quotationId: q.id,
        quotationNumber: q.quotationNumber,
        purchaseOrderId: po.id,
        orderNumber: po.orderNumber,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        receiptId: rcp.id,
        receiptNumber: rcp.receiptNumber,
        total: inv.total,
        ok: true,
      })
      console.log('')
    } catch (err) {
      console.log('  ✗ خطأ:', err.message)
      results.push({ run: i + 1, ok: false, error: err.message })
    }
  }

  const okCount = results.filter((r) => r.ok).length
  console.log('========================================')
  console.log(`النتيجة: ${okCount} / 5 تجارب ناجحة`)
  console.log('========================================')

  if (okCount === 5) {
    console.log('\nالمنظومة تعمل بشكل متكامل:')
    results.forEach((r) => {
      if (r.ok)
        console.log(
          `  ${r.run}. ${r.quotationNumber} → ${r.orderNumber} → ${r.invoiceNumber} → ${r.receiptNumber} (AED ${r.total})`
        )
    })
  } else {
    console.log('\nفشل في بعض التجارب. تحقق من السيرفر وقاعدة البيانات.')
  }

  return okCount === 5 ? 0 : 1
}

run().then((code) => process.exit(code)).catch((err) => {
  console.error(err)
  process.exit(1)
})
