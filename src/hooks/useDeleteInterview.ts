import { useMutation } from '@tanstack/react-query';

export const useDeleteInterview = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/delete-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete interview');
      }

      return res.json();
    },
  });
};
