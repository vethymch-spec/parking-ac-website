#!/usr/bin/env python3
import subprocess
import json
import base64

ACCOUNT_ID = "4f5262587982e4f825a8f56ca775edcf"
API_KEY = "cfk_tidmp2s8tWsosNPOXo42Cn6qOiouRAxfex1nkaMU01a10eba"
EMAIL = "vethymch@gmail.com"
WORKER_NAME = "cooldrivepro-admin"
SCRIPT_FILE = "/root/.openclaw/workspace/cooldrivepro-new/admin/worker/dist/worker.js"

print(f"🚀 Deploying Worker: {WORKER_NAME}")

# Read script
with open(SCRIPT_FILE, 'r') as f:
    script_content = f.read()

# Prepare metadata + script as multipart form data
boundary = "----WebKitFormBoundary7MA4YWxk"

body = f"""------WebKitFormBoundary7MA4YWxk
Content-Disposition: form-data; name="metadata"
Content-Type: application/json

{{"main_module": "index.js"}}
------WebKitFormBoundary7MA4YWxk
Content-Disposition: form-data; name="index.js"; filename="index.js"
Content-Type: application/javascript

{script_content}
------WebKitFormBoundary7MA4YWxk--
"""

# Deploy using curl
cmd = [
    'curl', '-s', '-X', 'PUT',
    f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}',
    '-H', f'X-Auth-Email: {EMAIL}',
    '-H', f'X-Auth-Key: {API_KEY}',
    '-H', 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxk',
    '--data-binary', body
]

result = subprocess.run(cmd, capture_output=True, text=True)
response = result.stdout

# Parse response
try:
    data = json.loads(response)
    if data.get('success'):
        print(f"✅ Worker deployed successfully!")
        print(f"")
        print(f"🌐 Worker URL: https://{WORKER_NAME}.{ACCOUNT_ID}.workers.dev")
        print(f"")
        print(f"⚠️  下一步: 在 Cloudflare Dashboard 设置环境变量")
        print(f"   https://dash.cloudflare.com/{ACCOUNT_ID}/workers/services/view/{WORKER_NAME}/production/settings")
        print(f"")
        print(f"需要设置的环境变量:")
        print(f"  - ADMIN_AUTH_TOKEN (你的强密码)")
        print(f"  - OPENAI_API_KEY")
        print(f"  - GITHUB_TOKEN")
        print(f"  - GITHUB_OWNER=vethymch-spec")
        print(f"  - GITHUB_REPO=parking-ac-website")
        print(f"  - CF_PAGES_PROJECT=cooldrivepro")
    else:
        print(f"❌ Deployment failed:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Response: {response}")
