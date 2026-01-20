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
    discount?: number
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
    headers.push('Unit Price', 'Discount %', 'Tax %', 'Total')
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
        item.discount || 0,
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
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 160px; width: auto; object-fit: contain;" />`
      : `<div style="height: 100px; width: 250px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border-radius: 8px;">${company.name}</div>`
    
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
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 40px;
              max-width: 210mm;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
            }
            .company-header {
              border-bottom: 2px solid #d4af37;
              padding-bottom: 15px;
              margin-bottom: 25px;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 20px;
              border-radius: 8px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
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
              margin: 0 0 8px 0;
              font-size: 22px;
              font-weight: bold;
            }
            .company-info {
              font-size: 11px;
              line-height: 1.5;
              color: rgba(255, 255, 255, 0.95);
            }
            .company-info p {
              margin: 2px 0;
            }
            .document-title {
              text-align: center;
              color: #1e3a8a;
              font-size: 28px;
              font-weight: bold;
              margin: 25px 0;
              padding: 12px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-left: 5px solid #d4af37;
              border-radius: 5px;
            }
            .header-info {
              margin-bottom: 25px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
              border-left: 4px solid #1e3a8a;
            }
            .header-info p {
              margin: 6px 0;
              font-size: 13px;
            }
            .customer-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 25px;
              border: 2px solid #3b82f6;
            }
            .customer-info h3 {
              margin-top: 0;
              color: #1e3a8a;
              font-size: 18px;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 10px;
            }
            .customer-info p {
              margin: 8px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              font-weight: bold;
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            tr:hover {
              background-color: #f0f9ff;
            }
            .summary {
              margin-top: 30px;
              text-align: right;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              border: 2px solid #3b82f6;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .summary-row:last-child {
              border-bottom: none;
            }
            .total {
              font-weight: bold;
              font-size: 20px;
              color: #1e3a8a;
              padding-top: 10px;
              border-top: 3px solid #d4af37;
            }
            .terms-notes {
              margin-top: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 5px solid #d4af37;
              border-radius: 8px;
            }
            .terms-notes h3 {
              margin-top: 0;
              color: #1e3a8a;
              font-size: 18px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 3px solid #d4af37;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
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
                <th>Discount %</th>
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
        <td>${item.discount || 0}%</td>
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
            <p><strong>${company.name}</strong></p>
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
      ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 140px; width: auto; object-fit: contain;" />`
      : `<div style="height: 90px; width: 220px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; border-radius: 6px;">${company.name}</div>`
    
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          <style>
            @media print {
              body { margin: 0; padding: 15mm; }
              @page { 
                margin: 15mm;
                size: A4;
              }
              .no-print { display: none; }
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 20px;
              max-width: 210mm;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
            }
            .company-header {
              border-bottom: 2px solid #d4af37;
              padding-bottom: 12px;
              margin-bottom: 20px;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 18px;
              border-radius: 8px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
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
              font-size: 20px;
              font-weight: bold;
            }
            .company-info {
              font-size: 10px;
              line-height: 1.4;
              color: rgba(255, 255, 255, 0.95);
            }
            .company-info p {
              margin: 2px 0;
            }
            .document-title {
              text-align: center;
              color: #1e3a8a;
              font-size: 28px;
              font-weight: bold;
              margin: 25px 0;
              padding: 12px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-left: 5px solid #d4af37;
              border-radius: 5px;
            }
            .header-info {
              margin-bottom: 25px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
              border-left: 4px solid #1e3a8a;
            }
            .header-info p {
              margin: 6px 0;
              font-size: 13px;
            }
            .customer-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border: 2px solid #3b82f6;
            }
            .customer-info h3 {
              margin-top: 0;
              color: #1e3a8a;
              font-size: 16px;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 8px;
            }
            .customer-info p {
              margin: 6px 0;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 11px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px 8px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              font-weight: bold;
              font-size: 12px;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .summary {
              margin-top: 25px;
              text-align: right;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
              border: 2px solid #3b82f6;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            .summary-row:last-child {
              border-bottom: none;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
              color: #1e3a8a;
              padding-top: 8px;
              border-top: 3px solid #d4af37;
            }
            .terms-notes {
              margin-top: 25px;
              padding: 15px;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 5px solid #d4af37;
              border-radius: 8px;
              font-size: 12px;
            }
            .terms-notes h3 {
              margin-top: 0;
              color: #1e3a8a;
              font-size: 16px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 3px solid #d4af37;
              text-align: center;
              color: #6b7280;
              font-size: 11px;
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
                <th>Discount %</th>
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
        <td>${item.discount || 0}%</td>
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
    console.error('Error exporting to PDF:', error)
    throw new Error('Failed to export to PDF')
  }
}
