import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useDeleteInterview = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post('/api/delete-interview', { id });

      return response.data;
    },
  });
};
