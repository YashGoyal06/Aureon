import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useHeaderUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser && mounted) {
          const identityData = sessionUser.identities?.[0]?.identity_data || {};
          const avatarUrl = sessionUser.user_metadata?.avatar_url 
            || sessionUser.user_metadata?.picture 
            || identityData.avatar_url 
            || identityData.picture 
            || sessionUser.user_metadata?.custom_claims?.picture;

          const displayName = sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User';
          setUser({
            name: displayName,
            email: sessionUser.email,
            avatar: avatarUrl,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
    return () => {
      mounted = false;
    };
  }, []);

  return user;
}
