Project Setup & Usage

Install dependencies: npm install
Start server: npm start (http://localhost:3000)
Deploy: Use deploy.yml workflow (GitHub Actions) to sync to EC2
Reset demo: Use reset-demo.yml workflow to restore EC2 to golden-image and create a main branch reset issue
Resetting Main Branch

When prompted by an issue, reset main to match golden-image (see copilot_reset_main_prompt.md)
Troubleshooting

UI duplication: Check for duplicate HTML in index.html
Log streaming: See commented code in server.js
Workflow errors: Check GitHub Actions logs and secrets
Key Files

.github/workflows/deploy.yml (deploy)
.github/workflows/reset-demo.yml (reset)
copilot_reset_main_prompt.md (main reset prompt)
server.js, index.html (core app files)
