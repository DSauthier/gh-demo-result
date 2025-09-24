

# 🛒 Shopping Cart Demo: Copilot DevSecOps Workflow

A 10-minute live demo showing how GitHub Copilot and GitHub’s default security features (dependency and secret scanning) can help identify, analyze, and fix real-world business logic vulnerabilities in a Node.js shopping cart app.


## 🎯 Demo Overview

This demo features a simple shopping cart application with a **deliberate business logic vulnerability**: users can manipulate the UI or API to change the final checkout cart value, resulting in unauthorized discounts or refunds. There is no legitimate refund system—the vulnerability is that the backend blindly trusts user input for refund amounts.

**Note:** This repository uses only GitHub’s default security features (dependency and secret scanning). No custom CodeQL or advanced GHAS workflows are enabled by default.

## 🚨 The Vulnerability

**Business Impact**: Users can manipulate the checkout process (via UI or API) to set negative or arbitrary values, causing the business to lose money through unauthorized discounts or refunds.

**Technical Details**: The `/api/refund` endpoint does not validate refund amounts, allowing negative values that increase the user's balance instead of processing legitimate refunds. This endpoint exists only to demonstrate the vulnerability and is not a real feature.

## 🎬 10-Minute Demo Script



### **Minutes 1-2: Problem Setup & Business Impact**
> "Today I'll show you a real-world DevSecOps scenario where GitHub Copilot and GitHub’s default security features help us quickly identify and fix a critical business logic vulnerability."


1. **Access the running application:**
   - The demo app is already deployed and running in the cloud.
   - Open [http://18.212.98.138:3000/](http://18.212.98.138:3000/) in your browser.


2. **Demo the vulnerability live:**
   - In your browser at [http://18.212.98.138:3000/](http://18.212.98.138:3000/), add items to cart (e.g., 2x Wireless Headphones = $159.98)
   - Checkout to create Order #1
   - Open browser dev tools and manipulate the checkout or refund UI/API to send a negative or arbitrary value (e.g., refund amount `-100`)
   - Show how the user receives money or a discount not intended by the business

3. **Explain business impact:**
   > "This isn't just a technical bug—users discovered they can manipulate the checkout process to get unauthorized discounts or refunds. Our finance team noticed unusual transactions where customers were being paid instead of charged."


### **Minutes 3-4: GitHub Issue & Documentation**
> "Let's see how this would typically flow through our development process."

1. **Show pre-created GitHub issue** (create this beforehand):
   ```
   Title: "Users can manipulate checkout/refund to get unauthorized discounts"
   
   Description:
   - Users discovered they can change the refund or checkout value via the UI or API
   - Instead of being charged, they receive money or discounts
   - Financial impact: $XX,XXX in fraudulent transactions
   - Affected endpoint: POST /api/refund
   - Steps to reproduce: [include screenshots]
   ```


### **Minutes 5-7: Copilot Agent Solution**
> "Now let's see how GitHub Copilot can help us analyze and fix this vulnerability."

1. **Assign Copilot agent to the issue:**
   - In the GitHub UI, assign Copilot to the pre-created issue.
   - Watch Copilot analyze the code and propose a fix for the vulnerable endpoint.

2. **Show Copilot's analysis:**
   - Watch Copilot identify the vulnerability
   - Review the proposed fixes
   - Highlight how Copilot understands business context, not just code syntax

3. **Apply the fix or show the pre-prepared `app-fixed.js`:**
   - Point out the key improvements:
     - Input validation: `if (refundValue <= 0)`
     - Business logic: `if (refundValue > order.total_amount)`
     - Status checks: `if (order.status === 'refunded')`



### **Minutes 8-9: Testing & GitHub Actions Deployment**
> "Let's verify our fix works and show the automated deployment pipeline."

1. **Test the fixed version:**
   ```bash
   npm run start-fixed
   ```
   - Try the same exploit: Order something, then try negative refund or manipulate the UI
   - Show error: "Invalid refund amount. Refund amount must be a positive number."

2. **Show the GitHub Actions workflow:**
   - Open `.github/workflows/deploy.yml`
   - Explain the pipeline: Deploys to an AWS VM using SSH and PM2 (see deploy.yml for details)
   - Note: No custom CodeQL or advanced security scanning is enabled by default—only GitHub’s default security features are present.

3. **Commit and push the fix:**
   ```bash
   git add app-fixed.js
   git commit -m "fix: implement proper refund validation (Copilot assisted)"
   git push origin main
   ```



### **Minute 10: Results & DevSecOps Loop Completion**
> "This demonstrates the complete DevSecOps loop with AI assistance."

1. **Show the complete workflow:**
   - ✅ Issue identified and documented
   - ✅ Copilot agent assigned and working
   - ✅ Automated testing and deployment
   - ✅ Security vulnerability resolved

2. **Key takeaways:**
   - Copilot understands business logic, not just security patterns
   - AI-assisted development speeds up critical fixes
   - GitHub’s default security features (dependency and secret scanning) provide basic protection
   - Complete automation from issue to deployment

---

## �️ GitHub Issue and Documentation

1. Show the pre-created GitHub issue describing the vulnerability.
2. Demonstrate the issue in the application and code.
3. Assign Copilot agent to the issue and watch it work.
4. Use the GitHub Agents panel to track Copilot’s activities and create a new request:
   - Example: Add internationalization (i18n) by supporting Portuguese (Brazil) and English (US) with a flag button in the UI.
5. Watch Copilot work on the new task and explain the MCP server’s role.
6. Review and merge the PR for the first task, triggering deployment.
7. Show the resolution in the running application.

## 🔄 Resetting the Demo

To reset the AWS VM and application to a clean state for repeated demos, use the provided GitHub Actions workflow (`reset.yml`). This will restore the instance and database to the original vulnerable state.

## �🛠️ Setup Instructions

### Pre-Demo Setup (5 minutes before demo):

1. **Clone and initialize:**
   ```bash
   git clone [your-repo-url]
   cd shopping-cart-demo
   npm install
   ```

2. **Create GitHub issue** (use template above)

3. **Test both versions work:**
   ```bash
   npm start          # Test vulnerable version
   npm run start-fixed # Test fixed version
   ```

### During Demo:

1. **Start with vulnerable version**: `npm start`
2. **Demo exploit**: Add items → Checkout → Negative refund
3. **Show Copilot fix**: Use provided prompt
4. **Test fix**: `npm run start-fixed`
5. **Deploy**: Show GitHub Actions workflow

## 🤖 Copilot Prompts Used

### Main Analysis Prompt:
```
I have a GitHub issue about customers exploiting our refund system with negative amounts. Please:
1. Analyze the refund endpoint in app.js 
2. Identify the security vulnerability
3. Implement a comprehensive fix with proper input validation and business logic
4. Ensure the fix prevents all potential abuse scenarios

The fix should include:
- Input validation for refund amounts (must be positive)
- Business logic validation (refund can't exceed order total)
- Proper error handling and security responses
- Prevention of double-refunds
```

### Follow-up Prompts:
```
"Explain why this vulnerability is particularly dangerous from a business perspective"
"What other similar vulnerabilities should we check for in our codebase?"
"Generate test cases to verify our fix works correctly"
```

## 🧪 Testing Commands

```bash
# Quick vulnerability test
npm test

# Manual API test (vulnerable version)
curl -X POST http://localhost:3000/api/refund \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1, "refund_amount": -100}'

# Test the UI exploit
# 1. Add items to cart
# 2. Checkout
# 3. Enter negative refund amount in UI
```

## 🎯 Demo Tips

### For Success:
- **Practice the exploit** beforehand - know exactly which buttons to click
- **Prepare the GitHub issue** ahead of time with screenshots
- **Test Copilot prompts** - AI responses can vary, have backup explanations ready
- **Have `app-fixed.js` ready** in case Copilot is slow during live demo

### Fallback Plan:
If Copilot is slow or unavailable during demo:
1. Show the pre-prepared `app-fixed.js` file
2. Explain: "Here's what Copilot generated when I ran this earlier"
3. Walk through the key fixes manually
4. Emphasize the comprehensive nature of AI-generated solution

### Key Talking Points:
- **Business impact**: This isn't academic - real money loss
- **AI understanding**: Copilot grasps business logic, not just syntax
- **Comprehensive fixes**: AI considers multiple attack vectors
- **Speed**: Minutes instead of hours for analysis and fix
- **Integration**: Seamless DevSecOps workflow

## 📁 Project Structure

```
shopping-cart-demo/
├── package.json              # Node.js dependencies and scripts
├── db.js                     # In-memory SQLite database setup
├── app.js                    # Vulnerable shopping cart server
├── app-fixed.js              # Secure version with proper validation
├── test-refund-exploit.js    # Automated vulnerability test
├── run-demo.ps1              # Demo startup script
├── public/
│   └── index.html            # Shopping cart UI
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions deployment pipeline
└── README.md                 # This file
```



## 🔧 Technical Details

- **Framework**: Node.js + Express
- **Database**: SQLite (file-based, no external dependencies)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Vulnerability**: Business logic flaw—backend trusts user input for refund/checkout values
- **Fix**: Input validation + business rules + error handling
- **Deployment**: GitHub Actions deploys to an AWS VM using SSH and PM2 (see `.github/workflows/deploy.yml`)
- **Security**: Only GitHub’s default security features (dependency and secret scanning) are enabled by default. No custom CodeQL or advanced GHAS workflows are present.

## 🏆 Demo Success Metrics

- [ ] Audience understands the business impact
- [ ] Vulnerability exploit is clearly demonstrated
- [ ] Copilot's analysis capabilities are showcased
- [ ] Complete DevSecOps workflow is demonstrated
- [ ] Fix is verified to work correctly

---

**Ready to revolutionize your security workflow with AI? Let's demo the future of DevSecOps! 🚀**