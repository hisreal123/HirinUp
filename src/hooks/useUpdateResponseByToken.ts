import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponseService } from "@/services/responses.service";

interface UpdateResponseParams {
  call_id?: string;
  email?: string;
  name?: string;
  candidate_id?: number | null;
  [key: string]: any;
}

export const useUpdateResponseByToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      token,
    }: {
      payload: UpdateResponseParams;
      token: string;
    }): Promise<any> => {
      return await ResponseService.updateResponseByToken(payload, token);
    },
    onSuccess: () => {
      // Invalidate responses queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });
};

