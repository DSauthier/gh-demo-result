# Demo Scripts for Shopping Cart Vulnerability Demo

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install

# Start the vulnerable server
Write-Host "`n🚀 Starting vulnerable shopping cart server..." -ForegroundColor Yellow
Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host "🎯 Try the exploit: Add items, checkout, then refund with negative amount!" -ForegroundColor Red

# Start the server
npm start

# Commands to run during demo (reference):
<#
# To test the exploit manually via API:
curl -X POST http://localhost:3000/api/refund -H "Content-Type: application/json" -d "{\"order_id\": 1, \"refund_amount\": -50}"

# To start the fixed version:
npm run start-fixed

# To commit the fix:
git add app-fixed.js
git commit -m "fix: implement proper refund validation (Copilot assisted)"
git push origin main
#>