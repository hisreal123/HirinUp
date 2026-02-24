import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (typeof window === 'undefined'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
);

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    // When in an org, show only that org's interviews. When personal, show only by user_id.
    const query = supabase
      .from('interview')
      .select(`*`)
      .order('created_at', { ascending: false });
    const { data: clientData, error: clientError } = organizationId
      ? await query.eq('organization_id', organizationId)
      : await query.eq('user_id', userId);

    return [...(clientData || [])];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('interview')
      .select(`*`)
      .or(`id.eq.${id},readable_slug.eq.${id}`);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const updateInterview = async (payload: any, id: string) => {
  const { error, data } = await supabase
    .from('interview')
    .update({ ...payload })
    .eq('id', id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from('interview')
    .delete()
    .eq('id', id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from('interview')
      .select(`respondents`)
      .eq('interview_id', interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterview = async (payload: any) => {
  const { error } = await supabase
    .from('interview')
    .insert({ ...payload });
  if (error) {
    console.error('[createInterview] Insert error:', error.message);

    return error; // return the error so callers can detect failure
  }

  return null; // explicit null = success
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    const { error } = await supabase
      .from('interview')
      .update({ is_active: false })
      .eq('organization_id', organizationId)
      .eq('is_active', true); // Optional: only update if currently active

    if (error) {
      console.error('Failed to deactivate interviews:', error);
    }
  } catch (error) {
    console.error('Unexpected error disabling interviews:', error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};
