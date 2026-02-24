import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/session/claim
 *
 * Claims a session for a response token.
 * Returns 409 if session is already claimed by another client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, session_id, fingerprint } = body;

    if (!token || !session_id) {
      return NextResponse.json(
        { error: 'token and session_id are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current response state
    const { data: response, error: fetchError } = await supabase
      .from('response')
      .select(
        'id, active_session_id, session_fingerprint, last_heartbeat, is_ended'
      )
      .eq('token', token)
      .single();

    if (fetchError || !response) {
      logger.error('[Session Claim] Response not found:', {
        token,
        error: fetchError,
      });
      
return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    // Check if interview already ended
    if (response.is_ended) {
      return NextResponse.json(
        {
          error: 'Interview has already ended',
          message: 'This interview link has expired',
        },
        { status: 410 }
      );
    }

    // Check if there's an active session
    if (
      response.active_session_id &&
      response.active_session_id !== session_id
    ) {
      // Check if the existing session is stale (no heartbeat in 30 seconds)
      const lastHeartbeat = response.last_heartbeat
        ? new Date(response.last_heartbeat).getTime()
        : 0;
      const now = Date.now();
      const sessionTimeout = 30000; // 30 seconds

      if (now - lastHeartbeat < sessionTimeout) {
        // Active session exists and is still alive
        logger.warn('[Session Claim] Session conflict:', {
          token,
          existingSession: response.active_session_id,
          requestingSession: session_id,
        });
        
return NextResponse.json(
          {
            error: 'Session conflict',
            message: 'This interview is already open in another tab or device',
          },
          { status: 409 }
        );
      }

      // Existing session is stale, allow takeover
      logger.info('[Session Claim] Taking over stale session:', {
        token,
        staleSession: response.active_session_id,
        newSession: session_id,
      });
    }

    // Claim the session
    const { error: updateError } = await supabase
      .from('response')
      .update({
        active_session_id: session_id,
        session_fingerprint: fingerprint || null,
        last_heartbeat: new Date().toISOString(),
      })
      .eq('token', token);

    if (updateError) {
      logger.error('[Session Claim] Failed to claim session:', updateError);
      
return NextResponse.json(
        { error: 'Failed to claim session' },
        { status: 500 }
      );
    }

    logger.info('[Session Claim] Session claimed successfully:', {
      token,
      session_id,
    });

    return NextResponse.json({
      success: true,
      session_id,
      message: 'Session claimed',
    });
  } catch (error: any) {
    logger.error('[Session Claim] Error:', error);
    
return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
