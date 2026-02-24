import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverDecryptPayload, serverEncryptResponse } from '@/lib/crypto';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    let body: any;
    if (raw.data && raw.iv && raw.cpk) {
      body = await serverDecryptPayload(raw.data, raw.iv, raw.cpk);
    } else {
      body = raw;
    }

    const { call_id } = body;

    if (!call_id) {
      return NextResponse.json(
        { error: 'call_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('response')
      .select('*')
      .filter('call_id', 'eq', call_id);

    if (error) {
      logger.warn('[get-response-by-call] Query error:', { error });
      
return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    const result = data?.[0] || null;

    if (raw.cpk && result) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      
return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error('[get-response-by-call] Error:', err.message);
    
return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
