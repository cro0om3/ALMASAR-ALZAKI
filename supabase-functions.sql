-- ============================================
-- Supabase Database Functions & Triggers
-- ============================================

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for customers table
DROP TRIGGER IF EXISTS update_customers_updated_at ON "customers";
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON "customers"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vendors table
DROP TRIGGER IF EXISTS update_vendors_updated_at ON "vendors";
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON "vendors"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vehicles table
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON "vehicles";
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON "vehicles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for employees table
DROP TRIGGER IF EXISTS update_employees_updated_at ON "employees";
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON "employees"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quotations table
DROP TRIGGER IF EXISTS update_quotations_updated_at ON "quotations";
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON "quotations"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices table
DROP TRIGGER IF EXISTS update_invoices_updated_at ON "invoices";
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON "invoices"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for purchase_orders table
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON "purchase_orders";
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON "purchase_orders"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for receipts table
DROP TRIGGER IF EXISTS update_receipts_updated_at ON "receipts";
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON "receipts"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payslips table
DROP TRIGGER IF EXISTS update_payslips_updated_at ON "payslips";
CREATE TRIGGER update_payslips_updated_at
    BEFORE UPDATE ON "payslips"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to calculate invoice total automatically
-- ============================================

CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total from items
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO NEW.subtotal
    FROM "invoice_items"
    WHERE "invoiceId" = NEW.id;
    
    -- Calculate tax amount
    NEW."taxAmount" := NEW.subtotal * (NEW."taxRate" / 100);
    
    -- Calculate final total
    NEW.total := NEW.subtotal + NEW."taxAmount" - COALESCE(NEW.discount, 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to calculate invoice total when items change
DROP TRIGGER IF EXISTS calculate_invoice_total_trigger ON "invoices";
CREATE TRIGGER calculate_invoice_total_trigger
    BEFORE INSERT OR UPDATE ON "invoices"
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_total();

-- Trigger to recalculate invoice total when items are updated
CREATE OR REPLACE FUNCTION recalculate_invoice_on_item_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate the invoice total
    UPDATE "invoices"
    SET 
        subtotal = (
            SELECT COALESCE(SUM(quantity * unit_price), 0)
            FROM "invoice_items"
            WHERE "invoiceId" = COALESCE(NEW."invoiceId", OLD."invoiceId")
        ),
        "taxAmount" = (
            SELECT COALESCE(SUM(quantity * unit_price), 0) * (tax_rate / 100)
            FROM "invoice_items"
            JOIN "invoices" ON "invoices".id = "invoice_items"."invoiceId"
            WHERE "invoiceId" = COALESCE(NEW."invoiceId", OLD."invoiceId")
        ),
        total = (
            SELECT COALESCE(SUM(quantity * unit_price), 0) * (1 + tax_rate / 100) - COALESCE(discount, 0)
            FROM "invoice_items"
            JOIN "invoices" ON "invoices".id = "invoice_items"."invoiceId"
            WHERE "invoiceId" = COALESCE(NEW."invoiceId", OLD."invoiceId")
        )
    WHERE id = COALESCE(NEW."invoiceId", OLD."invoiceId");
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS recalculate_invoice_on_item_insert ON "invoice_items";
CREATE TRIGGER recalculate_invoice_on_item_insert
    AFTER INSERT OR UPDATE OR DELETE ON "invoice_items"
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_invoice_on_item_change();

-- ============================================
-- Function to calculate quotation total automatically
-- ============================================

CREATE OR REPLACE FUNCTION calculate_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total from items
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO NEW.subtotal
    FROM "quotation_items"
    WHERE "quotationId" = NEW.id;
    
    -- Calculate tax amount
    NEW."taxAmount" := NEW.subtotal * (NEW."taxRate" / 100);
    
    -- Calculate final total
    NEW.total := NEW.subtotal + NEW."taxAmount" - COALESCE(NEW.discount, 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to calculate quotation total when items change
DROP TRIGGER IF EXISTS calculate_quotation_total_trigger ON "quotations";
CREATE TRIGGER calculate_quotation_total_trigger
    BEFORE INSERT OR UPDATE ON "quotations"
    FOR EACH ROW
    EXECUTE FUNCTION calculate_quotation_total();

-- Trigger to recalculate quotation total when items are updated
CREATE OR REPLACE FUNCTION recalculate_quotation_on_item_change()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "quotations"
    SET 
        subtotal = (
            SELECT COALESCE(SUM(quantity * unit_price), 0)
            FROM "quotation_items"
            WHERE "quotationId" = COALESCE(NEW."quotationId", OLD."quotationId")
        ),
        "taxAmount" = (
            SELECT COALESCE(SUM(quantity * unit_price), 0) * (tax_rate / 100)
            FROM "quotation_items"
            JOIN "quotations" ON "quotations".id = "quotation_items"."quotationId"
            WHERE "quotationId" = COALESCE(NEW."quotationId", OLD."quotationId")
        ),
        total = (
            SELECT COALESCE(SUM(quantity * unit_price), 0) * (1 + tax_rate / 100) - COALESCE(discount, 0)
            FROM "quotation_items"
            JOIN "quotations" ON "quotations".id = "quotation_items"."quotationId"
            WHERE "quotationId" = COALESCE(NEW."quotationId", OLD."quotationId")
        )
    WHERE id = COALESCE(NEW."quotationId", OLD."quotationId");
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS recalculate_quotation_on_item_insert ON "quotation_items";
CREATE TRIGGER recalculate_quotation_on_item_insert
    AFTER INSERT OR UPDATE OR DELETE ON "quotation_items"
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_quotation_on_item_change();
