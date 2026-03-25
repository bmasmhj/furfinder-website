#!/bin/bash
set -e

echo "Running post-merge setup..."

echo "Installing dependencies..."
npm install --legacy-peer-deps < /dev/null 2>&1

echo "Post-merge setup complete."
