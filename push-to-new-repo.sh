#!/bin/bash

# Quick script to push to new Crowe-Code repository

echo "Setting up Crowe-Code repository..."

# Remove old .git and initialize fresh
rm -rf .git
git init

# Add all files
git add -A

# Create initial commit
git commit -m "Initial commit: CroweCode Platform

Advanced AI-powered development platform featuring:
- Multi-provider AI integration (XAI, Anthropic, OpenAI)
- Real-time collaboration
- OAuth authentication (GitHub, Google)
- WebSocket terminal
- Docker support
- Fly.io deployment ready

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Add remote (update with your username)
echo "Enter your GitHub username:"
read GITHUB_USERNAME
git remote add origin https://github.com/$GITHUB_USERNAME/Crowe-Code.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "Done! Repository available at: https://github.com/$GITHUB_USERNAME/Crowe-Code"