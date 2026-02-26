import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface CreateResponseParams {
  interview_id: string;
  email?: string;
  name?: string;
  call_id?: string;
  candidate_id?: number;
  turnstile_token?: string;
  is_two_flow?: boolean;
}

interface CreateResponseResponse {
  response_id: string;
}

export const useCreateResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: CreateResponseParams
    ): Promise<CreateResponseResponse> => {
      const response = await axios.post('/api/create-response', params);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
  });
};
