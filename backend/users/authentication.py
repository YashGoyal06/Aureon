# backend/users/authentication.py
import jwt
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    
    def get_jwks_keys(self):
        """Fetch JWKS keys from Supabase (cached for 1 hour)"""
        cache_key = 'supabase_jwks_keys'
        keys = cache.get(cache_key)
        
        if keys is None:
            try:
                # Correct JWKS endpoint for new JWT Signing Keys
                jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
                
                # Supabase requires the anon key
                headers = {
                    'apikey': settings.SUPABASE_KEY,
                    'Authorization': f'Bearer {settings.SUPABASE_KEY}'
                }
                
                print(f"[AUTH DEBUG] Fetching JWKS from: {jwks_url}")
                response = requests.get(jwks_url, headers=headers, timeout=5)
                response.raise_for_status()
                jwks = response.json()
                keys = jwks.get('keys', [])
                
                # Cache for 1 hour
                cache.set(cache_key, keys, 3600)
                print(f"[AUTH DEBUG] ✅ Cached {len(keys)} JWKS key(s)")
            except requests.exceptions.HTTPError as e:
                print(f"[AUTH DEBUG] ❌ HTTP error fetching JWKS: {e}")
                print(f"[AUTH DEBUG] Response: {e.response.text if hasattr(e, 'response') else 'N/A'}")
                keys = []
            except Exception as e:
                print(f"[AUTH DEBUG] ❌ Failed to fetch JWKS: {e}")
                keys = []
        else:
            print(f"[AUTH DEBUG] Using cached JWKS keys ({len(keys)} key(s))")
        
        return keys
    
    def get_signing_key(self, token):
        """Get the appropriate signing key for the token"""
        try:
            # Get token header
            header = jwt.get_unverified_header(token)
            algorithm = header.get('alg')
            kid = header.get('kid')
            
            print(f"[AUTH DEBUG] Token algorithm: {algorithm}")
            print(f"[AUTH DEBUG] Token kid: {kid}")
            
            # For ES256/RS256, we need to get the public key from JWKS
            if algorithm.startswith('ES') or algorithm.startswith('RS'):
                jwks_keys = self.get_jwks_keys()
                
                if not jwks_keys:
                    raise AuthenticationFailed('Could not fetch JWKS keys from Supabase')
                
                # Find the key matching the token's kid
                signing_key = None
                for key in jwks_keys:
                    if key.get('kid') == kid:
                        # Import the JWK as a public key
                        from jwt.algorithms import RSAAlgorithm, ECAlgorithm
                        
                        if algorithm.startswith('ES'):
                            signing_key = ECAlgorithm.from_jwk(key)
                        else:
                            signing_key = RSAAlgorithm.from_jwk(key)
                        
                        print(f"[AUTH DEBUG] ✅ Found matching JWKS key for kid: {kid}")
                        break
                
                if not signing_key:
                    raise AuthenticationFailed(f'No matching key found for kid: {kid}')
                
                return signing_key, algorithm
            
            # For HS256/HS384/HS512, use the JWT secret (fallback)
            else:
                if not hasattr(settings, 'SUPABASE_JWT_SECRET') or not settings.SUPABASE_JWT_SECRET:
                    raise AuthenticationFailed('JWT secret not configured for HS256 tokens')
                return settings.SUPABASE_JWT_SECRET, algorithm
                
        except Exception as e:
            print(f"[AUTH DEBUG] ❌ Error getting signing key: {e}")
            raise AuthenticationFailed(f'Could not get signing key: {str(e)}')
    
    def authenticate(self, request):
        # 1. Check for the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            # 2. Extract the token
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed('Authorization header must start with Bearer')
            
            token = auth_header.split(' ')[1]
            print(f"[AUTH DEBUG] Token received (first 50 chars): {token[:50]}...")
            
            # 3. Get the appropriate signing key and algorithm
            signing_key, algorithm = self.get_signing_key(token)
            
            # 4. Decode and verify the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=[algorithm],
                audience="authenticated",
                options={
                    "verify_aud": True,
                    "verify_signature": True,
                    "verify_exp": True
                }
            )
            
            print(f"[AUTH DEBUG] ✅ Token verified successfully with {algorithm}")
            
        except jwt.ExpiredSignatureError:
            print(f"[AUTH DEBUG] ❌ Token has expired")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidAudienceError:
            print(f"[AUTH DEBUG] ❌ Invalid token audience")
            raise AuthenticationFailed('Invalid token audience')
        except jwt.DecodeError as e:
            print(f"[AUTH DEBUG] ❌ Decode error: {str(e)}")
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            print(f"[AUTH DEBUG] ❌ Unexpected error: {type(e).__name__}: {str(e)}")
            raise AuthenticationFailed(f'Authentication error: {str(e)}')
        
        # 5. Get the User's UUID and Email
        user_id = payload.get('sub')
        email = payload.get('email')
        
        print(f"[AUTH DEBUG] User ID: {user_id}")
        print(f"[AUTH DEBUG] Email: {email}")
        
        if not user_id:
            raise AuthenticationFailed('Token contained no user ID')
        
        # 6. Find or Create the User
        try:
            user, created = User.objects.get_or_create(
                id=user_id,
                defaults={'email': email, 'username': email}
            )
            if created:
                print(f"[AUTH DEBUG] ✅ Created new user: {email}")
            else:
                print(f"[AUTH DEBUG] ✅ Found existing user: {email}")
            
            return (user, None)
            
        except Exception as e:
            print(f"[AUTH DEBUG] ❌ Database error: {str(e)}")
            raise AuthenticationFailed(f'User creation failed: {str(e)}')