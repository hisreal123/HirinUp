import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface GetCallParams {
  id: string;
}

interface GetCallResponse {
  callResponse: any;
  analytics: any;
}

export const useGetCall = (callId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["call", callId],
    queryFn: async (): Promise<GetCallResponse> => {
      if (!callId) throw new Error("Call ID is required");
      const response = await axios.post("/api/get-call", { id: callId });
      return response.data;
    },
    enabled: enabled && !!callId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

