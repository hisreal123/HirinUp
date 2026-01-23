import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface AnalyzeCallParams {
  id: string;
}

interface AnalyzeCallResponse {
  callResponse: any;
  analytics: any;
}

/**
 * Hook to trigger call analysis (used for refetching/analyzing unanalyzed calls)
 * This is a mutation because it triggers server-side analysis
 */
export const useAnalyzeCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AnalyzeCallParams): Promise<AnalyzeCallResponse> => {
      const response = await axios.post("/api/get-call", params);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the call query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["call", variables.id] });
      // Also invalidate responses to update the analysis status
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });
};

