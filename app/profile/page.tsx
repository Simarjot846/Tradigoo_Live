'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { createClient } from '@/lib/supabase-client';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user) return;
        const supabase = createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
        } else {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            fetchProfile();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen dark:bg-zinc-950 bg-background dark:text-zinc-100 text-foreground selection:bg-blue-500/30 transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 dark:opacity-20 bg-repeat mix-blend-overlay" />
            </div>



            <main className="relative z-10 container mx-auto px-6 py-10 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProfileHeader profile={profile} onUpdate={fetchProfile} />
                    <ProfileTabs profile={profile} onUpdate={fetchProfile} />

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
                </motion.div>
            </main>
        </div>
    );
}
