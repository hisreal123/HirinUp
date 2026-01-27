import { useQuery } from "@tanstack/react-query";
import { ResponseService } from "@/services/responses.service";

interface EmailResponse {
  email: string;
}

export const useGetAllEmails = (interviewId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["emails", interviewId],
    queryFn: async (): Promise<EmailResponse[]> => {
      if (!interviewId) throw new Error("Interview ID is required");
      return await ResponseService.getAllEmails(interviewId);
    },
    enabled: enabled && !!interviewId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

