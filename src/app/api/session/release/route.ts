import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/session/release
 *
 * Releases a session when the user closes the tab/browser.
 * Only releases if the session_id matches (prevents unauthorized releases).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, session_id } = body;

    if (!token || !session_id) {
      return NextResponse.json(
        { error: 'token and session_id are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only release if session_id matches (security check)
    const { data, error: updateError } = await supabase
      .from('response')
      .update({
        active_session_id: null,
        last_heartbeat: null,
      })
      .eq('token', token)
      .eq('active_session_id', session_id)
      .select('id');

    if (updateError) {
      logger.error('[Session Release] Failed to release:', updateError);
      
return NextResponse.json(
        { error: 'Failed to release session' },
        { status: 500 }
      );
    }

    if (data && data.length > 0) {
      logger.info('[Session Release] Session released:', { token, session_id });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[Session Release] Error:', error);
    
return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
