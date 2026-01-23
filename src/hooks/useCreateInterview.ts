import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface CreateInterviewParams {
  name: string;
  objective: string;
  time_duration: string;
  interviewer_id: string;
  questions: Array<{ question: string }>;
  organization_id?: string;
}

interface CreateInterviewResponse {
  id: string;
  [key: string]: any;
}

export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateInterviewParams): Promise<CreateInterviewResponse> => {
      const response = await axios.post("/api/create-interview", params);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate interviews list to refetch
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast.success("Interview created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating interview:", error);
      toast.error(
        error.response?.data?.error || "Failed to create interview. Please try again.",
      );
    },
  });
};

