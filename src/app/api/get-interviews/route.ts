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

    const { userId, organizationId, search, cursor, limit = 1000, dateFrom, dateTo } = body;

    if (!userId && !organizationId) {
      return NextResponse.json(
        { error: 'userId or organizationId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('interview')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    } else {
      query = query.eq('user_id', userId);
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    if (search) {
      // Also find interviews that have a matching response token/id
      const { data: matchingResponses } = await supabase
        .from('response')
        .select('interview_id')
        .ilike('token', `%${search}%`)
        .limit(50);

      const responseInterviewIds = (matchingResponses || [])
        .map((r: any) => r.interview_id)
        .filter(Boolean);

      if (responseInterviewIds.length > 0) {
        query = query.or(
          `id.ilike.%${search}%,name.ilike.%${search}%,id.in.(${responseInterviewIds.join(',')})`
        );
      } else {
        query = query.or(`id.ilike.%${search}%,name.ilike.%${search}%`);
      }
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      logger.warn('[get-interviews] Query error:', { error });

      return NextResponse.json(
        { error: 'Failed to fetch interviews' },
        { status: 500 }
      );
    }

    const rows = data || [];
    const hasNextPage = rows.length > limit;
    if (hasNextPage) { rows.pop(); }
    const nextCursor =
      hasNextPage ? (rows[rows.length - 1]?.created_at ?? null) : null;

    const result = { data: rows, nextCursor };

    if (raw.cpk) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);

      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error('[get-interviews] Error:', err.message);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
