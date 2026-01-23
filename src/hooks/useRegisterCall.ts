import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface RegisterCallParams {
  dynamic_data: {
    mins: string | number;
    objective: string;
    questions: string;
    name: string;
  };
  interviewer_id: string | number;
}

interface RegisterCallResponse {
  registerCallResponse: {
    access_token: string;
    call_id: string;
    [key: string]: any;
  };
}

export const useRegisterCall = () => {
  return useMutation({
    mutationFn: async (params: RegisterCallParams): Promise<RegisterCallResponse> => {
      const response = await axios.post("/api/register-call", params);
      return response.data;
    },
  });
};

