import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (typeof window === "undefined"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
);

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

