'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { createClient } from '@/lib/supabase-client';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';

function ProfileContent() {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState<any>(user || null);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const supabase = createClient();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            );
            const queryPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            const { data } = (await Promise.race([queryPromise, timeoutPromise])) as any;
            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.warn("Background profile fetch:", error);
        }
    };

    useEffect(() => {
        if (user) {
            setProfile((prev: any) => prev || user);
            fetchProfile();
        }
    }, [user]);

    const currentProfile = profile || user;

    return (
        <div className="min-h-screen dark:bg-zinc-950 bg-background dark:text-zinc-100 text-foreground selection:bg-blue-500/30 transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-10 max-w-5xl">
                <div>
                    <ProfileHeader profile={currentProfile} onUpdate={fetchProfile} />
                    <ProfileTabs profile={currentProfile} onUpdate={fetchProfile} />

                    {/* Hackathon Demo Controls */}
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
                            Developer Controls (Demo Only)
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={async () => {
                                    if (!confirm("⚠️ This will insert demo orders and products. Continue?")) return;
                                    const res = await fetch('/api/seed', { method: 'POST' });
                                    const data = await res.json();
                                    alert(data.message || 'Seeding Done');
                                }}
                                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors font-medium"
                            >
                                ⚡ Load Demo Data
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfileContent />
        </AuthGuard>
    );
}
