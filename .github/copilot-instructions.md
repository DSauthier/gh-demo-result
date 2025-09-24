# GitHub Copilot Instructions

## Project Overview
This repository is a demo e-commerce app for internal IT hardware orders showcasing GitHub Copilot DevSecOps workflows. It includes a Node.js/Express backend with deliberate security vulnerabilities, a SQLite database, and a static frontend. The project is designed for repeatable demos with automated deployment and reset workflows.

## Your Role
You are assisting with a security demonstration where you will:
1. Analyze security vulnerabilities reported in GitHub issues
2. Fix business logic flaws and security issues in the codebase
3. Ensure proper input validation and error handling
4. Support deployment and testing workflows
5. Help reset the demo environment for repeated presentations

## Key Files and Structure
- `server.js` - Main vulnerable application with refund endpoint flaw
- `app-fixed.js` - Reference implementation with security fixes
- `public/index.html` - Frontend shopping cart interface
- `db.js` - SQLite database setup and initialization
- `test-refund-exploit.js` - Automated vulnerability testing
- `.github/workflows/deploy.yml` - AWS EC2 deployment pipeline
- `.github/workflows/reset-demo.yml` - Demo environment reset workflow

## Common Tasks and Guidelines

### Security Vulnerability Fixes
When fixing security issues:
- Always validate user input on the server side
- Implement proper business logic validation (e.g., refund amounts must be positive and not exceed order total)
- Add appropriate error handling and user feedback
- Check for edge cases like duplicate refunds or cancelled orders
- Follow the pattern shown in `app-fixed.js` for reference

### Demo Environment Management
- Use the `reset-demo.yml` workflow to restore the environment to the `golden-image` branch
- The demo requires a vulnerable state that can be repeatedly reset
- Always test both vulnerable and fixed versions work correctly
- Ensure the exploit remains demonstrable after fixes for comparison

### Development Workflow
- The `main` branch should contain the vulnerable version for demos
- Security fixes should be developed and tested before merging
- Use the provided test scripts to verify both vulnerability and fix
- Follow the existing code style and structure

### Deployment
- Deployment happens automatically via GitHub Actions to AWS EC2
- The workflow uses SSH and rsync to sync code and restarts with PM2
- Ensure secrets like `EC2_SSH_KEY` and `GH_PAT` are properly configured
- Test deployments in both vulnerable and fixed states

### Testing
- Always run `npm test` to verify the vulnerability exists in the original state
- Test the fix by running `npm run start-fixed`
- Manually test the UI to ensure the exploit is blocked
- Verify error messages are user-friendly and informative

## Troubleshooting
- If the cart or UI shows duplicated elements, check for duplicate HTML blocks in `public/index.html`
- For deployment issues, check GitHub Actions logs and verify all required secrets are set
- If the server fails to start, ensure the database file permissions are correct
- For workflow errors, refer to the logs and ensure the EC2 instance is accessible

## Branch and Reset Management
- The `golden-image` branch contains the pristine, vulnerable demo state
- Use `copilot_reset_main_prompt.md` for guidance on resetting the main branch
- When creating reset issues, follow the automated workflow pattern
- Always maintain the ability to demonstrate the original vulnerability

## Code Quality Standards
- Follow existing code patterns and naming conventions
- Add meaningful error messages for user-facing issues
- Ensure proper HTTP status codes are returned
- Maintain backward compatibility with the demo workflow
- Keep security fixes focused and minimal to avoid breaking the demo flow

## Important Notes
- This is a demonstration environment - the vulnerabilities are intentional
- Always preserve the ability to show both vulnerable and fixed states
- The demo narrative requires a clear before/after comparison
- Focus on business logic vulnerabilities rather than just technical security patterns
- Ensure fixes are comprehensive but don't over-engineer solutions