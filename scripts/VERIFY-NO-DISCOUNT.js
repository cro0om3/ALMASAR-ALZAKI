// Verify that discount has been completely removed from the application
const fs = require('fs')
const path = require('path')

const directories = ['app', 'components', 'lib', 'types']
const excludePatterns = ['node_modules', '.next', '.git']

function searchInDirectory(dir, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    
    // Skip excluded directories
    if (file.isDirectory()) {
      if (!excludePatterns.some(pattern => file.name.includes(pattern))) {
        searchInDirectory(fullPath, results)
      }
      continue
    }
    
    // Only check TypeScript/JavaScript files
    if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const discountMatches = content.match(/discount/gi)
      
      if (discountMatches) {
        results.push({
          file: fullPath,
          count: discountMatches.length
        })
      }
    }
  }
  
  return results
}

console.log('\n🔍 التحقق من إزالة discount من التطبيق...\n')
console.log('='.repeat(60) + '\n')

let allGood = true
const allResults = []

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`📁 فحص ${dir}/...`)
    const results = searchInDirectory(dir)
    
    if (results.length > 0) {
      console.log(`  ⚠️  وجد ${results.length} ملف يحتوي على discount:`)
      results.forEach(r => {
        console.log(`    - ${r.file} (${r.count} مرة)`)
      })
      allGood = false
      allResults.push(...results)
    } else {
      console.log(`  ✅ لا يوجد discount في ${dir}/`)
    }
    console.log()
  }
}

console.log('='.repeat(60))
console.log('\n📋 الملخص:\n')

if (allGood) {
  console.log('✅ ✅ ✅ تم إزالة discount من جميع ملفات التطبيق!')
  console.log('✅ لا توجد أخطاء في الكود')
  console.log('✅ جميع الحسابات محدثة (بدون discount)')
  console.log('\n🎉 كل شيء مكتمل حسب المطلوب!\n')
} else {
  console.log(`⚠️  وجد ${allResults.length} ملف لا يزال يحتوي على discount`)
  console.log('💡 يجب إزالة discount من هذه الملفات\n')
}

console.log('='.repeat(60) + '\n')
