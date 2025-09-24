# Branch Protection Setup Guide

## GitHub Repository Settings Configuration

### 1. Enable Branch Protection Rules

Go to your repository: `https://github.com/DSauthier/gh-demo`

**Navigate to:** Settings → Branches → Add rule

### 2. Configure Protection for `main` branch

**Branch name pattern:** `main`

**Required settings for demo safety:**

#### ✅ Require pull request reviews before merging
- **Required number of reviewers:** 1
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require review from code owners** (CRITICAL - This uses CODEOWNERS file)
- ✅ **Restrict pushes that create files that ignore required status checks**

#### ✅ Require status checks to pass before merging
- ✅ **Require branches to be up to date before merging**
- Add any CI/CD status checks if you have them

#### ✅ Require conversation resolution before merging
- Ensures all PR comments are addressed

#### ✅ Restrict pushes
- ✅ **Include administrators** (Even you need to follow the rules!)

#### ✅ Allow force pushes
- ❌ **Disable this** (Prevents history rewriting)

#### ✅ Allow deletions
- ❌ **Disable this** (Prevents accidental branch deletion)

### 3. Configure Protection for `test` branch (Optional)

Same settings as main, but you might want to be less strict for testing.

### 4. Demo Workflow Protection

For your Copilot demo, this ensures:

1. **Copilot creates PRs** (cannot push directly to main)
2. **You must review** every PR before merge
3. **CODEOWNERS enforced** - You're automatically requested as reviewer
4. **No accidental merges** - All changes go through proper review

## Commands to Set Up via GitHub CLI (Alternative)

```bash
# Enable branch protection for main
gh api repos/DSauthier/gh-demo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null

# Enable branch protection for test (optional)
gh api repos/DSauthier/gh-demo/branches/test/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null
```

## Demo Day Workflow

### Phase 3 Demo Flow:
1. **Copilot analyzes issue** and creates fix
2. **Copilot creates PR** with security fix
3. **GitHub automatically requests your review** (due to CODEOWNERS)
4. **You review the PR** showing the audience the fix
5. **You approve and merge** demonstrating human oversight
6. **Deployment happens** with your approval

### Benefits for Demo:
- ✅ Shows **responsible AI usage** with human oversight
- ✅ Demonstrates **proper security workflows**
- ✅ Proves **you maintain control** over critical changes
- ✅ Highlights **collaboration** between AI and human developers

## Quick Setup Steps:

1. ✅ CODEOWNERS file created (done above)
2. 🔄 Push CODEOWNERS to repository
3. 🌐 Configure branch protection in GitHub UI
4. 🧪 Test with a dummy PR to verify it works

This ensures Copilot cannot merge anything without your explicit approval!