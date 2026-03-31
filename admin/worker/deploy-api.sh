#!/bin/bash
set -e

ACCOUNT_ID="4f5262587982e4f825a8f56ca775edcf"
API_KEY="cfk_tidmp2s8tWsosNPOXo42Cn6qOiouRAxfex1nkaMU01a10eba"
EMAIL="vethymch@gmail.com"
WORKER_NAME="cooldrivepro-admin"
SCRIPT_FILE="/root/.openclaw/workspace/cooldrivepro-new/admin/worker/dist/worker.js"

echo "🚀 Deploying Worker: $WORKER_NAME"

# Create metadata JSON
METADATA=$(cat <> EOF
{
  "main_module": "index.js"
}
EOF
)

# Create multipart boundary
BOUNDARY="----WebKitFormBoundary7MA4YWxk"

# Build multipart body
(
echo "------WebKitFormBoundary7MA4YWxk"
echo 'Content-Disposition: form-data; name="metadata"'
echo "Content-Type: application/json"
echo ""
echo "$METADATA"
echo "------WebKitFormBoundary7MA4YWxk"
echo 'Content-Disposition: form-data; name="index.js"; filename="index.js"'
echo "Content-Type: application/javascript"
echo ""
cat "$SCRIPT_FILE"
echo ""
echo "------WebKitFormBoundary7MA4YWxk--"
) > /tmp/deploy_body.txt

# Deploy
RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}" \
  -H "X-Auth-Email: ${EMAIL}" \
  -H "X-Auth-Key: ${API_KEY}" \
  -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxk" \
  --data-binary @/tmp/deploy_body.txt)

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Worker deployed successfully!"
  echo ""
  echo "🌐 Worker URL: https://${WORKER_NAME}.${ACCOUNT_ID}.workers.dev"
  echo ""
  echo "⚠️  下一步: 在 Cloudflare Dashboard 设置环境变量"
  echo "   https://dash.cloudflare.com/${ACCOUNT_ID}/workers/services/view/${WORKER_NAME}/production/settings"
else
  echo "❌ Deployment failed:"
  echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))" 2>/dev/null || echo "$RESPONSE"
fi

rm -f /tmp/deploy_body.txt
