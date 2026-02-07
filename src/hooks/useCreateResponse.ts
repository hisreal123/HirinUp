import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateResponseParams {
  interview_id: string;
  email?: string;
  name?: string;
  call_id?: string;
  candidate_id?: number;
  turnstile_token?: string; // Required for candidate submissions, optional for admin link generation
}

interface CreateResponseResponse {
  response_id: string;
}

export const useCreateResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateResponseParams): Promise<CreateResponseResponse> => {
      const response = await axios.post("/api/create-response", params);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });
};

