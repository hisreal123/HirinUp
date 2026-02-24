'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEncryptedFetch } from './useEncryptedFetch';

interface CreateResponseParams {
  interview_id: string;
  email?: string;
  name?: string;
  call_id?: string;
  candidate_id?: number;
  turnstile_token?: string;
}

interface CreateResponseResponse {
  response_id: string;
}

/**
 * Encrypted version of useCreateResponse — for use in the candidate interview flow only.
 * Payload and response are ECDH + AES-GCM encrypted.
 * Admin link generation uses the plain useCreateResponse instead.
 */
export const useEncryptedCreateResponse = () => {
  const queryClient = useQueryClient();
  const { encryptedFetch, isReady } = useEncryptedFetch();

  const mutation = useMutation({
    mutationFn: async (
      params: CreateResponseParams
    ): Promise<CreateResponseResponse> => {
      return encryptedFetch('/api/create-response', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
  });

  return { ...mutation, isReady };
};
