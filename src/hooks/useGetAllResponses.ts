import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";

export const useGetAllResponses = (interviewId: string | null, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["responses", interviewId],
    queryFn: async (): Promise<Response[]> => {
      if (!interviewId) throw new Error("Interview ID is required");
      return await ResponseService.getAllResponses(interviewId);
    },
    enabled: enabled && !!interviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["responses", interviewId] });
  };

  return {
    ...query,
    refetch,
  };
};

