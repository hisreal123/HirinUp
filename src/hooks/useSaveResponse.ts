import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponseService } from "@/services/responses.service";

interface SaveResponseParams {
  is_ended?: boolean;
  tab_switch_count?: number;
  details?: any;
  is_analysed?: boolean;
  duration?: number;
  analytics?: any;
  [key: string]: any;
}

export const useSaveResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      callId,
    }: {
      payload: SaveResponseParams;
      callId: string;
    }): Promise<any> => {
      return await ResponseService.saveResponse(payload, callId);
    },
    onSuccess: () => {
      // Invalidate responses queries with a debounce to prevent rapid refetch loops
      // Use a small delay to batch multiple invalidations
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["responses"] });
        queryClient.invalidateQueries({ queryKey: ["call"] });
      }, 500);
    },
  });
};

