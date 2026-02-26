import { useQuery, useQueryClient } from '@tanstack/react-query';
import { InterviewService } from '@/services/interviews.service';
import { Interview } from '@/types/interview';

export const useGetInterviewById = (interviewId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async (): Promise<Interview> => {
      if (!interviewId) { throw new Error('Interview ID is required'); }
      return await InterviewService.getInterviewById(interviewId);
    },
    enabled: !!interviewId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
  };

  return {
    ...query,
    refetch,
  };
};
