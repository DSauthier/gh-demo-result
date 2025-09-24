#!/bin/bash

# Ensure this script is executable
chmod +x "$0"
# reset-demo.sh - Reset demo app to golden image state on Amazon Linux

# Stop the app (customize for your process manager)
# Example for PM2:
# pm2 stop all
# Or, if using systemd:
# sudo systemctl stop myapp.service

# Remove the demo database
rm -f shop-demo.db

# Codebase is now reset by rsync from GitHub Actions (see reset-demo.yml)

# Install dependencies
npm install

# Start the app (customize for your process manager)
# Example for PM2:
# pm2 start all
# Or, if using systemd:
# sudo systemctl start myapp.service
# Or, to run in background:
# nohup npm start &

echo "Demo environment reset to golden image."
