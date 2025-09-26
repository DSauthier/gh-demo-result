# ♻️ Making the Demo Recyclable: Golden Image & Reset Pipeline

This guide will help you set up a reproducible, always-fresh demo environment for your app. After each demo, you can quickly reset everything to a known good state ("golden image") and redeploy with a single pipeline run.

---

## 1. Create a Golden Image Branch or Tag

- After setting up your app in the desired pre-fix state, create a branch or tag:

```sh
git checkout main
git pull
git checkout -b golden-image
# or, for a tag:
git tag golden-image
```

- Push the branch/tag to GitHub:

```sh
git push origin golden-image  # for branch
git push origin golden-image  # for tag
```

---

## 2. Add a Reset Script

Create a script (e.g., `reset-demo.ps1` for PowerShell or `reset-demo.sh` for bash) that:
- Deletes the current database file (e.g., `shop-demo.db`)
- Checks out the golden image branch/tag
- Installs dependencies
- Restarts the app

**Example: `reset-demo.ps1`**

```powershell
# Stop the app if running (customize as needed)
Stop-Process -Name node -ErrorAction SilentlyContinue

# Remove the demo database
Remove-Item -Path "shop-demo.db" -ErrorAction SilentlyContinue

# Reset codebase to golden image
git fetch origin
git checkout golden-image -- .

# Install dependencies
npm install

# Start the app
npm start
```

---

## 3. Add a GitHub Actions Pipeline

Create `.github/workflows/reset-demo.yml`:

```yaml
name: Reset Demo to Golden Image

on:
  workflow_dispatch:

jobs:
  reset-demo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout golden image
        uses: actions/checkout@v4
        with:
          ref: golden-image
      - name: Install dependencies
        run: npm install
      - name: (Optional) Deploy to server
        run: |
          # Add your deployment steps here
          echo "Deploying to server..."
```

---

## 4. Usage

- After each demo, run the reset script locally or trigger the GitHub Actions workflow to restore the golden image.
- Update the golden image branch/tag as needed when you want to change the "clean" demo state.

---

**Tip:**
You can assign Copilot to automate or improve any of these steps further!
