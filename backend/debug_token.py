# backend/debug_token.py
"""
Run this script to debug JWT token issues:
python debug_token.py

This will help you understand what's in your token and verify your JWT secret.
"""

import jwt
import json
import sys
import os

# Add the parent directory to the path so we can import settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Try to load Django settings
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aureon_backend.settings')
    import django
    django.setup()
    from django.conf import settings
    SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET
    print(f"✅ Loaded JWT_SECRET from Django settings")
    print(f"   JWT_SECRET (first 20 chars): {SUPABASE_JWT_SECRET[:20]}...")
except Exception as e:
    print(f"⚠️  Could not load Django settings: {e}")
    print(f"   Please enter your JWT_SECRET manually below")
    SUPABASE_JWT_SECRET = None

print("\n" + "="*60)
print("SUPABASE JWT TOKEN DEBUGGER")
print("="*60)

# Get token from user
print("\nPaste your Supabase token here:")
print("(You can get it from localStorage in your browser console)")
print("localStorage.getItem('supabase_token')")
print()
token = input("Token: ").strip()

if not token:
    print("❌ No token provided!")
    sys.exit(1)

print("\n" + "-"*60)
print("STEP 1: Decode Header (unverified)")
print("-"*60)

try:
    header = jwt.get_unverified_header(token)
    print("✅ Token Header:")
    print(json.dumps(header, indent=2))
    algorithm = header.get('alg', 'UNKNOWN')
    print(f"\n🔍 Algorithm: {algorithm}")
except Exception as e:
    print(f"❌ Could not decode header: {e}")
    sys.exit(1)

print("\n" + "-"*60)
print("STEP 2: Decode Payload (unverified)")
print("-"*60)

try:
    # Decode without verification to see the contents
    payload = jwt.decode(token, options={"verify_signature": False})
    print("✅ Token Payload:")
    print(json.dumps(payload, indent=2))
    
    print(f"\n🔍 Key Information:")
    print(f"   User ID (sub): {payload.get('sub', 'NOT FOUND')}")
    print(f"   Email: {payload.get('email', 'NOT FOUND')}")
    print(f"   Audience: {payload.get('aud', 'NOT FOUND')}")
    print(f"   Issuer: {payload.get('iss', 'NOT FOUND')}")
    
    # Check expiration
    import time
    exp = payload.get('exp')
    if exp:
        exp_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(exp))
        is_expired = exp < time.time()
        print(f"   Expires: {exp_date} {'(EXPIRED!)' if is_expired else '(valid)'}")
    
except Exception as e:
    print(f"❌ Could not decode payload: {e}")
    sys.exit(1)

print("\n" + "-"*60)
print("STEP 3: Verify Signature")
print("-"*60)

if not SUPABASE_JWT_SECRET:
    print("Enter your SUPABASE_JWT_SECRET:")
    SUPABASE_JWT_SECRET = input("JWT_SECRET: ").strip()

if not SUPABASE_JWT_SECRET:
    print("⚠️  No JWT_SECRET provided - skipping verification")
else:
    try:
        # Try to decode with verification
        verified_payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[algorithm],
            audience="authenticated"
        )
        print("✅ Signature verification PASSED!")
        print("   Your JWT_SECRET is CORRECT!")
        
    except jwt.InvalidSignatureError:
        print("❌ Signature verification FAILED!")
        print("   Your JWT_SECRET is WRONG!")
        print("\n   How to find the correct JWT_SECRET:")
        print("   1. Go to your Supabase Dashboard")
        print("   2. Settings → API")
        print("   3. Look for 'JWT Secret' (NOT the service key)")
        print("   4. Copy that value to your .env file as SUPABASE_JWT_SECRET")
        
    except jwt.ExpiredSignatureError:
        print("❌ Token has EXPIRED!")
        print("   Solution: Logout and login again to get a new token")
        
    except jwt.InvalidAudienceError:
        print("❌ Invalid audience!")
        print("   The token audience doesn't match 'authenticated'")
        
    except jwt.InvalidAlgorithmError as e:
        print(f"❌ Algorithm error: {e}")
        print(f"   The token uses {algorithm} but it's not allowed")
        
    except Exception as e:
        print(f"❌ Verification error: {type(e).__name__}: {e}")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)

print(f"\n✓ Token structure: Valid")
print(f"✓ Algorithm: {algorithm}")
print(f"✓ User ID present: {'Yes' if payload.get('sub') else 'No'}")
print(f"✓ Email present: {'Yes' if payload.get('email') else 'No'}")

if SUPABASE_JWT_SECRET:
    print(f"\nNext steps:")
    print(f"1. Make sure backend/aureon_backend/settings.py uses:")
    print(f"   algorithms=['{algorithm}']")
    print(f"2. Make sure your .env has the correct JWT_SECRET")
    print(f"3. Restart Django server")
else:
    print(f"\n⚠️  Could not verify signature - JWT_SECRET not provided")

print("\n")