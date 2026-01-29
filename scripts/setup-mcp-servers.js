// 🚀 Setup MCP Servers for Cursor - DigitalOcean & Namecheap
// Run: node setup-mcp-servers.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const CURSOR_MCP_CONFIG_PATH = path.join(os.homedir(), '.cursor', 'mcp.json');
const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');

// Helper: Read user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Helper: Get Cursor MCP config path
function getCursorMCPConfigPath() {
  const homeDir = os.homedir();
  const cursorDir = path.join(homeDir, '.cursor');
  
  // Try different possible locations
  const possiblePaths = [
    path.join(cursorDir, 'mcp.json'),
    path.join(cursorDir, 'mcp_config.json'),
    path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'mcp.json'),
  ];

  // Check if cursor directory exists, create if not
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }

  return possiblePaths[0]; // Use first path
}

async function setupDigitalOcean() {
  console.log('\n🌊 ========================================');
  console.log('🌊 DigitalOcean MCP Server Setup');
  console.log('🌊 ========================================\n');

  console.log('📋 الخطوات:');
  console.log('1. اذهب إلى: https://cloud.digitalocean.com/account/api/tokens');
  console.log('2. اضغط "Generate New Token"');
  console.log('3. اختر "Read" و "Write" permissions');
  console.log('4. انسخ Token\n');

  const token = await askQuestion('🔑 أدخل DigitalOcean API Token: ');

  if (!token || token.trim().length < 20) {
    console.error('❌ Token غير صحيح!');
    return null;
  }

  console.log('✅ Token تم حفظه!\n');

  return {
    name: 'digitalocean',
    command: 'npx',
    args: ['-y', '@digitalocean/mcp', '--services', 'apps,droplets,databases'],
    env: {
      DIGITALOCEAN_API_TOKEN: token.trim()
    }
  };
}

async function setupNamecheap() {
  console.log('\n🌐 ========================================');
  console.log('🌐 Namecheap MCP Server Setup');
  console.log('🌐 ========================================\n');

  console.log('📋 المتطلبات:');
  console.log('- حساب Namecheap مع 20+ domains أو $50 spent');
  console.log('- API Access مفعّل\n');

  console.log('📋 الخطوات:');
  console.log('1. اذهب إلى: https://www.namecheap.com/myaccount/api/');
  console.log('2. Enable API Access');
  console.log('3. Add Your IP Address');
  console.log('4. انسخ API User و API Key\n');

  const apiUser = await askQuestion('👤 أدخل Namecheap API User: ');
  const apiKey = await askQuestion('🔑 أدخل Namecheap API Key: ');
  const apiIP = await askQuestion('🌐 أدخل Your IP Address (أو اتركه فارغ للاكتشاف التلقائي): ');

  if (!apiUser || !apiKey) {
    console.error('❌ API User و API Key مطلوبان!');
    return null;
  }

  // Get IP if not provided
  let finalIP = apiIP.trim();
  if (!finalIP) {
    console.log('\n🔍 جاري اكتشاف IP Address...');
    try {
      const https = require('https');
      const ip = await new Promise((resolve, reject) => {
        https.get('https://api.ipify.org', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data.trim()));
        }).on('error', reject);
      });
      finalIP = ip;
      console.log(`✅ IP Address: ${finalIP}\n`);
    } catch (error) {
      console.log('⚠️  فشل اكتشاف IP، استخدم IP يدوياً\n');
    }
  }

  console.log('✅ Namecheap credentials تم حفظها!\n');

  return {
    name: 'namecheap',
    command: 'node',
    args: [path.join(__dirname, '..', 'mcp-servers', 'namecheap', 'index.js')],
    env: {
      NAMECHEAP_API_USER: apiUser.trim(),
      NAMECHEAP_API_KEY: apiKey.trim(),
      NAMECHEAP_IP: finalIP || '127.0.0.1'
    }
  };
}

function saveMCPConfig(servers) {
  const configPath = getCursorMCPConfigPath();
  const config = {
    mcpServers: {}
  };

  servers.forEach(server => {
    if (server) {
      config.mcpServers[server.name] = {
        command: server.command,
        args: server.args,
        env: server.env
      };
    }
  });

  // Create directory if needed
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ تم حفظ MCP Config في: ${configPath}\n`);
}

function updateEnvLocal(digitalOceanToken) {
  if (!digitalOceanToken) return;

  let envContent = '';
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  }

  // Add DigitalOcean token if not exists
  if (!envContent.includes('DIGITALOCEAN_API_TOKEN=')) {
    envContent += `\n# DigitalOcean API Token\nDIGITALOCEAN_API_TOKEN=${digitalOceanToken}\n`;
    fs.writeFileSync(ENV_LOCAL_PATH, envContent);
    console.log('✅ تم إضافة DIGITALOCEAN_API_TOKEN في .env.local\n');
  }
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 MCP Servers Setup for Cursor');
  console.log('🚀 ========================================\n');

  console.log('هذا السكريبت سيساعدك في إعداد:');
  console.log('1. DigitalOcean MCP Server');
  console.log('2. Namecheap MCP Server\n');

  const setupDO = await askQuestion('هل تريد إعداد DigitalOcean? (y/n): ');
  const setupNC = await askQuestion('هل تريد إعداد Namecheap? (y/n): ');

  const servers = [];

  if (setupDO.toLowerCase() === 'y') {
    const doConfig = await setupDigitalOcean();
    if (doConfig) {
      servers.push(doConfig);
      updateEnvLocal(doConfig.env.DIGITALOCEAN_API_TOKEN);
    }
  }

  if (setupNC.toLowerCase() === 'y') {
    const ncConfig = await setupNamecheap();
    if (ncConfig) {
      servers.push(ncConfig);
    }
  }

  if (servers.length > 0) {
    saveMCPConfig(servers);
    
    console.log('🎉 ========================================');
    console.log('🎉 Setup Complete!');
    console.log('🎉 ========================================\n');
    console.log('✅ تم إعداد MCP Servers بنجاح!\n');
    console.log('📝 الخطوات التالية:');
    console.log('1. أعد تشغيل Cursor');
    console.log('2. اذهب إلى: Cursor Settings → Features → MCP');
    console.log('3. تحقق من أن Servers ظاهرة');
    console.log('4. ابدأ استخدام Composer مع MCP Servers!\n');
    console.log('💡 مثال في Composer:');
    console.log('   "أنشئ Droplet على DigitalOcean"');
    console.log('   "اشتري domain example.com من Namecheap"\n');
  } else {
    console.log('\n⚠️  لم يتم إعداد أي servers\n');
  }
}

main().catch(console.error);
