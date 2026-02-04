import { createClientWithCookieCollector } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard';
    const type = searchParams.get('type'); // type=recovery

    if (code) {
        const { supabase, cookieActions } = await createClientWithCookieCollector();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const redirectUrl = type === 'recovery'
                ? `${origin}/auth/update-password`
                : `${origin}${next}`;

            const response = NextResponse.redirect(redirectUrl);

            // Apply the collected cookies to the response
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
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
