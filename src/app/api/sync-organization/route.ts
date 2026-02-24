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

    const { id, name, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Upsert: insert on first call, update name/image on subsequent calls.
    // onConflict targets the primary key so concurrent requests don't race.
    const { data: result, error: upsertError } = await supabase
      .from('organization')
      .upsert(
        {
          id,
          name,
          image_url,
          plan: 'free',
          allowed_responses_count: 10,
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false, // update name/image_url if they changed
        }
      )
      .select()
      .single();

    if (upsertError) {
      logger.error('[sync-organization] Upsert error:', upsertError.message);

      return NextResponse.json(
        { error: 'Failed to sync organization' },
        { status: 500 }
      );
    }

    if (raw.cpk && result) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      
return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error('[sync-organization] Error:', err.message);
    
return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
