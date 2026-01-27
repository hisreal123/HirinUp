import { useMutation } from "@tanstack/react-query";
import { CandidateService } from "@/services/candidates.service";

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

export const useCreateOrUpdateCandidate = () => {
  return useMutation({
    mutationFn: async ({
      candidateData,
      email,
    }: {
      candidateData: CandidateData;
      email?: string | null;
    }): Promise<number | null> => {
      return await CandidateService.createOrUpdateCandidate(candidateData, email);
    },
  });
};

