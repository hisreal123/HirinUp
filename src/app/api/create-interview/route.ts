import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { InterviewService } from '@/services/interviews.service';
import { logger } from '@/lib/logger';

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const url_id = nanoid();
    const url = `${base_url}/join/${url_id}`;
    const body = await req.json();

    logger.info('create-interview request received');

    const payload = body.interviewData;
    const organizationId: string | undefined = payload?.organization_id;

    // Build readable_slug as "org-name-url_id" so it is always unique per
    // interview (org name alone caused a UNIQUE violation on the second interview).
    let readableSlug = url_id;
    if (body.organizationName) {
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      readableSlug = `${orgNameSlug}-${url_id}`;
    }

    // Guard against FK violation: if the org hasn't been synced yet (race
    // between Clerk org creation and sync-organization completing), upsert it
    // now so the interview insert doesn't fail with a foreign-key error.
    if (organizationId) {
      const { data: existingOrg } = await supabase
        .from('organization')
        .select('id')
        .eq('id', organizationId)
        .single();

      if (!existingOrg) {
        await supabase.from('organization').upsert(
          {
            id: organizationId,
            name: body.organizationName || organizationId,
            plan: 'free',
            allowed_responses_count: 10,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      }
    }

    // Enforce 1000 interview limit per organization / user
    const countQuery = supabase
      .from('interview')
      .select('id', { count: 'exact', head: true });
    const { count } = organizationId
      ? await countQuery.eq('organization_id', organizationId)
      : await countQuery.eq('user_id', payload?.user_id);

    if ((count ?? 0) >= 1000) {
      return NextResponse.json(
        { error: 'Interview limit reached. Maximum 1000 interviews allowed per organization.' },
        { status: 403 }
      );
    }

    const error = await InterviewService.createInterview({
      ...payload,
      url: url,
      id: url_id,
      readable_slug: readableSlug,
    });

    if (error) {
      logger.error('Interview insert failed:', error);

      return NextResponse.json(
        { error: 'Failed to create interview' },
        { status: 500 }
      );
    }

    logger.info('Interview created successfully');

    return NextResponse.json(
      { response: 'Interview created successfully' },
      { status: 200 }
    );
  } catch (err) {
    logger.error('Error creating interview');

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
