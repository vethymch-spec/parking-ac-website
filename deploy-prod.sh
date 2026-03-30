#!/bin/bash
# Deploy to Netlify Production

echo "🚀 Deploying CoolDrivePro to Production..."
echo "============================================"

# Navigate to project
cd /root/.openclaw/workspace/cooldrivepro-new

# Build
echo "Building..."
npm run build

# Copy blog files
echo "Copying blog files..."
cp -r public/blog dist/

# Deploy to Netlify
echo "Deploying to Netlify..."
npx netlify-cli deploy --prod --dir=dist --site=b19e778c-7ca8-469c-aa90-afdb0b05996e

echo ""
echo "✅ Deploy complete!"
echo ""
echo "Check your site:"
echo "- https://cooldrivepro.com/"
echo "- https://cooldrivepro.com/blog/"
