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
  signInWithGoogle: () => Promise<void>;
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
      email: authUser.email || 'user@example.com',
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
        setTimeout(() => reject(new Error('Profile query timeout')), 2500)
      );
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: profile } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (!profile) {
        // Ensure profile row exists in background without blocking
        supabase.from('profiles').upsert(fallback as any).then(() => {}, () => {});
        return fallback;
      }

      return {
        ...fallback,
        ...profile,
        // Preserve essential user identity
        id: authUser.id,
        email: authUser.email || profile.email || fallback.email,
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
    let initialSessionHandled = false;

    // Safety timeout: Ensure loading is never true for more than 2.5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 2500);

    const applyUserSession = async (authUser: SupabaseUser | null) => {
      if (!mounted) return;

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Step 1: Set user IMMEDIATELY in 0ms from in-memory session metadata
      const instantProfile = buildFallbackProfile(authUser);
      setUser(instantProfile);
      setLoading(false);

      // Step 2: Asynchronously enrich from database in background
      try {
        const fullProfile = await fetchUserProfile(authUser);
        if (mounted) {
          setUser(fullProfile);
        }
      } catch (err) {
        console.warn("Background profile fetch:", err);
      }
    };

    // 1. Initial Session Inspection
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (session?.user) {
        initialSessionHandled = true;
        applyUserSession(session.user);
      } else if (!error) {
        // Give a short 200ms grace period for local storage / cookie hydration
        setTimeout(async () => {
          if (!mounted || initialSessionHandled) return;
          const retry = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
          if (mounted && !initialSessionHandled) {
            applyUserSession(retry.data?.session?.user || null);
          }
        }, 200);
      } else {
        applyUserSession(null);
      }
    }).catch(() => {
      if (mounted) applyUserSession(null);
    });

    // 2. Subscribe to all Supabase Auth State changes (The Single Authority)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        initialSessionHandled = true;

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
      clearTimeout(safetyTimer);
    };
  }, [supabase, buildFallbackProfile, fetchUserProfile]);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      // 1. Attempt client-side Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Fallback to server API route
        try {
          const res = await fetch('/api/auth/signin', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
          });
          const payload = await res.json();
          if (res.ok && payload.user) {
            const instantProfile = buildFallbackProfile(payload.user);
            setUser(instantProfile);
            setLoading(false);
            fetchUserProfile(payload.user).then(p => setUser(p)).catch(() => {});
            return instantProfile;
          }
        } catch {
          // If server fallback also fails, propagate error
        }
        throw error;
      }

      if (data.user) {
        // Instantly populate user in memory (0ms) before returning
        const instantProfile = buildFallbackProfile(data.user);
        setUser(instantProfile);
        setLoading(false);
        // Enrich from DB in background
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

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'retailer',
            business_name: userData.business_name,
            phone: userData.phone,
            location: userData.location,
          }
        }
      });

      if (error) {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.trim(), password, userData }),
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

      if (data.user) {
        const newProfile: User = {
          id: data.user.id,
          email: data.user.email || email.trim(),
          name: userData.name || email.split('@')[0],
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

        await supabase.from('profiles').upsert(newProfile as any);
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
      // 1. Sign out on client to clear local storage tokens
      await supabase.auth.signOut().catch(() => {});
      // 2. Sign out on server to clear cookies
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
