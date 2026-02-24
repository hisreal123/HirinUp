import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/session/heartbeat
 *
 * Updates the last_heartbeat timestamp for an active session.
 * Returns 409 if session was taken over by another client.
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

    // Check current session state
    const { data: response, error: fetchError } = await supabase
      .from('response')
      .select('active_session_id, is_ended')
      .eq('token', token)
      .single();

    if (fetchError || !response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    // Check if interview ended
    if (response.is_ended) {
      return NextResponse.json(
        { error: 'Interview ended', message: 'This interview has ended' },
        { status: 410 }
      );
    }

    // Check if session was taken over
    if (response.active_session_id !== session_id) {
      logger.warn('[Session Heartbeat] Session mismatch:', {
        token,
        expectedSession: session_id,
        currentSession: response.active_session_id,
      });
      
return NextResponse.json(
        {
          error: 'Session invalid',
          message: 'Your session was taken over by another tab or device',
        },
        { status: 409 }
      );
    }

    // Update heartbeat
    const { error: updateError } = await supabase
      .from('response')
      .update({ last_heartbeat: new Date().toISOString() })
      .eq('token', token)
      .eq('active_session_id', session_id);

    if (updateError) {
      logger.error('[Session Heartbeat] Failed to update:', updateError);
      
return NextResponse.json(
        { error: 'Failed to update heartbeat' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[Session Heartbeat] Error:', error);
    
return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
