import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const createResponse = async (payload: any) => {
  const { error, data } = await supabase
    .from("response")
    .insert({ ...payload })
    .select("id, token"); // Select both id and token to verify

  if (error) {
    console.error("Error creating response:", error);
    console.error("Payload that failed:", payload);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("No data returned from insert");
    return null;
  }

  return data[0]?.id;
};

const saveResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllResponses = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching responses:", error);
      return [];
    }

    // Return all responses (both completed and incomplete)
    return data || [];
  } catch (error) {
    console.error("Error in getAllResponses:", error);
    return [];
  }
};

const getResponseCountByOrganizationId = async (
  organizationId: string,
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("interview")
      .select("response(id)", { count: "exact", head: true }) // join + count
      .eq("organization_id", organizationId);

    return count ?? 0;
  } catch (error) {
    console.log(error);

    return 0;
  }
};

const getAllEmailAddressesForInterview = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`email`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getResponseByCallId = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .filter("call_id", "eq", id);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getResponseById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching response by id:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getResponseByToken = async (token: string) => {
  try {
    console.log("Fetching response by token:", token);
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("token", token)
      .single();

    if (error) {
      console.error("Error fetching response by token:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    console.log("Response found by token:", data);
    return data;
  } catch (error) {
    console.error("Exception in getResponseByToken:", error);
    return null;
  }
};

const deleteResponse = async (id: string) => {
  const { error, data } = await supabase
    .from("response")
    .delete()
    .eq("call_id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const updateResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const updateResponseById = async (payload: any, responseId: number) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("id", responseId);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
};

const updateResponseByToken = async (payload: any, token: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("token", token);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
};

export const ResponseService = {
  createResponse,
  saveResponse,
  updateResponse,
  updateResponseById,
  updateResponseByToken,
  getAllResponses,
  getResponseByCallId,
  getResponseById,
  getResponseByToken,
  deleteResponse,
  getResponseCountByOrganizationId,
  getAllEmails: getAllEmailAddressesForInterview,
};
