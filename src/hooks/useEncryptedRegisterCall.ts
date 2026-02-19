"use client";

import { useMutation } from "@tanstack/react-query";
import { useEncryptedFetch } from "./useEncryptedFetch";

interface RegisterCallParams {
  dynamic_data: {
    mins: string | number;
    objective: string;
    questions: string;
    name: string;
  };
  interviewer_id: string | number;
  token?: string;
  session_id?: string;
}

interface RegisterCallResponse {
  registerCallResponse: {
    access_token: string;
    call_id: string;
    [key: string]: any;
  };
}

/**
 * Encrypted version of useRegisterCall — for use in the candidate interview flow only.
 * Payload (interview questions, candidate name, access token) and response are
 * ECDH + AES-GCM encrypted.
 */
export const useEncryptedRegisterCall = () => {
  const { encryptedFetch, isReady } = useEncryptedFetch();

  const mutation = useMutation({
    mutationFn: async (params: RegisterCallParams): Promise<RegisterCallResponse> => {
      return encryptedFetch("/api/register-call", params);
    },
  });

  return { ...mutation, isReady };
};
