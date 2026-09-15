import { createClientWithCookieCollector, createServiceClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';
    const type = requestUrl.searchParams.get('type');

    if (code) {
        const { supabase, cookieActions } = await createClientWithCookieCollector();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.session) {
            // Auto-create profile for new Google OAuth user if missing
            if (data.user) {
                try {
                    const supabaseAdmin = createServiceClient();
                    const { data: existingProfile } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('id', data.user.id)
                        .maybeSingle();

                    if (!existingProfile) {
                        await supabaseAdmin.from('profiles').insert({
                            id: data.user.id,
                            email: data.user.email?.toLowerCase() || '',
                            role: 'retailer',
                            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Trader',
                            business_name: data.user.user_metadata?.business_name || '',
                            location: data.user.user_metadata?.location || 'India',
                            trust_score: 500,
                            total_orders: 0,
                            successful_orders: 0,
                            disputed_orders: 0,
                        });
                    }
                } catch (pErr) {
                    console.warn('Callback profile creation notice:', pErr);
                }
            }

            const baseUrl = requestUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://tradigoo.vercel.app';
            const redirectUrl = type === 'recovery'
                ? `${baseUrl}/auth/update-password`
                : `${baseUrl}${next}`;

            const response = NextResponse.redirect(redirectUrl);

            // Apply collected cookies
            if (cookieActions && cookieActions.length) {
                cookieActions.forEach(action => {
                    response.cookies.set({
                        name: action.name,
                        value: action.value,
                        ...action.options,
                    });
                });
            }

            return response;
        }

        // If server-side code exchange fails (e.g. PKCE verifier stored client-side in localStorage/Capacitor storage),
        // fallback to client-side callback page so client JS completes code exchange with client storage!
        console.warn('Server code exchange notice:', error?.message);
        const fallbackUrl = new URL('/auth/callback/client', request.url);
        fallbackUrl.searchParams.set('code', code);
        if (next) fallbackUrl.searchParams.set('next', next);
        return NextResponse.redirect(fallbackUrl.toString());
    }

    // No code present — forward to dashboard if session exists or login page
    return NextResponse.redirect(new URL('/dashboard', request.url));
}
