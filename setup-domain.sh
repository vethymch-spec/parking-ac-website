#!/bin/bash
# Netlify Domain Configuration Script for CoolDrivePro

echo "🚀 Netlify Domain Configuration for CoolDrivePro"
echo "================================================"
echo ""

# Check if netlify CLI is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

# Login to Netlify
echo "Step 1: Logging into Netlify..."
npx netlify-cli login

# Get site info
echo ""
echo "Step 2: Checking site configuration..."
npx netlify-cli sites:list

echo ""
echo "Step 3: Adding custom domain..."
npx netlify-cli domains:add --site=b19e778c-7ca8-469c-aa90-afdb0b05996e --name=cooldrivepro.com

echo ""
echo "Step 4: Configuring DNS..."
npx netlify-cli dns:zones:create --name=cooldrivepro.com

echo ""
echo "✅ Configuration complete!"
echo ""
echo "DNS Records to configure:"
echo "A     @     75.2.60.5"
echo "A     @     99.83.231.61"
echo "CNAME www   cooldrivepro.netlify.app"
echo ""
echo "Or use Netlify DNS:"
echo "1. Go to https://app.netlify.com/sites/cooldrivepro/domain"
echo "2. Click 'Set up Netlify DNS'"
echo "3. Update nameservers at your domain registrar"
