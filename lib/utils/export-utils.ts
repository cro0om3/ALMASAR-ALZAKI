import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from '../utils'
import { settingsService } from '../data/settings-service'

export interface ExportData {
  title: string
  documentNumber: string
  date: string
  customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  items: Array<{
    description: string
    quantity?: number
    hours?: number
    days?: number
    unitPrice: number
    tax?: number
    total: number
    vehicleNumber?: string
  }>
  subtotal: number
  taxRate?: number
  taxAmount?: number
  total: number
  terms?: string
  notes?: string
  additionalFields?: Record<string, any>
}

// Helper function to get company info
function getCompanyInfo() {
  const settings = settingsService.get()
  return {
    name: settings.companyName,
    tradeLicense: settings.tradeLicense,
    taxRegNumber: settings.taxRegNumber,
    phone: settings.phone,
    poBox: settings.poBox,
    email: settings.email,
    address: settings.address,
    logoUrl: settings.logoUrl,
    currency: settings.currencySymbol || settings.currency,
  }
}

export function exportToExcel(data: ExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const workbook = XLSX.utils.book_new()
    
    // Main data sheet with luxury header
    const mainData: any[][] = [
      [company.name], // Company Name
      [`Trade License: ${company.tradeLicense}`],
      [`${company.taxRegNumber}`],
      [`Phone: ${company.phone} | Email: ${company.email}`],
      [`P.O. Box: ${company.poBox} | ${company.address}`],
      [], // Empty row
      ['='.repeat(80)], // Separator
      [], // Empty row
      [data.title.toUpperCase()], // Document Title
      [`Document Number: ${data.documentNumber}`],
      [`Date: ${formatDate(data.date)}`],
      [], // Empty row
    ]

    if (data.customer) {
      mainData.push(['Customer Information'])
      mainData.push(['Name:', data.customer.name])
      if (data.customer.email) mainData.push(['Email:', data.customer.email])
      if (data.customer.phone) mainData.push(['Phone:', data.customer.phone])
      if (data.customer.address) mainData.push(['Address:', data.customer.address])
      mainData.push([])
    }

    // Additional fields
    if (data.additionalFields) {
      Object.entries(data.additionalFields).forEach(([key, value]) => {
        if (value) mainData.push([key + ':', value])
      })
      mainData.push([])
    }

    // Items header
    const headers = ['Description']
    if (data.items.some(item => item.hours)) headers.push('Hours')
    if (data.items.some(item => item.days)) headers.push('Days')
    if (data.items.some(item => item.quantity)) headers.push('Quantity')
    headers.push('Unit Price', 'Tax %', 'Total')
    if (data.items.some(item => item.vehicleNumber)) headers.push('Vehicle #')
    
    mainData.push(headers)

    // Items rows
    data.items.forEach(item => {
      const row: any[] = [item.description]
      if (data.items.some(i => i.hours)) row.push(item.hours || '-')
      if (data.items.some(i => i.days)) row.push(item.days || '-')
      if (data.items.some(i => i.quantity)) row.push(item.quantity || '-')
      row.push(
        item.unitPrice,
        item.tax || 0,
        item.total
      )
      if (data.items.some(i => i.vehicleNumber)) row.push(item.vehicleNumber || '-')
      mainData.push(row)
    })

    // Summary with luxury styling
    mainData.push([])
    mainData.push(['='.repeat(80)]) // Separator
    mainData.push(['Subtotal:', formatCurrency(data.subtotal)])
    if (data.taxRate && data.taxAmount) {
      mainData.push([`Tax (${data.taxRate}%):`, formatCurrency(data.taxAmount)])
    }
    mainData.push(['='.repeat(80)]) // Separator
    mainData.push(['TOTAL:', formatCurrency(data.total)])
    mainData.push(['='.repeat(80)]) // Separator

    if (data.terms) {
      mainData.push([])
      mainData.push(['TERMS & CONDITIONS:'])
      mainData.push(['='.repeat(80)])
      mainData.push([data.terms])
    }

    if (data.notes) {
      mainData.push([])
      mainData.push(['NOTES:'])
      mainData.push(['='.repeat(80)])
      mainData.push([data.notes])
    }

    // Footer
    mainData.push([])
    mainData.push(['='.repeat(80)])
    mainData.push([`Thank you for your business!`])
    mainData.push([`${company.name}`])
    mainData.push([`${company.address} | P.O. Box: ${company.poBox}`])
    mainData.push([`Phone: ${company.phone} | Email: ${company.email}`])

    const worksheet = XLSX.utils.aoa_to_sheet(mainData)
    
    // Set column widths for better formatting
    const colWidths = [{ wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }]
    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Document')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('Failed to export to Excel')
  }
}

export function exportToWord(data: ExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const logoHtml = company.logoUrl 
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 80px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));" />`
      : `<div style="height: 70px; width: 200px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.25); letter-spacing: 0.8px;">${company.name}</div>`
    
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              padding: 30px;
              max-width: 210mm;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
              line-height: 1.6;
            }
            .company-header {
              border-bottom: 3px solid #d4af37;
              padding-bottom: 18px;
              margin-bottom: 30px;
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              padding: 25px 30px;
              border-radius: 10px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 25px;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            .company-header-left {
              flex: 1;
            }
            .company-header-right {
              flex-shrink: 0;
              text-align: right;
            }
            .company-header h1 {
              color: white;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .company-info {
              font-size: 14px;
              line-height: 1.6;
              color: rgba(255, 255, 255, 0.98);
            }
            .company-info p {
              margin: 3px 0;
            }
            .document-title {
              text-align: center;
              color: #0f172a;
              font-size: 32px;
              font-weight: 700;
              margin: 30px 0;
              padding: 18px;
              background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%);
              border-left: 5px solid #d4af37;
              border-right: 5px solid #3b82f6;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              letter-spacing: 1px;
            }
            .header-info {
              margin-bottom: 25px;
              padding: 18px 22px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 10px;
              border-left: 5px solid #1e3a8a;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }
            .header-info p {
              margin: 8px 0;
              font-size: 13px;
              font-weight: 500;
            }
            .customer-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
              padding: 20px 25px;
              border-radius: 10px;
              margin-bottom: 25px;
              border: 2.5px solid #3b82f6;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }
            .customer-info h3 {
              margin-top: 0;
              color: #0f172a;
              font-size: 20px;
              font-weight: 700;
              border-bottom: 2.5px solid #d4af37;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .customer-info p {
              margin: 8px 0;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 25px 0;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
              border-radius: 8px;
              overflow: hidden;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 14px 12px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              color: white;
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              border-bottom: 3px solid #d4af37;
            }
            th:first-child {
              border-top-left-radius: 8px;
            }
            th:last-child {
              border-top-right-radius: 8px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            .summary {
              margin-top: 30px;
              text-align: right;
              padding: 20px 25px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 10px;
              border: 2.5px solid #3b82f6;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
              font-weight: 500;
            }
            .summary-row:last-child {
              border-bottom: none;
            }
            .total {
              font-weight: 700;
              font-size: 22px;
              color: #0f172a;
              padding-top: 12px;
              margin-top: 8px;
              border-top: 3px solid #d4af37;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 12px 15px;
              border-radius: 6px;
            }
            .terms-notes {
              margin-top: 30px;
              padding: 20px 25px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
              border-left: 5px solid #d4af37;
              border-radius: 10px;
              box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
            }
            .terms-notes h3 {
              margin-top: 0;
              color: #0f172a;
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 3px solid #d4af37;
              text-align: center;
              color: #1e3a8a;
              font-size: 11px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 20px;
              border-radius: 8px;
            }
            .footer p {
              margin: 5px 0;
              line-height: 1.6;
            }
            .footer p:first-child {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="company-header">
            <div class="company-header-left">
              <div class="company-info">
                <p><strong>${company.name}</strong></p>
                <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
                <p>${company.address} | P.O. Box: ${company.poBox}</p>
                <p>Phone: ${company.phone} | Email: ${company.email}</p>
              </div>
            </div>
            <div class="company-header-right">
              ${logoHtml}
            </div>
          </div>
          
          <div class="document-title">${data.title.toUpperCase()}</div>
          
          <div class="header-info">
            <p><strong>Document Number:</strong> ${data.documentNumber}</p>
            <p><strong>Date:</strong> ${formatDate(data.date)}</p>
          </div>
    `

    if (data.customer) {
      html += `
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${data.customer.name}</p>
            ${data.customer.email ? `<p><strong>Email:</strong> ${data.customer.email}</p>` : ''}
            ${data.customer.phone ? `<p><strong>Phone:</strong> ${data.customer.phone}</p>` : ''}
            ${data.customer.address ? `<p><strong>Address:</strong> ${data.customer.address}</p>` : ''}
          </div>
      `
    }

    if (data.additionalFields) {
      html += '<div class="header-info">'
      Object.entries(data.additionalFields).forEach(([key, value]) => {
        if (value) html += `<p><strong>${key}:</strong> ${value}</p>`
      })
      html += '</div>'
    }

    html += `
          <table>
            <thead>
              <tr>
                <th>Description</th>
    `
    
    if (data.items.some(item => item.hours)) html += '<th>Hours</th>'
    if (data.items.some(item => item.days)) html += '<th>Days</th>'
    if (data.items.some(item => item.quantity)) html += '<th>Quantity</th>'
    if (data.items.some(item => item.vehicleNumber)) html += '<th>Vehicle #</th>'
    
    html += `
                <th>Unit Price</th>
                <th>Tax %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
    `

    data.items.forEach(item => {
      html += '<tr>'
      html += `<td>${item.description}</td>`
      if (data.items.some(i => i.hours)) html += `<td>${item.hours || '-'}</td>`
      if (data.items.some(i => i.days)) html += `<td>${item.days || '-'}</td>`
      if (data.items.some(i => i.quantity)) html += `<td>${item.quantity || '-'}</td>`
      if (data.items.some(i => i.vehicleNumber)) html += `<td>${item.vehicleNumber || '-'}</td>`
      html += `
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${item.tax || 0}%</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>
      `
    })

    html += `
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
    `

    if (data.taxRate && data.taxAmount) {
      html += `
            <div class="summary-row">
              <span>Tax (${data.taxRate}%):</span>
              <span>${formatCurrency(data.taxAmount)}</span>
            </div>
      `
    }

    html += `
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(data.total)}</span>
            </div>
          </div>
    `

    if (data.terms) {
      html += `
          <div class="terms-notes">
            <h3>Terms & Conditions</h3>
            <p>${data.terms.replace(/\n/g, '<br>')}</p>
          </div>
      `
    }

    if (data.notes) {
      html += `
          <div class="terms-notes">
            <h3>Notes</h3>
            <p>${data.notes.replace(/\n/g, '<br>')}</p>
          </div>
      `
    }

    html += `
          <div class="footer">
            <p>${company.name}</p>
            <p>${company.address} | P.O. Box: ${company.poBox} | Phone: ${company.phone} | Email: ${company.email}</p>
            <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to Word:', error)
    throw new Error('Failed to export to Word')
  }
}

export function exportToPDF(data: ExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const logoHtml = company.logoUrl 
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 60px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />`
      : `<div style="height: 50px; width: 160px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.5px;">${company.name}</div>`
    
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          <style>
            @media print {
              body { margin: 0; padding: 12mm; }
              @page { 
                margin: 12mm;
                size: A4;
              }
              .no-print { display: none; }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              padding: 12mm;
              max-width: 210mm;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
              font-size: 10px;
              line-height: 1.5;
            }
            .company-header {
              border-bottom: 3px solid #d4af37;
              padding-bottom: 10px;
              margin-bottom: 15px;
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              padding: 15px 18px;
              border-radius: 8px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            .company-header-left {
              flex: 1;
            }
            .company-header-right {
              flex-shrink: 0;
              text-align: right;
            }
            .company-header h1 {
              color: white;
              margin: 0 0 6px 0;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .company-info {
              font-size: 11px;
              line-height: 1.5;
              color: rgba(255, 255, 255, 0.98);
            }
            .company-info p {
              margin: 2px 0;
            }
            .document-title {
              text-align: center;
              color: #0f172a;
              font-size: 24px;
              font-weight: 700;
              margin: 20px 0;
              padding: 14px;
              background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%);
              border-left: 4px solid #d4af37;
              border-right: 4px solid #3b82f6;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              letter-spacing: 1px;
            }
            .header-info {
              margin-bottom: 15px;
              padding: 12px 15px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 8px;
              border-left: 4px solid #1e3a8a;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            .header-info p {
              margin: 5px 0;
              font-size: 10px;
              font-weight: 500;
            }
            .customer-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
              padding: 12px 15px;
              border-radius: 8px;
              margin-bottom: 15px;
              border: 2px solid #3b82f6;
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
            }
            .customer-info h3 {
              margin-top: 0;
              color: #0f172a;
              font-size: 12px;
              font-weight: 700;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .customer-info p {
              margin: 5px 0;
              font-size: 9.5px;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 15px 0;
              font-size: 9px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              border-radius: 6px;
              overflow: hidden;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 8px 6px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              color: white;
              font-weight: 700;
              font-size: 9.5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #d4af37;
            }
            th:first-child {
              border-top-left-radius: 6px;
            }
            th:last-child {
              border-top-right-radius: 6px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            .summary {
              margin-top: 15px;
              text-align: right;
              padding: 12px 15px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 8px;
              border: 2px solid #3b82f6;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 10px;
              font-weight: 500;
            }
            .summary-row:last-child {
              border-bottom: none;
            }
            .total {
              font-weight: 700;
              font-size: 13px;
              color: #0f172a;
              padding-top: 8px;
              margin-top: 5px;
              border-top: 3px solid #d4af37;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 8px 10px;
              border-radius: 4px;
            }
            .terms-notes {
              margin-top: 15px;
              padding: 12px 15px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
              border-left: 4px solid #d4af37;
              border-radius: 8px;
              font-size: 9.5px;
              box-shadow: 0 2px 6px rgba(212, 175, 55, 0.15);
            }
            .terms-notes h3 {
              margin-top: 0;
              color: #0f172a;
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 6px;
            }
            .footer {
              margin-top: 20px;
              padding-top: 12px;
              border-top: 3px solid #d4af37;
              text-align: center;
              color: #1e3a8a;
              font-size: 9px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 12px;
              border-radius: 6px;
            }
            .footer p {
              margin: 4px 0;
              line-height: 1.6;
            }
            .footer p:first-child {
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            }
            .amount-words {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="company-header">
            <div class="company-header-left">
              <div class="company-info">
                <p><strong>${company.name}</strong></p>
                <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
                <p>${company.address} | P.O. Box: ${company.poBox}</p>
                <p>Phone: ${company.phone} | Email: ${company.email}</p>
              </div>
            </div>
            <div class="company-header-right">
              ${logoHtml}
            </div>
          </div>
          
          <div class="document-title">${data.title.toUpperCase()}</div>
          
          <div class="header-info">
            <p><strong>Document Number:</strong> ${data.documentNumber}</p>
            <p><strong>Date:</strong> ${formatDate(data.date)}</p>
          </div>
    `

    if (data.customer) {
      html += `
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${data.customer.name}</p>
            ${data.customer.email ? `<p><strong>Email:</strong> ${data.customer.email}</p>` : ''}
            ${data.customer.phone ? `<p><strong>Phone:</strong> ${data.customer.phone}</p>` : ''}
            ${data.customer.address ? `<p><strong>Address:</strong> ${data.customer.address}</p>` : ''}
          </div>
      `
    }

    if (data.additionalFields) {
      html += '<div class="header-info">'
      Object.entries(data.additionalFields).forEach(([key, value]) => {
        if (value) html += `<p><strong>${key}:</strong> ${value}</p>`
      })
      html += '</div>'
    }

    html += `
          <table>
            <thead>
              <tr>
                <th>Description</th>
    `
    
    if (data.items.some(item => item.hours)) html += '<th>Hours</th>'
    if (data.items.some(item => item.days)) html += '<th>Days</th>'
    if (data.items.some(item => item.quantity)) html += '<th>Quantity</th>'
    if (data.items.some(item => item.vehicleNumber)) html += '<th>Vehicle #</th>'
    
    html += `
                <th>Unit Price</th>
                <th>Tax %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
    `

    data.items.forEach(item => {
      html += '<tr>'
      html += `<td>${item.description}</td>`
      if (data.items.some(i => i.hours)) html += `<td>${item.hours || '-'}</td>`
      if (data.items.some(i => i.days)) html += `<td>${item.days || '-'}</td>`
      if (data.items.some(i => i.quantity)) html += `<td>${item.quantity || '-'}</td>`
      if (data.items.some(i => i.vehicleNumber)) html += `<td>${item.vehicleNumber || '-'}</td>`
      html += `
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${item.tax || 0}%</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>
      `
    })

    html += `
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
    `

    if (data.taxRate && data.taxAmount) {
      html += `
            <div class="summary-row">
              <span>Tax (${data.taxRate}%):</span>
              <span>${formatCurrency(data.taxAmount)}</span>
            </div>
      `
    }

    html += `
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(data.total)}</span>
            </div>
          </div>
    `

    if (data.terms) {
      html += `
          <div class="terms-notes">
            <h3>Terms & Conditions</h3>
            <p>${data.terms.replace(/\n/g, '<br>')}</p>
          </div>
      `
    }

    if (data.notes) {
      html += `
          <div class="terms-notes">
            <h3>Notes</h3>
            <p>${data.notes.replace(/\n/g, '<br>')}</p>
          </div>
      `
    }

    html += `
          <div class="footer">
            <p>${company.name}</p>
            <p>${company.address} | P.O. Box: ${company.poBox} | Phone: ${company.phone} | Email: ${company.email}</p>
            <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('Failed to export to PDF')
  }
}

// Simple customer export functions
export interface CustomerExportData {
  name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
}

export function exportCustomerToExcel(customer: CustomerExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const workbook = XLSX.utils.book_new()
    
    const data: any[][] = [
      [company.name],
      [`Trade License: ${company.tradeLicense}`],
      [`${company.taxRegNumber}`],
      [`Phone: ${company.phone} | Email: ${company.email}`],
      [`P.O. Box: ${company.poBox} | ${company.address}`],
      [],
      ['='.repeat(80)],
      [],
      ['CUSTOMER INFORMATION'],
      [],
      ['Name:', customer.name || ''],
      ['Email:', customer.email || ''],
      ['Phone:', customer.phone || ''],
      ['Address:', customer.address || ''],
      ['City:', customer.city || ''],
      ['State:', customer.state || ''],
      ['Zip Code:', customer.zipCode || ''],
      ['Country:', customer.country || ''],
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting customer to Excel:', error)
    throw new Error('Failed to export customer to Excel')
  }
}

export function exportCustomerToWord(customer: CustomerExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const doc = document.implementation.createHTMLDocument('Customer Export')
    const logoHtml = company.logoUrl 
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 90px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); float: right; margin-left: 20px;" />`
      : `<div style="height: 80px; width: 200px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.5px; float: right; margin-left: 20px;">${company.name}</div>`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Customer Information</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #d4af37;
              padding: 2px 6px;
              margin-bottom: 8px;
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              border-radius: 4px;
              color: white;
              overflow: hidden;
            }
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 8px;
            }
            .header-left {
              flex: 1;
              min-width: 0;
            }
            .header-right {
              flex-shrink: 0;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              color: white;
              margin-bottom: 1px;
            }
            .company-info {
              font-size: 9px;
              color: rgba(255, 255, 255, 0.98);
              line-height: 1.25;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #0f172a;
              margin: 30px 0;
              text-align: center;
            }
            .customer-info {
              background: #f8fafc;
              padding: 25px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #1e3a8a;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <div class="header-left">
                <div class="company-name">${company.name}</div>
                <div class="company-info">
                  ${company.tradeLicense} | ${company.taxRegNumber}<br>
                  ${company.address} | P.O. Box: ${company.poBox}<br>
                  Phone: ${company.phone} | Email: ${company.email}
                </div>
              </div>
              <div class="header-right">
                ${logoHtml}
              </div>
            </div>
          </div>
          <div class="title">Customer Information</div>
          <div class="customer-info">
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${customer.name || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${customer.email || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value">${customer.phone || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Address:</div>
              <div class="info-value">${customer.address || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">City:</div>
              <div class="info-value">${customer.city || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">State:</div>
              <div class="info-value">${customer.state || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Zip Code:</div>
              <div class="info-value">${customer.zipCode || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Country:</div>
              <div class="info-value">${customer.country || ''}</div>
            </div>
          </div>
        </body>
      </html>
    `
    
    doc.documentElement.innerHTML = html
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.doc`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting customer to Word:', error)
    throw new Error('Failed to export customer to Word')
  }
}

export function exportCustomerToPDF(customer: CustomerExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const logoHtml = company.logoUrl 
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 90px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />`
      : `<div style="height: 80px; width: 200px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.5px;">${company.name}</div>`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Customer Information</title>
          <style>
            @media print {
              body { margin: 0; padding: 12mm; }
              @page { margin: 12mm; size: A4; }
              .no-print { display: none; }
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              padding: 12mm;
              max-width: 210mm;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
              font-size: 10px;
            }
            .company-header {
              border-bottom: 2px solid #d4af37;
              padding: 2px 6px;
              margin-bottom: 8px;
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              border-radius: 4px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 8px;
            }
            .company-header-left { flex: 1; min-width: 0; }
            .company-header-right { flex-shrink: 0; text-align: right; }
            .company-header h1 {
              color: white;
              margin: 0 0 1px 0;
              font-size: 14px;
              font-weight: 700;
            }
            .company-info {
              font-size: 9px;
              line-height: 1.25;
              color: rgba(255, 255, 255, 0.98);
            }
            .company-info p { margin: 0; }
            .document-title {
              text-align: center;
              color: #0f172a;
              font-size: 24px;
              font-weight: 700;
              margin: 20px 0;
              padding: 14px;
              background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%);
              border-left: 4px solid #d4af37;
              border-right: 4px solid #3b82f6;
              border-radius: 6px;
            }
            .customer-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 15px;
              border: 2px solid #3b82f6;
            }
            .customer-info h3 {
              margin-top: 0;
              color: #0f172a;
              font-size: 14px;
              font-weight: 700;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
              font-size: 11px;
            }
            .info-label {
              font-weight: 700;
              width: 120px;
              color: #1e3a8a;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
            }
            .footer {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 3px solid #d4af37;
              text-align: center;
              color: #1e3a8a;
              font-size: 9px;
            }
            .footer p {
              margin: 4px 0;
              line-height: 1.6;
            }
            .footer p:first-child {
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            }
          </style>
        </head>
        <body>
          <div class="company-header">
            <div class="company-header-left">
              <div class="company-info">
                <p><strong>${company.name}</strong></p>
                <p>${company.address}</p>
                <p>P.O. Box: ${company.poBox} | Phone: ${company.phone}</p>
                <p>Email: ${company.email}</p>
                <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
              </div>
            </div>
            <div class="company-header-right">
              ${logoHtml}
            </div>
          </div>
          <div class="document-title">Customer Information</div>
          <div class="customer-info">
            <h3>Customer Details</h3>
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${customer.name || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${customer.email || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value">${customer.phone || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Address:</div>
              <div class="info-value">${customer.address || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">City:</div>
              <div class="info-value">${customer.city || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">State:</div>
              <div class="info-value">${customer.state || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Zip Code:</div>
              <div class="info-value">${customer.zipCode || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Country:</div>
              <div class="info-value">${customer.country || ''}</div>
            </div>
          </div>
          <div class="footer">
            <p><strong>${company.name}</strong></p>
            <p>${company.address} | P.O. Box: ${company.poBox} | Phone: ${company.phone} | Email: ${company.email}</p>
            <p>${company.tradeLicense} | ${company.taxRegNumber}</p>
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  } catch (error) {
    console.error('Error exporting customer to PDF:', error)
    throw new Error('Failed to export customer to PDF')
  }
}

// Vendor export (same structure as customer)
export interface VendorExportData {
  name?: string | null
  email?: string | null
  phone?: string | null
  contactPerson?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
}

export function exportVendorToExcel(vendor: VendorExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const workbook = XLSX.utils.book_new()
    const data: any[][] = [
      [company.name],
      [`Trade License: ${company.tradeLicense}`],
      [`${company.taxRegNumber}`],
      [`Phone: ${company.phone} | Email: ${company.email}`],
      [`P.O. Box: ${company.poBox} | ${company.address}`],
      [],
      ['='.repeat(80)],
      [],
      ['VENDOR INFORMATION'],
      [],
      ['Name:', vendor.name || ''],
      ['Email:', vendor.email || ''],
      ['Phone:', vendor.phone || ''],
      ['Contact Person:', vendor.contactPerson || ''],
      ['Address:', vendor.address || ''],
      ['City:', vendor.city || ''],
      ['State:', vendor.state || ''],
      ['Zip Code:', vendor.zipCode || ''],
      ['Country:', vendor.country || ''],
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting vendor to Excel:', error)
    throw new Error('Failed to export vendor to Excel')
  }
}

export function exportVendorToWord(vendor: VendorExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const logoHtml = company.logoUrl
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 90px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); float: right; margin-left: 20px;" />`
      : `<div style="height: 80px; width: 200px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.5px; float: right; margin-left: 20px;">${company.name}</div>`
    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vendor Information</title></head><body>
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      ${logoHtml}
      <h1 style="color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">VENDOR INFORMATION</h1>
      <p><strong>Name:</strong> ${vendor.name || ''}</p>
      <p><strong>Email:</strong> ${vendor.email || ''}</p>
      <p><strong>Phone:</strong> ${vendor.phone || ''}</p>
      <p><strong>Contact Person:</strong> ${vendor.contactPerson || ''}</p>
      <p><strong>Address:</strong> ${vendor.address || ''}</p>
      <p><strong>City:</strong> ${vendor.city || ''}</p>
      <p><strong>State:</strong> ${vendor.state || ''}</p>
      <p><strong>Zip Code:</strong> ${vendor.zipCode || ''}</p>
      <p><strong>Country:</strong> ${vendor.country || ''}</p>
      <p style="margin-top: 24px; font-size: 11px; color: #64748b;">${company.name} | ${company.address} | ${company.phone} | ${company.email}</p>
      </div></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.doc`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting vendor to Word:', error)
    throw new Error('Failed to export vendor to Word')
  }
}

export function exportVendorToPDF(vendor: VendorExportData, filename: string) {
  try {
    const company = getCompanyInfo()
    const logoHtml = company.logoUrl
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 90px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />`
      : `<div style="height: 80px; width: 200px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.5px;">${company.name}</div>`
    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vendor Information</title>
      <style>@media print { body { margin: 0; padding: 12mm; } @page { margin: 12mm; size: A4; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 12mm; max-width: 210mm; margin: 0 auto; background: #fff; color: #1f2937; font-size: 10px; }
      .doc-title { text-align: center; color: #0f172a; font-size: 24px; font-weight: 700; margin: 20px 0; padding: 14px; background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%); border-left: 4px solid #d4af37; border-right: 4px solid #3b82f6; border-radius: 6px; }
      .vendor-info { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%); padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #3b82f6; }
      .vendor-info h3 { margin-top: 0; color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-bottom: 12px; }
      .info-row { display: flex; margin-bottom: 10px; font-size: 11px; } .info-label { font-weight: 700; width: 140px; color: #1e3a8a; } .info-value { flex: 1; color: #1f2937; }
      .footer { margin-top: 30px; padding-top: 12px; border-top: 3px solid #d4af37; text-align: center; color: #1e3a8a; font-size: 9px; }</style></head><body>
      <div class="doc-title">Vendor Information</div>
      <div class="vendor-info"><h3>Vendor Details</h3>
      <div class="info-row"><div class="info-label">Name:</div><div class="info-value">${vendor.name || ''}</div></div>
      <div class="info-row"><div class="info-label">Email:</div><div class="info-value">${vendor.email || ''}</div></div>
      <div class="info-row"><div class="info-label">Phone:</div><div class="info-value">${vendor.phone || ''}</div></div>
      <div class="info-row"><div class="info-label">Contact Person:</div><div class="info-value">${vendor.contactPerson || ''}</div></div>
      <div class="info-row"><div class="info-label">Address:</div><div class="info-value">${vendor.address || ''}</div></div>
      <div class="info-row"><div class="info-label">City:</div><div class="info-value">${vendor.city || ''}</div></div>
      <div class="info-row"><div class="info-label">State:</div><div class="info-value">${vendor.state || ''}</div></div>
      <div class="info-row"><div class="info-label">Zip Code:</div><div class="info-value">${vendor.zipCode || ''}</div></div>
      <div class="info-row"><div class="info-label">Country:</div><div class="info-value">${vendor.country || ''}</div></div>
      </div>
      <div class="footer"><p><strong>${company.name}</strong></p><p>${company.address} | P.O. Box: ${company.poBox} | Phone: ${company.phone} | Email: ${company.email}</p><p>${company.tradeLicense} | ${company.taxRegNumber}</p></div>
      </body></html>`
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  } catch (error) {
    console.error('Error exporting vendor to PDF:', error)
    throw new Error('Failed to export vendor to PDF')
  }
}
