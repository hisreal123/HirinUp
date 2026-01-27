import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getAllInterviewers = async (clientId: string = "") => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from("interviewer")
      .select(`*`);

    if (clientError) {
      console.error(
        `Error fetching interviewers for clientId ${clientId}:`,
        clientError,
      );

      return [];
    }

    return clientData || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterviewer = async (payload: any) => {
  try {
    // Check for existing interviewer with the same name and agent_id
    const { data: existingInterviewer, error: checkError } = await supabase
      .from("interviewer")
      .select("*")
      .eq("name", payload.name)
      .eq("agent_id", payload.agent_id)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing interviewer:", checkError);
      throw new Error(`Database check error: ${checkError.message}`);
    }

    if (existingInterviewer) {
      console.log(
        `Interviewer "${payload.name}" with agent_id "${payload.agent_id}" already exists`,
      );
      return existingInterviewer; // Return existing instead of null
    }

    const { error, data } = await supabase
      .from("interviewer")
      .insert({ ...payload })
      .select();

    if (error) {
      console.error("Error creating interviewer:", error);
      throw new Error(`Database insert error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from insert");
    }

    return data[0];
  } catch (error: any) {
    console.error("Error in createInterviewer:", error);
    throw error; // Re-throw to let caller handle it
  }
};

const getInterviewer = async (interviewerId: bigint) => {
  const { data: interviewerData, error: interviewerError } = await supabase
    .from("interviewer")
    .select("*")
    .eq("id", interviewerId)
    .single();

  if (interviewerError) {
    console.error("Error fetching interviewer:", interviewerError);

    return null;
  }

  return interviewerData;
};

const deleteInterviewer = async (interviewerId: bigint) => {
  const { error } = await supabase
    .from("interviewer")
    .delete()
    .eq("id", interviewerId);

  if (error) {
    console.error("Error deleting interviewer:", error);
    throw new Error(`Database delete error: ${error.message}`);
  }

  return true;
};

const deleteInterviewerByName = async (name: string) => {
  const { error } = await supabase
    .from("interviewer")
    .delete()
    .eq("name", name);

  if (error) {
    console.error("Error deleting interviewer by name:", error);
    throw new Error(`Database delete error: ${error.message}`);
  }

  return true;
};

const updateInterviewerAgentId = async (interviewerId: bigint, agentId: string) => {
  const { data, error } = await supabase
    .from("interviewer")
    .update({ agent_id: agentId })
    .eq("id", interviewerId)
    .select()
    .single();

  if (error) {
    console.error("Error updating interviewer agent_id:", error);
    throw new Error(`Database update error: ${error.message}`);
  }

  return data;
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
  deleteInterviewer,
  deleteInterviewerByName,
  updateInterviewerAgentId,
};
