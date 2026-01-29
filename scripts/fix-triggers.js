// Fix Triggers and Function
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');

const SUPABASE_PAT = process.env.SUPABASE_PERSONAL_ACCESS_TOKEN;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function executeSQL(sql) {
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_ID}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_PAT}`,
      'Content-Type': 'application/json',
    },
  };
  return await makeRequest(options, { query: sql });
}

async function main() {
  console.log('🔧 إصلاح Triggers و Function...\n');

  // Create function
  const functionSQL = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
  `;

  console.log('📝 إنشاء Function...');
  const funcResult = await executeSQL(functionSQL);
  if (funcResult.status === 200 || funcResult.status === 201) {
    console.log('✅ Function تم إنشاؤها/تحديثها\n');
  } else {
    console.log(`⚠️  Function: ${funcResult.data?.message || 'خطأ'}\n`);
  }

  // Create triggers
  const tables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ];

  console.log('📝 إنشاء Triggers...\n');
  for (const table of tables) {
    const triggerSQL = `
DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}";
CREATE TRIGGER update_${table}_updated_at BEFORE UPDATE ON "${table}" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const result = await executeSQL(triggerSQL);
    if (result.status === 200 || result.status === 201) {
      console.log(`   ✅ ${table}`);
    } else {
      const errorMsg = result.data?.message || result.body || '';
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log(`   ✅ ${table} (موجود مسبقاً)`);
      } else {
        console.log(`   ⚠️  ${table}: ${errorMsg.substring(0, 60)}`);
      }
    }
  }

  console.log('\n✅ تم إصلاح Triggers و Function!\n');
}

main().catch(console.error);
