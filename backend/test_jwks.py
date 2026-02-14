#!/usr/bin/env python3
"""
Find the correct JWKS endpoint for Supabase
Run this from the backend directory: python find_jwks_endpoint.py
"""

import os
import sys
from pathlib import Path

# Add Django project to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

import requests

print("=" * 60)
print("FINDING CORRECT JWKS ENDPOINT")
print("=" * 60)

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')

print(f"\n📍 SUPABASE_URL: {supabase_url}")

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env")
    sys.exit(1)

# Try multiple possible JWKS endpoints
endpoints_to_try = [
    "/auth/v1/jwks",
    "/auth/v1/.well-known/jwks.json",
    "/.well-known/jwks.json",
    "/auth/v1/jwks.json",
    "/.well-known/openid-configuration",  # This might tell us where JWKS is
]

headers = {
    'apikey': supabase_key,
    'Authorization': f'Bearer {supabase_key}'
}

print("\n🔍 Trying different endpoints...\n")

for endpoint in endpoints_to_try:
    url = f"{supabase_url.rstrip('/')}{endpoint}"
    print(f"Trying: {endpoint}")
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ FOUND IT!")
            
            try:
                data = response.json()
                
                # Check if it's JWKS format
                if 'keys' in data:
                    keys = data['keys']
                    print(f"   🎯 This is the JWKS endpoint with {len(keys)} key(s)!")
                    
                    for i, key in enumerate(keys, 1):
                        print(f"\n   Key #{i}:")
                        print(f"      kid: {key.get('kid')}")
                        print(f"      alg: {key.get('alg')}")
                        print(f"      kty: {key.get('kty')}")
                    
                    print(f"\n{'='*60}")
                    print(f"✅ USE THIS ENDPOINT IN YOUR CODE:")
                    print(f"   {url}")
                    print(f"{'='*60}")
                    break
                
                # Check if it's OpenID config
                elif 'jwks_uri' in data:
                    print(f"   📝 OpenID config found!")
                    print(f"   JWKS URI: {data['jwks_uri']}")
                    
                    # Try the JWKS URI
                    jwks_response = requests.get(data['jwks_uri'], headers=headers, timeout=5)
                    if jwks_response.status_code == 200:
                        jwks_data = jwks_response.json()
                        keys = jwks_data.get('keys', [])
                        print(f"   ✅ Found {len(keys)} keys at JWKS URI!")
                        
                        print(f"\n{'='*60}")
                        print(f"✅ USE THIS ENDPOINT IN YOUR CODE:")
                        print(f"   {data['jwks_uri']}")
                        print(f"{'='*60}")
                        break
                else:
                    print(f"   Response: {str(data)[:200]}")
            except:
                print(f"   Response (not JSON): {response.text[:200]}")
        else:
            print(f"   Status: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()

print("\n" + "="*60)
print("ALTERNATIVE: Check Supabase Dashboard")
print("="*60)
print("\nIf no endpoint worked, your keys might only be accessible via:")
print("1. Supabase Dashboard → Settings → API → JWT Signing Keys")
print("2. Copy the public key manually")
print("3. Hard-code it in Django settings")
print("\n" + "="*60)