import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error: responsesError } = await supabase
      .from('response')
      .delete()
      .eq('interview_id', id);

    if (responsesError) {
      logger.error('[delete-interview] Failed to delete responses:', responsesError.message);
      return NextResponse.json({ error: responsesError.message }, { status: 500 });
    }

    const { error } = await supabase.from('interview').delete().eq('id', id);

    if (error) {
      logger.error('[delete-interview] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    logger.error('[delete-interview] Error:', err.message);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
