'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from './supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const buildFallbackProfile = useCallback((authUser: SupabaseUser): User => {
    return {
      id: authUser.id,
      email: (authUser.email || 'user@example.com').toLowerCase(),
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Trader',
      phone: authUser.phone || authUser.user_metadata?.phone || null,
      role: (authUser.user_metadata?.role as UserRole) || 'retailer',
      business_name: authUser.user_metadata?.business_name || '',
      location: authUser.user_metadata?.location || 'India',
      trust_score: 500,
      total_orders: 0,
      successful_orders: 0,
      disputed_orders: 0,
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User> => {
    const fallback = buildFallbackProfile(authUser);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile query timeout')), 3000)
      );
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: profile } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (!profile) {
        // Check if there was a selected role for new OAuth registration
        let assignedRole: UserRole = fallback.role;
        try {
          if (typeof window !== 'undefined') {
            const pendingRole = localStorage.getItem('tradigoo_pending_oauth_role');
            if (pendingRole === 'wholesaler' || pendingRole === 'retailer') {
              assignedRole = pendingRole;
              localStorage.removeItem('tradigoo_pending_oauth_role');
            }
          }
        } catch {}

        const newProfile = { ...fallback, role: assignedRole };
        // Insert only if not existing — never overwrite an existing profile
        supabase.from('profiles').insert(newProfile as any).then(() => {}, () => {});
        return newProfile;
      }

      // Existing profile found — preserve its role and data strictly
      return {
        ...fallback,
        ...profile,
        id: authUser.id,
        email: (authUser.email || profile.email || fallback.email).toLowerCase(),
      };
    } catch {
      return fallback;
    }
  }, [supabase, buildFallbackProfile]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const fallback = buildFallbackProfile(authUser);
        setUser(fallback);
        fetchUserProfile(authUser).then(p => setUser(p)).catch(() => {});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [supabase, buildFallbackProfile, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    const applyUserSession = async (authUser: SupabaseUser | null) => {
      if (!mounted) return;

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 1. Immediately provide authenticated state from session
      const instantProfile = buildFallbackProfile(authUser);
      setUser(instantProfile);
      setLoading(false);

      // 2. Enrich profile from DB in background
      try {
        const fullProfile = await fetchUserProfile(authUser);
        if (mounted) {
          setUser(fullProfile);
        }
      } catch (err) {
        console.warn("Background profile fetch:", err);
      }
    };

    const initAuth = async () => {
      // Step A: Warm up storage cache (Preferences + localStorage)
      try {
        const { warmUpCapacitorStorage } = await import('@/lib/supabase-client');
        await warmUpCapacitorStorage();
      } catch {}

      if (!mounted) return;

      // Step B: Inspect existing session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          await applyUserSession(session.user);
          return;
        }

        if (!error) {
          // Secondary attempt with getUser in case token needs refresh
          const { data: { user: authUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
          if (mounted) {
            if (authUser) {
              await applyUserSession(authUser);
            } else {
              applyUserSession(null);
            }
          }
        } else {
          applyUserSession(null);
        }
      } catch {
        if (mounted) applyUserSession(null);
      }
    };

    initAuth();

    // Step C: Subscribe to all Supabase Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (session.user) {
          if (event === 'TOKEN_REFRESHED' && user?.id === session.user.id) {
            return;
          }
          await applyUserSession(session.user);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, buildFallbackProfile, fetchUserProfile]);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      // 1. Attempt client-side Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Fallback to server API route
        try {
          const res = await fetch('/api/auth/signin', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const payload = await res.json();
          if (res.ok && payload.user) {
            const instantProfile = buildFallbackProfile(payload.user);
            setUser(instantProfile);
            setLoading(false);
            fetchUserProfile(payload.user).then(p => setUser(p)).catch(() => {});
            return instantProfile;
          }
        } catch {}
        throw error;
      }

      if (data.user) {
        const instantProfile = buildFallbackProfile(data.user);
        setUser(instantProfile);
        setLoading(false);
        fetchUserProfile(data.user).then(p => setUser(p)).catch(() => {});
        return instantProfile;
      }

      setLoading(false);
      return null;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async (role?: UserRole) => {
    try {
      if (typeof window !== 'undefined' && role) {
        try {
          localStorage.setItem('tradigoo_pending_oauth_role', role);
        } catch {}
      }

      const { Capacitor } = await import('@capacitor/core');
      const isNative = Capacitor.isNativePlatform();

      const redirectTo = isNative
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradigoo-production.up.railway.app'}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          ...(isNative && { skipBrowserRedirect: false }),
        },
      });

      if (error) throw error;
    } catch (importErr) {
      // Fallback for web
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Strict pre-check: verify email uniqueness via server endpoint (bypasses RLS)
      try {
        const checkRes = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setLoading(false);
          throw new Error('This email is already registered. Please log in instead.');
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already registered')) {
          setLoading(false);
          throw checkErr;
        }
      }

      // 2. Attempt Supabase Auth signup
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: userData.role || 'retailer',
            business_name: userData.business_name || '',
            phone: userData.phone || null,
            location: userData.location || 'India',
          }
        }
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email already')) {
          setLoading(false);
          throw new Error('This email is already registered. Please log in instead.');
        }

        // Fallback to server API signup route
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, password, userData }),
        });
        const respData = await response.json();
        if (!response.ok) {
          throw new Error(respData.error || error.message || 'Failed to sign up');
        }
        if (respData.user) {
          const instantProfile = buildFallbackProfile(respData.user);
          setUser(instantProfile);
          setLoading(false);
          fetchUserProfile(respData.user).then(p => setUser(p)).catch(() => {});
        }
        setLoading(false);
        return;
      }

      // 3. Supabase anti-enumeration detection: empty identities means email was already registered!
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setLoading(false);
        throw new Error('This email is already registered. Please log in instead.');
      }

      if (data.user) {
        const newProfile: User = {
          id: data.user.id,
          email: cleanEmail,
          name: userData.name || cleanEmail.split('@')[0],
          role: userData.role || 'retailer',
          business_name: userData.business_name || '',
          phone: userData.phone || null,
          location: userData.location || 'India',
          trust_score: 500,
          total_orders: 0,
          successful_orders: 0,
          disputed_orders: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert only if not existing
        await supabase.from('profiles').insert(newProfile as any);
        setUser(newProfile);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut().catch(() => {});
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }).catch(() => {});

      // Clear all cached storage
      try {
        if (typeof window !== 'undefined') {
          // Clear localStorage
          for (let i = window.localStorage.length - 1; i >= 0; i--) {
            const key = window.localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.startsWith('supabase') || key.startsWith('tradigoo_'))) {
              window.localStorage.removeItem(key);
            }
          }

          // Clear native preferences
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { Preferences } = await import('@capacitor/preferences');
            const { keys } = await Preferences.keys();
            await Promise.all(
              keys
                .filter(k => k.startsWith('sb-') || k.startsWith('supabase') || k.startsWith('tradigoo_'))
                .map(k => Preferences.remove({ key: k }))
            );
          }
        }
      } catch {}
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser,
    resetPassword,
    updatePassword
  }), [user, loading, buildFallbackProfile, fetchUserProfile, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
