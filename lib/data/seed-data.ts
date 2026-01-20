// Dummy Data for Testing

import { customerService, quotationService, projectService, usageService, vehicleService, invoiceService } from "./index"
import { Customer, Quotation, Invoice } from "@/types"
import { Project } from "@/types/project"
import { numberToWords } from "@/lib/utils"

export function seedDummyData() {
  // Check if data already exists
  if (customerService.getAll().length > 0) {
    console.log("Data already exists. Skipping seed.")
    return
  }

  console.log("Seeding dummy data...")

  // 1. Create Customers
  const customer1 = customerService.create({
    name: "Modern Construction Co.",
    email: "info@modern-construction.com",
    phone: "+971501234567",
    address: "King Fahd Road",
    city: "Abu Dhabi",
    state: "Abu Dhabi",
    zipCode: "12345",
    country: "UAE",
  })

  const customer2 = customerService.create({
    name: "Fast Transport Inc.",
    email: "contact@fast-transport.com",
    phone: "+971507654321",
    address: "Al Khaleej Street",
    city: "Dubai",
    state: "Dubai",
    zipCode: "21421",
    country: "UAE",
  })

  // 2. Create Vehicles
  const vehicle1 = vehicleService.create({
    make: "Mercedes",
    model: "Actros",
    year: 2022,
    licensePlate: "ABC-1234",
    vin: "WDB9066331N123456",
    color: "White",
    mileage: 50000,
    purchaseDate: "2022-01-15",
    purchasePrice: 500000,
    status: "active",
    notes: "Tanker truck - Ready for work",
  })

  const vehicle2 = vehicleService.create({
    make: "Volvo",
    model: "FH16",
    year: 2023,
    licensePlate: "XYZ-5678",
    vin: "YV1RS5521E1234567",
    color: "Blue",
    mileage: 30000,
    purchaseDate: "2023-03-20",
    purchasePrice: 600000,
    status: "active",
    notes: "Heavy transport truck",
  })

  // 3. Create Quotations with Hours/Days support
  const quotation1 = quotationService.create({
    quotationNumber: "QT-2024-001",
    customerId: customer1.id,
    date: "2024-01-15",
    validUntil: "2024-02-15",
    billingType: "hours",
    items: [
      {
        id: "item-1",
        description: "Hiring of 2xl Trailer - Hourly Rate",
        quantity: 250,
        unitPrice: 51.923,
        discount: 0,
        tax: 5,
        total: 13629.7875,
        hours: 250,
        billingType: "hours",
      },
    ],
    subtotal: 12980.75,
    taxRate: 5,
    taxAmount: 649.0375,
    discount: 0,
    total: 13629.7875,
    status: "accepted",
    terms: "Payment within 30 days",
    notes: "Road maintenance project",
  })

  const quotation2 = quotationService.create({
    quotationNumber: "QT-2024-002",
    customerId: customer2.id,
    date: "2024-01-20",
    validUntil: "2024-02-20",
    billingType: "days",
    items: [
      {
        id: "item-1",
        description: "Vehicle Rental - Daily Rate",
        quantity: 5,
        unitPrice: 3000,
        discount: 5,
        tax: 5,
        total: 14962.5,
        days: 5,
        billingType: "days",
      },
    ],
    subtotal: 14250,
    taxRate: 5,
    taxAmount: 712.5,
    discount: 0,
    total: 14962.5,
    status: "accepted",
    terms: "Cash payment",
    notes: "Material transport project",
  })

  // 4. Create Projects
  const project1 = projectService.create({
    projectNumber: "PRJ-2024-001",
    quotationId: quotation1.id,
    customerId: customer1.id,
    title: "Road Maintenance Project - Abu Dhabi",
    description: "Comprehensive road maintenance for King Fahd Road",
    startDate: "2024-01-20",
    billingType: "hours",
    hourlyRate: 51.923,
    poNumber: "PO-2024-001",
    poDate: "2024-01-18",
    poReceived: true,
    assignedVehicles: [vehicle1.id],
    status: "active",
    terms: "Monthly payment",
    notes: "Ongoing project",
  })

  const project2 = projectService.create({
    projectNumber: "PRJ-2024-002",
    quotationId: quotation2.id,
    customerId: customer2.id,
    title: "Material Transport Project - Dubai",
    description: "Material transport for residential project",
    startDate: "2024-01-25",
    billingType: "days",
    dailyRate: 3000,
    poNumber: "PO-2024-002",
    poDate: "2024-01-22",
    poReceived: true,
    assignedVehicles: [vehicle2.id],
    status: "active",
    terms: "Cash payment",
    notes: "5 days project",
  })

  // 5. Create Usage Entries for Project 1 (Hours)
  usageService.create({
    projectId: project1.id,
    vehicleId: vehicle1.id,
    date: "2024-01-20",
    hours: 250,
    description: "Road maintenance - North area",
    location: "Abu Dhabi - King Fahd Road",
    rate: 51.923,
  })

  usageService.create({
    projectId: project1.id,
    vehicleId: vehicle1.id,
    date: "2024-01-21",
    hours: 250,
    description: "Road maintenance - South area",
    location: "Abu Dhabi - Ring Road",
    rate: 51.923,
  })

  usageService.create({
    projectId: project1.id,
    vehicleId: vehicle1.id,
    date: "2024-01-22",
    hours: 250,
    description: "Road maintenance - East area",
    location: "Abu Dhabi - King Khalid Road",
    rate: 51.923,
  })

  // 6. Create Usage Entries for Project 2 (Days)
  usageService.create({
    projectId: project2.id,
    vehicleId: vehicle2.id,
    date: "2024-01-25",
    days: 1,
    description: "Material transport - Day 1",
    location: "Dubai - Coastal Project",
    rate: 3000,
  })

  usageService.create({
    projectId: project2.id,
    vehicleId: vehicle2.id,
    date: "2024-01-26",
    days: 1,
    description: "Material transport - Day 2",
    location: "Dubai - Coastal Project",
    rate: 3000,
  })

  usageService.create({
    projectId: project2.id,
    vehicleId: vehicle2.id,
    date: "2024-01-27",
    days: 1,
    description: "Material transport - Day 3",
    location: "Dubai - Coastal Project",
    rate: 3000,
  })

  // 7. Create Sample Invoices (matching PDF format)
  const invoice1 = invoiceService.create({
    invoiceNumber: "INV-2024-001",
    quotationId: quotation1.id,
    customerId: customer1.id,
    date: "2024-01-31",
    dueDate: "2024-02-28",
    billingType: "hours",
    projectName: "Road Maintenance Project - Riyadh",
    lpoNumber: "PO-2024-001",
    scopeOfWork: "Hiring 2xl Trailer charge of Dec-2024",
    items: [
      {
        id: "item-1",
        description: "Hiring of 2xl Trailer",
        quantity: 250,
        unitPrice: 51.923,
        discount: 0,
        tax: 5,
        total: 13629.7875,
        hours: 250,
        vehicleNumber: "22058",
        grossAmount: 12980.75,
        billingType: "hours",
      },
      {
        id: "item-2",
        description: "Hiring of 2xl Trailer",
        quantity: 250,
        unitPrice: 51.923,
        discount: 0,
        tax: 5,
        total: 13629.7875,
        hours: 250,
        vehicleNumber: "5782",
        grossAmount: 12980.75,
        billingType: "hours",
      },
      {
        id: "item-3",
        description: "Hiring of 2xl Trailer",
        quantity: 250,
        unitPrice: 51.923,
        discount: 0,
        tax: 5,
        total: 13629.7875,
        hours: 250,
        vehicleNumber: "51504",
        grossAmount: 12980.75,
        billingType: "hours",
      },
      {
        id: "item-4",
        description: "Hiring of 2xl Trailer",
        quantity: 250,
        unitPrice: 51.923,
        discount: 0,
        tax: 5,
        total: 13629.7875,
        hours: 250,
        vehicleNumber: "85273",
        grossAmount: 12980.75,
        billingType: "hours",
      },
    ],
    subtotal: 51923,
    taxRate: 5,
    taxAmount: 2596.15,
    discount: 0,
    total: 54519.15,
    paidAmount: 0,
    status: "draft",
    terms: "Payment due within 30 days",
    notes: "Monthly invoice for December 2024",
    amountInWords: numberToWords(54519.15),
  })

  const invoice2 = invoiceService.create({
    invoiceNumber: "INV-2024-002",
    quotationId: quotation2.id,
    customerId: customer2.id,
    date: "2024-01-31",
    dueDate: "2024-02-28",
    billingType: "days",
    projectName: "Material Transport Project - Jeddah",
    lpoNumber: "PO-2024-002",
    scopeOfWork: "Daily vehicle rental for material transport",
    items: [
      {
        id: "item-1",
        description: "Vehicle Rental - Daily Rate",
        quantity: 5,
        unitPrice: 3000,
        discount: 5,
        tax: 5,
        total: 14962.5,
        days: 5,
        vehicleNumber: vehicle2.licensePlate,
        grossAmount: 14250,
        billingType: "days",
      },
    ],
    subtotal: 14250,
    taxRate: 5,
    taxAmount: 712.5,
    discount: 0,
    total: 14962.5,
    paidAmount: 0,
    status: "sent",
    terms: "Payment upon delivery",
    notes: "Invoice for 5 days rental",
    amountInWords: numberToWords(14962.5),
  })

  console.log("✅ Dummy data seeded successfully!")
  console.log(`- ${customerService.getAll().length} customers`)
  console.log(`- ${quotationService.getAll().length} quotations`)
  console.log(`- ${projectService.getAll().length} projects`)
  console.log(`- ${usageService.getAll().length} usage entries`)
  console.log(`- ${vehicleService.getAll().length} vehicles`)
  console.log(`- ${invoiceService.getAll().length} invoices`)
}
