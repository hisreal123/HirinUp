import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getOrganizationById = async (organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from("organization")
      .select(`*`)
      .eq("id", organizationId)
      .single();

    if (error) {
      console.error("Error fetching organization:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getOrganizationById:", error);
    return null;
  }
};

export const OrganizationService = {
  getOrganizationById,
};

