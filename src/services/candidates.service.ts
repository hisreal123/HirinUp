import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

interface CandidateData {
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  gender?: string | null;
  country?: string | null;
  portfolio_website?: string | null;
  social_media_links?: Record<string, any> | null;
  work_experience?: Record<string, any> | null;
}

const createOrUpdateCandidate = async (
  candidateData: CandidateData,
  email?: string | null,
): Promise<number | null> => {
  try {
    // If email is provided, check if candidate already exists
    if (email) {
      const { data: existingCandidate, error: checkError } = await supabase
        .from("candidate")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing candidate:", checkError);
        throw new Error(`Database check error: ${checkError.message}`);
      }

      if (existingCandidate) {
        // Update existing candidate
        const { error: updateError, data: updatedData } = await supabase
          .from("candidate")
          .update(candidateData)
          .eq("id", existingCandidate.id)
          .select("id")
          .single();

        if (updateError) {
          console.error("Error updating candidate:", updateError);
          throw new Error(`Database update error: ${updateError.message}`);
        }

        return updatedData?.id || null;
      }
    }

    // Create new candidate
    const { error: insertError, data: newCandidate } = await supabase
      .from("candidate")
      .insert(candidateData)
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating candidate:", insertError);
      throw new Error(`Database insert error: ${insertError.message}`);
    }

    if (!newCandidate) {
      throw new Error("No data returned from insert");
    }

    return newCandidate.id;
  } catch (error: any) {
    console.error("Error in createOrUpdateCandidate:", error);
    throw error;
  }
};

const getCandidateById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("candidate")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching candidate by id:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCandidateById:", error);
    return null;
  }
};

const getCandidateByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from("candidate")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching candidate by email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCandidateByEmail:", error);
    return null;
  }
};

const getAllCandidates = async () => {
  try {
    const { data, error } = await supabase
      .from("candidate")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching candidates:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllCandidates:", error);
    return [];
  }
};

export const CandidateService = {
  createOrUpdateCandidate,
  getCandidateById,
  getCandidateByEmail,
  getAllCandidates,
};

