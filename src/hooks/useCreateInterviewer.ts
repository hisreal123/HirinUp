import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface CreateInterviewerParams {
  name: string;
  voice_id?: string;
  [key: string]: any;
}

interface CreateInterviewerResponse {
  id: string;
  [key: string]: any;
}

export const useCreateInterviewer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateInterviewerParams): Promise<CreateInterviewerResponse> => {
      const response = await axios.get("/api/create-interviewer", { params });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate interviewers list to refetch
      queryClient.invalidateQueries({ queryKey: ["interviewers"] });
      toast.success("Interviewer created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating interviewer:", error);
      toast.error(
        error.response?.data?.error || "Failed to create interviewer. Please try again.",
      );
    },
  });
};

