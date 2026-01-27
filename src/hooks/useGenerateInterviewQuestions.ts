import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface GenerateQuestionsParams {
  name: string;
  objective: string;
  number: number;
  context?: string;
}

interface GenerateQuestionsResponse {
  response: string;
  error?: string;
  details?: string;
}

export const useGenerateInterviewQuestions = () => {
  return useMutation({
    mutationFn: async (
      params: GenerateQuestionsParams,
    ): Promise<GenerateQuestionsResponse> => {
      const response = await axios.post(
        "/api/generate-interview-questions",
        params,
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Questions generated successfully!");
    },
    onError: (error: any) => {
      console.error("Error generating questions:", error);
      const errorMessage =
        error.response?.data?.details || error.response?.data?.error;

      if (errorMessage?.includes("quota") || errorMessage?.includes("429")) {
        toast.error(
          "OpenAI API quota exceeded. Please check your billing and add credits to your OpenAI account.",
          { duration: 5000 },
        );
      } else {
        toast.error(
          `Failed to generate questions: ${errorMessage || "Unknown error"}`,
          {
            duration: 5000,
          },
        );
      }
    },
  });
};
